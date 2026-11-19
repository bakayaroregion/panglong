// PANG LONG STORE — Admin Module (Phase 5)
import { supabase, fetchProducts, fetchCategories } from './supabase.js';

const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
let editingCategory = null;
function setEditingCategory(c) { editingCategory = c; }
let editingProduct = null;

function $(id) { return document.getElementById(id); }

function showLogin() { const el = $('#adminLogin'); if (el) el.classList.remove('hidden'); const app = $('#adminApp'); if (app) app.classList.add('hidden'); }
function showApp() { const el = $('#adminLogin'); if (el) el.classList.add('hidden'); const app = $('#adminApp'); if (app) app.classList.remove('hidden'); }

async function adminLogin(e) {
  e.preventDefault();
  const emailEl = document.getElementById('loginEmail') || document.getElementById('loginUsername');
  const passEl = document.getElementById('loginPassword');
  const email = (emailEl?.value || '').trim();
  const password = passEl?.value || '';
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) { alert('Login gagal: ' + error.message); return; }
  showApp();
  await switchPage(currentAdminPage());
}

async function currentAdminPage() {
  const p = window.location.pathname;
  if (p.includes('orders')) return 'pesanan';
  if (p.includes('products')) return 'produk';
  if (p.includes('categories')) return 'kategori';
  if (p.includes('banners')) return 'banner';
  if (p.includes('promotions')) return 'promo';
  if (p.includes('settings')) return 'settings';
  return 'dashboard';
}

async function checkAdminSession() {
  const { data } = await supabase.auth.getSession();
  if (data.session) { showApp(); await switchPage(currentAdminPage()); }
  else showLogin();
}

async function loadDashboard() {
  const products = await fetchProducts();
  const ordersRes = await supabase.from('orders').select('id, order_number, customer_name, customer_phone, total, status, payment_status, shipping_status, created_at, order_items(*)').order('created_at', { ascending: false });
  const orders = ordersRes.data || [];
  const validOrders = orders.filter((o) => o.status !== 'cancelled');
  const revenue = validOrders.reduce((s, o) => s + Number(o.total || 0), 0);

  const statRevenue = $('#statRevenue'); if (statRevenue) statRevenue.textContent = fmt(revenue);
  const statOrders = $('#statOrders'); if (statOrders) statOrders.textContent = orders.length;
  const statPending = $('#statPending'); if (statPending) statPending.textContent = orders.filter((o) => o.status === 'pending').length;
  const statProcessing = $('#statProcessing'); if (statProcessing) statProcessing.textContent = orders.filter((o) => o.status === 'processing').length;
  const statCompleted = $('#statCompleted'); if (statCompleted) statCompleted.textContent = orders.filter((o) => o.status === 'completed').length;
  const statProducts = $('#statProducts'); if (statProducts) statProducts.textContent = products.length;
  const statActive = $('#statActive'); if (statActive) statActive.textContent = products.filter((p) => p.status === 'active').length;
  const statOut = $('#statOut'); if (statOut) statOut.textContent = products.filter((p) => p.status === 'active' && Number(p.stock) <= 0).length;
  const statLowStock = $('#statLowStock'); if (statLowStock) statLowStock.textContent = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) < 10).length;
  const statCustomers = $('#statCustomers'); if (statCustomers) {
    const { data: customerRows } = await supabase.from('orders').select('customer_id');
    const uniqueCustomers = new Set((customerRows || []).map((o) => o.customer_id).filter(Boolean)).size;
    statCustomers.textContent = uniqueCustomers;
  }

  const lowStockEl = $('#lowStockList');
  if (lowStockEl) {
    const low = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) < 10);
    lowStockEl.innerHTML = low.length
      ? low.map((p) => `<div class="low-item">📦 <strong>${p.name}</strong> — Stok tersisa: ${p.stock}</div>`).join('')
      : '<div class="empty">Semua stok aman.</div>';
  }

  const recentEl = $('#recentOrders');
  if (recentEl) {
    recentEl.innerHTML = orders.slice(0, 5).map((o) => `
      <div class="recent-order">
        <strong>${o.order_number}</strong> — ${o.customer_name} — ${fmt(o.total)} — <span class="status-${o.status}">${o.status}</span>
      </div>`).join('') || '<div class="empty">Belum ada pesanan.</div>';
  }

  const topProductsEl = $('#topProductsList');
  if (topProductsEl) {
    const totals = {};
    (orders || []).forEach((o) => (o.order_items || []).forEach((it) => {
      const key = it.product_id || it.product_name;
      totals[key] = { name: it.product_name, qty: (totals[key]?.qty || 0) + Number(it.qty || 0) };
    }));
    const top = Object.values(totals).sort((a, b) => b.qty - a.qty).slice(0, 5);
    topProductsEl.innerHTML = top.length
      ? top.map((t, i) => `<div class="top-item">🏆 <strong>#${i + 1}</strong> ${t.name} — Terjual: ${t.qty}</div>`).join('')
      : '<div class="empty">Belum ada penjualan.</div>';
  }

  const activityEl = $('#activityList');
  if (activityEl) {
    const { data: logs } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(5);
    activityEl.innerHTML = (logs || []).map((l) => `<div class="low-item">🧾 <strong>${l.action}</strong> — ${l.entity} — ${l.created_at ? new Date(l.created_at).toLocaleString('id-ID') : ''}</div>`).join('') || '<div class="empty">Belum ada aktivitas.</div>';
  }

  const chartEl = $('#salesChart');
  if (chartEl) {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayOrders = validOrders.filter((o) => (o.created_at || '').slice(0, 10) === key);
      days.push({ label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), total: dayOrders.reduce((s, o) => s + Number(o.total || 0), 0) });
    }
    const max = Math.max(1, ...days.map((d) => d.total));
    chartEl.innerHTML = `<div class="chart">${days.map((d) => `
      <div class="chart-col">
        <div class="chart-bar" style="height:${Math.max(4, (d.total / max) * 140)}px"><strong>${fmt(d.total)}</strong></div>
        <span class="chart-label">${d.label}</span>
      </div>`).join('')}</div>`;
  }
}

let currentProducts = [];
let currentPage = 1;
const PRODUCTS_PER_PAGE = 8;

async function loadProductsAdmin() {
  const products = await fetchProducts();
  currentProducts = products;
  const body = $('#productsTableBody');
  if (!body) return;

  const search = ($('#pfSearch')?.value || '').trim().toLowerCase();
  const catFilter = $('#pfCategoryFilter')?.value || '';
  const statusFilter = $('#pfStatusFilter')?.value || '';
  const sort = $('#pfSort')?.value || 'newest';

  const rows = products.filter((p) => {
    const name = (p.name || '').toLowerCase();
    const sku = (p.sku || '').toLowerCase();
    const matchSearch = !search || name.includes(search) || sku.includes(search);
    const matchCat = !catFilter || p.category_id === catFilter;
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  }).sort((a, b) => {
    switch (sort) {
      case 'price_asc': return Number(a.price) - Number(b.price);
      case 'price_desc': return Number(b.price) - Number(a.price);
      case 'stock_asc': return Number(a.stock) - Number(b.stock);
      case 'stock_desc': return Number(b.stock) - Number(a.stock);
      case 'name': return (a.name || '').localeCompare(b.name || '');
      default: return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    }
  });

  const totalPages = Math.max(1, Math.ceil(rows.length / PRODUCTS_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;
  const pageRows = rows.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  body.innerHTML = pageRows.map((p) => `
    <tr>
      <td>${p.categories?.name || '-'}<br><small>${p.name}</small>${p.sku ? `<br><small>SKU: ${p.sku}</small>` : ''}</td>
      <td>${fmt(p.price)}</td>
      <td>${p.stock}</td>
      <td>${p.unit || 'pcs'}</td>
      <td>${p.status}</td>
      <td>
        <button class="btn btn-sm" data-edit="${p.id}">Edit</button>
        <button class="btn btn-sm" data-dup="${p.id}">Duplikat</button>
        <button class="btn btn-sm" data-toggle="${p.id}">${p.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}</button>
        <button class="btn btn-sm btn-danger" data-del="${p.id}">Hapus</button>
      </td>
    </tr>`).join('');

  const pager = $('#productsPager');
  if (pager) {
    pager.querySelector('#productsPagerInfo').textContent = `Page ${currentPage} / ${totalPages}`;
    pager.querySelector('#productsPagerPrev').disabled = currentPage <= 1;
    pager.querySelector('#productsPagerNext').disabled = currentPage >= totalPages;
  }

  body.onclick = async (e) => {
    const edit = e.target.closest('[data-edit]');
    const del = e.target.closest('[data-del]');
    const toggle = e.target.closest('[data-toggle]');
    const dup = e.target.closest('[data-dup]');
    if (edit) { await openProductModal(await fetchProductById(edit.dataset.edit)); return; }
    if (dup) {
      const p = currentProducts.find((x) => x.id === dup.dataset.dup);
      if (!p) return;
      const { error } = await supabase.from('products').insert({
        name: `${p.name} (Salin)`,
        slug: `${p.slug || 'produk'}-${Date.now()}`,
        category_id: p.category_id,
        price: p.price,
        stock: p.stock,
        unit: p.unit,
        status: 'inactive',
        is_featured: false,
        is_new: false,
        description: p.description,
        image: p.image,
        sku: p.sku,
        barcode: p.barcode,
        weight: p.weight,
        dimensions: p.dimensions,
        cost_price: p.cost_price,
        wholesale_price: p.wholesale_price,
        discount_percent: p.discount_percent,
      });
      if (error) alert('Duplikasi gagal: ' + error.message);
      await loadProductsAdmin();
      return;
    }
    if (toggle) {
      const id = toggle.dataset.toggle;
      const p = currentProducts.find((x) => x.id === id);
      if (!p) return;
      const newStatus = p.status === 'active' ? 'inactive' : 'active';
      const { error } = await supabase.from('products').update({ status: newStatus }).eq('id', id);
      if (error) alert('Update status gagal: ' + error.message);
      await loadProductsAdmin();
      return;
    }
    if (del) { if (confirm('Hapus produk ini?')) { const { error } = await supabase.from('products').delete().eq('id', del.dataset.del); if (error) alert(error.message); await loadProductsAdmin(); } return; }
  };
}

async function openProductModal(p) {
  const modalBox = $('#productModalBox');
  if (!modalBox) return;
  if (p) {
    $('#productModalTitle').textContent = 'Edit Produk';
    $('#pfName').value = p.name;
    $('#pfPrice').value = p.price;
    $('#pfStock').value = p.stock;
    $('#pfCostPrice').value = p.cost_price ?? 0;
    $('#pfWholesalePrice').value = p.wholesale_price ?? '';
    $('#pfDiscountPercent').value = p.discount_percent ?? 0;
    $('#pfSku').value = p.sku || '';
    $('#pfBarcode').value = p.barcode || '';
    $('#pfWeight').value = p.weight ?? 0;
    $('#pfDimensions').value = p.dimensions || '';
    $('#pfCategory').value = p.category_id || '';
    $('#pfUnit').value = p.unit || 'pcs';
    $('#pfStatus').value = p.status || 'active';
    $('#pfFeatured').checked = !!p.is_featured;
    $('#pfNew').checked = !!p.is_new;
    $('#pfImage').value = p.image || '';
    $('#pfDesc').value = p.description || '';
    $('#pfId').value = p.id;
    editingProduct = p;
  } else {
    editingProduct = null;
    $('#productModalTitle').textContent = 'Tambah Produk';
    $('#pfName').value = '';
    $('#pfPrice').value = '';
    $('#pfStock').value = '';
    $('#pfCostPrice').value = 0;
    $('#pfWholesalePrice').value = '';
    $('#pfDiscountPercent').value = 0;
    $('#pfSku').value = '';
    $('#pfBarcode').value = '';
    $('#pfWeight').value = 0;
    $('#pfDimensions').value = '';
    $('#pfCategory').value = '';
    $('#pfUnit').value = 'pcs';
    $('#pfStatus').value = 'active';
    $('#pfFeatured').checked = false;
    $('#pfNew').checked = false;
    $('#pfImage').value = '🧱';
    $('#pfDesc').value = '';
    $('#pfId').value = '';
  }
  // populate categories
  const categories = await fetchCategories();
  const sel = $('#pfCategory');
  if (sel) {
    sel.innerHTML = '<option value="">Pilih Kategori</option>' + categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
    if (p?.category_id) { sel.value = p.category_id; }
  }
  modalBox.classList.remove('hidden');
}

async function saveProduct(e) {
  e.preventDefault();
  const id = $('#pfId')?.value;
  const payload = {
    name: $('#pfName')?.value || '',
    price: Number($('#pfPrice')?.value || 0),
    stock: Number($('#pfStock')?.value || 0),
    unit: $('#pfUnit')?.value || 'pcs',
    category_id: $('#pfCategory')?.value || null,
    status: $('#pfStatus')?.value || 'active',
    is_featured: $('#pfFeatured')?.checked || false,
    is_new: $('#pfNew')?.checked || false,
    description: $('#pfDesc')?.value || '',
    image: $('#pfImage')?.value || '',
    sku: $('#pfSku')?.value || null,
    barcode: $('#pfBarcode')?.value || null,
    weight: Number($('#pfWeight')?.value || 0),
    dimensions: $('#pfDimensions')?.value || null,
    cost_price: Number($('#pfCostPrice')?.value || 0),
    wholesale_price: Number($('#pfWholesalePrice')?.value || 0) || null,
    discount_percent: Number($('#pfDiscountPercent')?.value || 0),
  };
  const { error } = id ? await supabase.from('products').update(payload).eq('id', id) : await supabase.from('products').insert(payload);
  if (error) { alert('Simpan gagal: ' + error.message); return; }
  if (id && editingProduct) {
    const oldStock = Number(editingProduct.stock || 0);
    const newStock = Number(payload.stock || 0);
    if (oldStock !== newStock) {
      const { error: invError } = await supabase.from('inventory_movements').insert({
        product_id: id,
        movement_type: 'adjustment',
        qty: newStock - oldStock,
        stock_after: newStock,
        created_by: null,
      });
      if (invError) alert('Gagal mencatat pergerakan stok: ' + invError.message);
    }
  }
  const modalBox = $('#productModalBox');
  if (modalBox) modalBox.classList.add('hidden');
  await loadProductsAdmin();
}

async function loadOrdersAdmin() {
  const search = ($('#orderSearch')?.value || '').trim().toLowerCase();
  const statusFilter = $('#orderStatusFilter')?.value || '';
  const res = await supabase.from('orders').select('id, order_number, customer_name, customer_phone, customer_address, total, status, payment_status, shipping_status, created_at, order_items(*)').order('created_at', { ascending: false });
  let orders = res.data || [];
  if (statusFilter) orders = orders.filter((o) => o.status === statusFilter);
  if (search) orders = orders.filter((o) => (o.order_number || '').toLowerCase().includes(search) || (o.customer_name || '').toLowerCase().includes(search));
  const body = $('#ordersTableBody');
  if (!body) return;
  body.innerHTML = (res.data || []).map((o) => `
    <tr>
      <td>${o.order_number}</td>
      <td>${new Date(o.created_at).toLocaleString('id-ID')}</td>
      <td>${o.customer_name}<br><small>${o.customer_phone || ''}</small></td>
      <td>${fmt(o.total)}</td>
      <td>${o.order_items ? o.order_items.length : 0}</td>
      <td><select data-order="${o.id}" data-field="status">
        <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
        <option value="awaiting_payment" ${o.status === 'awaiting_payment' ? 'selected' : ''}>Awaiting Payment</option>
        <option value="payment_verified" ${o.status === 'payment_verified' ? 'selected' : ''}>Payment Verified</option>
        <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
        <option value="ready_to_ship" ${o.status === 'ready_to_ship' ? 'selected' : ''}>Ready to Ship</option>
        <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
        <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
        <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
      </select></td>
      <td><select data-order="${o.id}" data-field="payment_status">
        <option value="unpaid" ${o.payment_status === 'unpaid' ? 'selected' : ''}>Unpaid</option>
        <option value="paid" ${o.payment_status === 'paid' ? 'selected' : ''}>Paid</option>
        <option value="refunded" ${o.payment_status === 'refunded' ? 'selected' : ''}>Refunded</option>
      </select></td>
      <td><select data-order="${o.id}" data-field="shipping_status">
        <option value="pending" ${o.shipping_status === 'pending' ? 'selected' : ''}>Pending</option>
        <option value="preparing" ${o.shipping_status === 'preparing' ? 'selected' : ''}>Preparing</option>
        <option value="shipped" ${o.shipping_status === 'shipped' ? 'selected' : ''}>Shipped</option>
        <option value="delivered" ${o.shipping_status === 'delivered' ? 'selected' : ''}>Delivered</option>
        <option value="cancelled" ${o.shipping_status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
      </select></td>
    </tr>`).join('');

  body.onclick = async (e) => {
    const sel = e.target.closest('[data-order]');
    if (!sel) return;
    const id = sel.dataset.order;
    const field = sel.dataset.field;
    const value = sel.value;
    const { error } = await supabase.from('orders').update({ [field]: value }).eq('id', id);
    if (error) alert('Update gagal: ' + error.message);
    if (field === 'status') { await supabase.from('order_status_history').insert({ order_id: id, status: value, changed_by: null, note: 'Admin update' }); }
    await loadOrdersAdmin();
  };
}

async function switchPage(page) {
  const map = { dashboard: 'adminDashboard', produk: 'adminProducts', pesanan: 'adminOrders', kategori: 'adminCategories', banner: 'adminBanners', promo: 'adminPromotions', pelanggan: 'adminCustomers', cms: 'adminCms', reports: 'adminReports', users: 'adminUsers', settings: 'adminSettings' };
  const target = document.getElementById(map[page]);
  if (!target) return;
  document.querySelectorAll('.admin-page').forEach((s) => s.classList.add('hidden'));
  document.querySelectorAll('.side-link').forEach((b) => b.classList.toggle('active', b.dataset.page === page));
  target.classList.remove('hidden');
  const titles = { dashboard: 'Dashboard', produk: 'Manajemen Produk', pesanan: 'Kelola Pesanan', kategori: 'Manajemen Kategori', banner: 'Manajemen Banner', promo: 'Manajemen Promo', pelanggan: 'Manajemen Pelanggan', cms: 'Kelola Konten Website', reports: 'Laporan Keuangan', users: 'Manajemen Admin', settings: 'Pengaturan Toko' };
  const titleEl = document.getElementById('adminPageTitle');
  if (titleEl) titleEl.textContent = titles[page] || 'Dashboard';
  if (map[page] === 'adminDashboard') await loadDashboard();
  else if (map[page] === 'adminProducts') await loadProductsAdmin();
  else if (map[page] === 'adminOrders') await loadOrdersAdmin();
  else if (map[page] === 'adminCategories') await loadCategoriesAdmin();
  else if (map[page] === 'adminBanners') await loadBannersAdmin();
  else if (map[page] === 'adminPromotions') await loadPromotionsAdmin();
  else if (map[page] === 'adminCustomers') await loadCustomersAdmin();
  else if (map[page] === 'adminCms') await loadCmsAdmin();
  else if (map[page] === 'adminReports') await loadReportsAdmin();
  else if (map[page] === 'adminUsers') await loadAdminUsersAdmin();
  else if (map[page] === 'adminSettings') await loadSettingsAdmin();
}

let editingOrderId = null;
let editingOrder = null;

async function openOrderModal(id) {
  const { data } = await supabase.from('orders').select('*').eq('id', id).single();
  if (!data) return;
  editingOrderId = id;
  editingOrder = data;
  $('#orderModalTitle').textContent = 'Detail Pesanan — ' + (data.order_number || '');
  $('#orderStatus').value = data.status;
  $('#orderNotes').value = data.notes || '';
  $('#orderDetail').innerHTML = `
    <div style="display:grid;gap:8px">
      <div><strong>Customer:</strong> ${data.customer_name} — ${data.customer_phone || '-'}</div>
      <div><strong>Alamat:</strong> ${data.customer_address || '-'}</div>
      <div><strong>Total:</strong> ${fmt(data.total)}</div>
      <div><strong>Payment Status:</strong> ${data.payment_status} &nbsp;|&nbsp; <strong>Shipping:</strong> ${data.shipping_status}</div>
      <h4 style="margin:10px 0 0">Item Terkait:</h4>
      ${(data.order_items || []).map((it) => `<div class="low-item">📦 ${it.product_name} — ${it.qty} ${it.unit} — ${fmt(it.price)} (${fmt(it.subtotal)})</div>`).join('')}
    </div>`;
}

async function saveOrderStatus() {
  if (!editingOrderId) return;
  const { error } = await supabase.from('orders').update({ status: $('#orderStatus').value }).eq('id', editingOrderId);
  if (error) { alert('Update status gagal: ' + error.message); return; }
  await supabase.from('order_status_history').insert({ order_id: editingOrderId, status: $('#orderStatus').value, changed_by: null, note: 'Admin update' });
  await loadOrdersAdmin();
  closeOrderModal();
}

async function saveOrderNotes() {
  if (!editingOrderId) return;
  const { error } = await supabase.from('orders').update({ notes: $('#orderNotes').value }).eq('id', editingOrderId);
  if (error) { alert('Gagal menyimpan catatan: ' + error.message); return; }
  closeOrderModal();
}

function openOrderWhatsApp() {
  if (!editingOrder) return;
  const phone = (editingOrder.customer_phone || '').replace(/[^0-9]/g, '');
  const text = encodeURIComponent(`Halo kakak, pesanan PANG LONG STORE kami #${editingOrder.order_number} — Total: ${fmt(editingOrder.total)}. Mohon konfirmasi/kirim alamat pengiriman ya 🙏`);
  window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
}

function printOrderInvoice() {
  if (!editingOrder) return;
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;padding:30px">
    <h2>PANG LONG STORE</h2>
    <p>Invoice — ${editingOrder.order_number}</p>
    <p>Customer: ${editingOrder.customer_name} — ${editingOrder.customer_phone}</p>
    <p>Alamat: ${editingOrder.customer_address}</p>
    <p>Total: ${fmt(editingOrder.total)}</p>
    <p>Status: ${editingOrder.status}</p>
    <hr/>
    ${(editingOrder.order_items || []).map((it) => `<p>${it.product_name} — ${it.qty} ${it.unit} — ${fmt(it.subtotal)}</p>`).join('')}
  </body></html>`);
  win.document.close();
  win.focus();
  win.print();
}

function closeOrderModal() { const m = document.getElementById('orderModalBox'); if (m) m.classList.add('hidden'); }

async function loadCustomersAdmin() {
  const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
  const el = document.getElementById('customersList');
  if (!el) return;
  const ordersRes = await supabase.from('orders').select('customer_id, total');
  const spendMap = {};
  (ordersRes.data || []).forEach((o) => { if (o.customer_id) spendMap[o.customer_id] = (spendMap[o.customer_id] || 0) + Number(o.total || 0); });
  el.innerHTML = (data || []).map((c) => `
    <div class="low-item" style="display:flex;justify-content:space-between;align-items:center;gap:10px">
      <span>👥 <strong>${c.name}</strong> — <small>${c.phone}</small>${c.address ? ` — ${c.address}` : ''}</span>
      <span style="display:flex;gap:6px;flex-shrink:0">
        <span style="font-size:12px;color:var(--muted);align-self:center">Spend: ${fmt(spendMap[c.id] || 0)}</span>
        <button class="btn btn-sm btn-danger" data-cust-del="${c.id}">Hapus</button>
      </span>
    </div>`).join('');
}

async function loadCmsAdmin() {
  const { data: pages } = await supabase.from('pages').select('*').order('updated_at', { ascending: false });
  const el = document.getElementById('pagesList');
  if (el) el.innerHTML = (pages || []).map((p) => `<div class="low-item">📄 <strong>${p.title}</strong> — <small>${p.key}</small></div>`).join('');
}

async function loadAdminUsersAdmin() {
  const { data } = await supabase.from('admin_roles').select('id, admin_id, role, is_active, profiles(email, full_name)').eq('is_active', true);
  const el = document.getElementById('adminUsersList');
  if (!el) return;
  el.innerHTML = (data || []).map((r) => `
    <div class="low-item" style="display:flex;justify-content:space-between;align-items:center;gap:10px">
      <span>👑 <strong>${r.profiles?.email || r.admin_id}</strong> — <small>${r.role}</small></span>
      <span style="display:flex;gap:6px;flex-shrink:0">
        <button class="btn btn-sm" data-au-toggle="${r.id}" data-au-status="${r.is_active === false ? 'inactive' : 'active'}">${r.is_active === false ? 'Aktifkan' : 'Nonaktifkan'}</button>
        <button class="btn btn-sm btn-danger" data-au-del="${r.id}">Hapus</button>
      </span>
    </div>`).join('');
  const auSel = document.getElementById('auAdminId');
  if (auSel) { auSel.innerHTML = '<option value="">Pilih Admin</option>' + (await supabase.from('profiles').select('id, email, role').eq('role', 'admin')).data.map((p) => `<option value="${p.id}">${p.email}</option>`).join(''); }
  await loadAuditLogs();
}

async function loadPermsAdmin() {
  const { data } = await supabase.from('role_permissions').select('*').order('created_at', { ascending: false });
  const el = document.getElementById('permList');
  if (!el) return;
  el.innerHTML = (data || []).map((p) => `<div class="low-item">🔐 <strong>${p.role}</strong> — ${p.module}:${p.action}</div>`).join('');
}

async function loadAuditLogs() {
  const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(20);
  const el = document.getElementById('auditList');
  if (!el) return;
  el.innerHTML = (data || []).map((l) => `<div class="low-item">🧾 <strong>${l.action}</strong> — ${l.entity} — ${l.created_at ? new Date(l.created_at).toLocaleString('id-ID') : ''}</div>`).join('');
}

let lastOrders = [];

async function loadReportsAdmin() {
  const orders = (await supabase.from('orders').select('*').order('created_at', { ascending: false })).data || [];
  lastOrders = orders;
  const valid = orders.filter((o) => o.status !== 'cancelled');
  const revenue = valid.reduce((s, o) => s + Number(o.total || 0), 0);
  const received = orders.filter((o) => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total || 0), 0);
  const products = await fetchProducts();
  const costMap = {};
  products.forEach((p) => { costMap[p.id] = Number(p.cost_price || 0); });
  let cogs = 0;
  valid.forEach((o) => (o.order_items || []).forEach((it) => { const cost = it.product_id ? (costMap[it.product_id] ?? 0) : 0; cogs += cost * Number(it.qty || 0); }));
  const gross = revenue - cogs;
  const { data: expenses } = await supabase.from('expenses').select('amount');
  const expenseTotal = (expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const net = gross - expenseTotal;

  const statRevenue = $('#rptRevenue'); if (statRevenue) statRevenue.textContent = fmt(revenue);
  const statReceived = $('#rptReceived'); if (statReceived) statReceived.textContent = fmt(received);
  const statGross = $('#rptGross'); if (statGross) statGross.textContent = fmt(gross);
  const statExpense = $('#rptExpense'); if (statExpense) statExpense.textContent = fmt(expenseTotal);
  const statNet = $('#rptNet'); if (statNet) statNet.textContent = fmt(net);

  const list = $('#rptOrdersList');
  if (list) list.innerHTML = lastOrders.slice(0, 10).map((o) => `<div class="low-item">🧾 <strong>${o.order_number}</strong> — ${o.customer_name} — ${fmt(o.total)} — <span class="status-${o.status}">${o.status}</span></div>`).join('');
}

function saveOrdersCSV() {
  const header = ['Order','Tanggal','Customer','Phone','Address','Total','Status','Payment','Shipping','Items'];
  const rows = lastOrders.map((o) => [o.order_number, new Date(o.created_at).toISOString(), o.customer_name, o.customer_phone, o.customer_address, o.total, o.status, o.payment_status, o.shipping_status, (o.order_items || []).length].map((v) => `"${String(v ?? '')}"`).join(','));
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'panglong-orders.csv';
  a.click();
  URL.revokeObjectURL(url);
}

async function loadCategoriesAdmin() {
  const { data } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
  const el = document.getElementById('adminCategoriesList');
  if (!el) return;
  el.innerHTML = (data || []).map((c) => `
    <div class="low-item" style="display:flex;justify-content:space-between;align-items:center;gap:10px">
      <span>🗂️ <strong>${c.name}</strong> — <small>${c.slug}</small>${c.icon ? ` — ${c.icon}` : ''}</span>
      <span style="display:flex;gap:6px;flex-shrink:0">
        <button class="btn btn-sm" data-cat-edit="${c.id}">Edit</button>
        <button class="btn btn-sm" data-cat-toggle="${c.id}" data-cat-status="${c.is_active === false ? 'inactive' : 'active'}">${c.is_active === false ? 'Aktifkan' : 'Nonaktifkan'}</button>
        <button class="btn btn-sm btn-danger" data-cat-del="${c.id}">Hapus</button>
      </span>
    </div>`).join('');
}

async function loadBannersAdmin() {
  const { data } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
  const el = document.getElementById('adminBannersList');
  if (!el) return;
  el.innerHTML = (data || []).map((b) => `<div class="low-item">📢 <strong>${b.title}</strong> — ${b.subtitle || ''}</div>`).join('');
}

async function loadPromotionsAdmin() {
  const { data } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
  const el = document.getElementById('adminPromotionsList');
  if (!el) return;
  el.innerHTML = (data || []).map((p) => `
    <div class="low-item" style="display:flex;justify-content:space-between;align-items:center;gap:10px">
      <span>🎁 <strong>${p.title}</strong> — Diskon ${p.discount_type === 'nominal' ? fmt(p.discount_value) : p.discount_percent + '%'}${p.max_discount ? ` (Max: ${fmt(p.max_discount)})` : ''}</span>
      <span style="display:flex;gap:6px;flex-shrink:0">
        <button class="btn btn-sm" data-promo-toggle="${p.id}" data-promo-status="${p.is_active === false ? 'inactive' : 'active'}">${p.is_active === false ? 'Aktifkan' : 'Nonaktifkan'}</button>
        <button class="btn btn-sm btn-danger" data-promo-del="${p.id}">Hapus</button>
      </span>
    </div>`).join('');
  const prodSelect = document.getElementById('promoProduct');
  if (prodSelect) { prodSelect.innerHTML = '<option value="">Pilih Produk</option>' + (await fetchProducts()).map((p) => `<option value="${p.id}">${p.name}</option>`).join(''); }
}

async function loadSettingsAdmin() {
  const { data } = await supabase.from('store_settings').select('*');
  const el = document.getElementById('adminSettings');
  if (!el) return;
  const s = data && data[0];
  if (!s) return;
}

async function init() {
  document.querySelectorAll('.side-link').forEach((b) => {
    b.addEventListener('click', () => {
      if (b.id === 'logoutBtn') return;
      switchPage(b.dataset.page);
    });
  });
  const adminDate = document.getElementById('adminDate');
  if (adminDate) adminDate.textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const pfSearch = document.getElementById('pfSearch');
  if (pfSearch) pfSearch.addEventListener('input', () => { currentPage = 1; loadProductsAdmin(); });
  const pfCategoryFilter = document.getElementById('pfCategoryFilter');
  if (pfCategoryFilter) pfCategoryFilter.addEventListener('change', () => { currentPage = 1; loadProductsAdmin(); });
  const pfStatusFilter = document.getElementById('pfStatusFilter');
  if (pfStatusFilter) pfStatusFilter.addEventListener('change', () => { currentPage = 1; loadProductsAdmin(); });
  const pfSort = document.getElementById('pfSort');
  if (pfSort) pfSort.addEventListener('change', () => { currentPage = 1; loadProductsAdmin(); });
  document.addEventListener('click', async (e) => {
    const pageBtn = e.target.closest('#productsPager button[data-page]');
    if (pageBtn) { currentPage = Number(pageBtn.dataset.page); await loadProductsAdmin(); return; }
    const catEdit = e.target.closest('[data-cat-edit]');
    const catDel = e.target.closest('[data-cat-del]');
    const catToggle = e.target.closest('[data-cat-toggle]');
    if (catEdit) {
      const cats = await fetchCategories();
      const c = (cats || []).find((x) => x.id === catEdit.dataset.catEdit);
      if (c) { editingCategory = c; $('#catName').value = c.name; $('#catSlug').value = c.slug; $('#catOrder').value = c.display_order || 0; $('#catIcon').value = c.icon || ''; $('#catActive').checked = c.is_active !== false; }
      return;
    }
    if (catDel) { if (confirm('Hapus kategori ini?')) { const { error } = await supabase.from('categories').delete().eq('id', catDel.dataset.catDel); if (error) alert('Gagal menghapus kategori: ' + error.message); await loadCategoriesAdmin(); } return; }
    if (catToggle) {
      const id = catToggle.dataset.catToggle;
      const status = catToggle.dataset.catStatus;
      const { error } = await supabase.from('categories').update({ is_active: status === 'active' }).eq('id', id);
      if (error) alert('Update kategori gagal: ' + error.message);
      await loadCategoriesAdmin();
      return;
    }
  });
  const orderSaveStatus = document.getElementById('orderSaveStatus');
  if (orderSaveStatus) orderSaveStatus.addEventListener('click', saveOrderStatus);
  const orderSaveNotes = document.getElementById('orderSaveNotes');
  if (orderSaveNotes) orderSaveNotes.addEventListener('click', saveOrderNotes);
  const orderWhatsAppBtn = document.getElementById('orderWhatsApp');
  if (orderWhatsAppBtn) orderWhatsAppBtn.addEventListener('click', openOrderWhatsApp);
  const orderPrint = document.getElementById('orderPrint');
  if (orderPrint) orderPrint.addEventListener('click', printOrderInvoice);
  const rptExportCsv = document.getElementById('rptExportCsv');
  if (rptExportCsv) rptExportCsv.addEventListener('click', saveOrdersCSV);
  const orderModalClose = document.getElementById('orderModalClose');
  if (orderModalClose) orderModalClose.addEventListener('click', () => { const m = document.getElementById('orderModalBox'); if (m) m.classList.add('hidden'); });
  const cmsAnnouncementForm = document.getElementById('cmsAnnouncementForm');
  if (cmsAnnouncementForm) cmsAnnouncementForm.addEventListener('submit', async (e) => { e.preventDefault(); const { error } = await supabase.from('store_settings').update({ announcement: $('#cmsAnnouncement').value }).eq('id', (await supabase.from('store_settings').select('id').limit(1).single())?.data?.id); if (error) alert('Gagal menyimpan pengumuman: ' + error.message); });
  const cmsFaqForm = document.getElementById('cmsFaqForm');
  if (cmsFaqForm) cmsFaqForm.addEventListener('submit', async (e) => { e.preventDefault(); const { error } = await supabase.from('faqs').insert({ question: $('#faqQuestion').value, answer: $('#faqAnswer').value, category: $('#faqCategory').value }); if (error) alert('Gagal menyimpan FAQ: ' + error.message); $('#faqQuestion').value = ''; $('#faqAnswer').value = ''; $('#faqCategory').value = ''; });
  const cmsTstForm = document.getElementById('cmsTstForm');
  if (cmsTstForm) cmsTstForm.addEventListener('submit', async (e) => { e.preventDefault(); const { error } = await supabase.from('testimonials').insert({ customer_name: $('#tstName').value, content: $('#tstContent').value, rating: Number($('#tstRating').value || 5) }); if (error) alert('Gagal menyimpan testimoni: ' + error.message); $('#tstName').value = ''; $('#tstContent').value = ''; });
  const cmsPageForm = document.getElementById('cmsPageForm');
  if (cmsPageForm) cmsPageForm.addEventListener('submit', async (e) => { e.preventDefault(); const { error } = await supabase.from('pages').upsert({ key: $('#cmsPageKey').value, title: $('#cmsPageTitle').value, content: $('#cmsPageContent').value, is_published: $('#cmsPagePublished').checked }); if (error) alert('Gagal menyimpan halaman: ' + error.message); });
  const promoForm = document.getElementById('promoForm');
  if (promoForm) promoForm.addEventListener('submit', async (e) => { e.preventDefault(); const payload = { title: $('#promoTitle').value, description: $('#promoDesc').value, discount_type: $('#promoType').value, discount_value: Number($('#promoValue').value || 0), max_discount: Number($('#promoMaxDiscount').value || 0) || null, min_purchase: Number($('#promoMinPurchase').value || 0), start_date: $('#promoStart').value || null, end_date: $('#promoEnd').value || null, applies_to: $('#promoAppliesTo').value, product_id: $('#promoProduct').value || null, is_active: true }; const { error } = await supabase.from('promotions').insert(payload); if (error) { alert('Gagal menyimpan promo: ' + error.message); return; } promoForm.reset(); await loadPromotionsAdmin(); });
  document.addEventListener('click', async (e) => {
    const promoToggle = e.target.closest('[data-promo-toggle]');
    const promoDel = e.target.closest('[data-promo-del]');
    if (promoToggle) { const { error } = await supabase.from('promotions').update({ is_active: promoToggle.dataset.promoStatus === 'inactive' }).eq('id', promoToggle.dataset.promoToggle); if (error) alert('Update promo gagal: ' + error.message); await loadPromotionsAdmin(); return; }
    if (promoDel) { if (confirm('Hapus promo ini?')) { const { error } = await supabase.from('promotions').delete().eq('id', promoDel.dataset.promoDel); if (error) alert('Gagal menghapus promo: ' + error.message); await loadPromotionsAdmin(); } return; }
  });
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', adminLogin);
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', async () => { await supabase.auth.signOut(); showLogin(); });
  const openModalBtn = document.getElementById('openProductModal');
  if (openModalBtn) openModalBtn.addEventListener('click', async () => await openProductModal(null));
  const modalClose = document.getElementById('productModalBoxClose');
  if (modalClose) modalClose.addEventListener('click', () => { const m = document.getElementById('productModalBox'); if (m) m.classList.add('hidden'); });
  const productForm = document.getElementById('productForm');
  if (productForm) productForm.addEventListener('submit', saveProduct);
  const categoryForm = document.getElementById('categoryForm');
  if (categoryForm) categoryForm.addEventListener('submit', async (e) => { e.preventDefault(); const payload = { name: $('#catName').value, slug: $('#catSlug').value, display_order: Number($('#catOrder')?.value || 0), icon: $('#catIcon')?.value || null, is_active: $('#catActive')?.checked ?? true }; const { error } = editingCategory ? await supabase.from('categories').update(payload).eq('id', editingCategory.id) : await supabase.from('categories').insert(payload); if (error) { alert('Gagal menyimpan kategori: ' + error.message); return; } setEditingCategory(null); categoryForm.reset(); await loadCategoriesAdmin(); });
  const bannersList = document.getElementById('adminBannersList');
  if (bannersList) bannersList.addEventListener('click', async (e) => { const b = e.target.closest('[data-banner]'); if (!b) return; const { error } = await supabase.from('banners').update({ is_active: !b.dataset.active }).eq('id', b.dataset.banner); if (error) alert('Gagal: ' + error.message); await loadBannersAdmin(); });
  const promosList = document.getElementById('adminPromotionsList');
  if (promosList) promosList.addEventListener('click', async (e) => { const p = e.target.closest('[data-promo]'); if (!p) return; const { error } = await supabase.from('promotions').update({ is_active: !p.dataset.active }).eq('id', p.dataset.promo); if (error) alert('Gagal: ' + error.message); await loadPromotionsAdmin(); });
  const settingsForm = document.getElementById('settingsForm');
  if (settingsForm) settingsForm.addEventListener('submit', async (e) => { e.preventDefault(); const { data: sList } = await supabase.from('store_settings').select('id'); const settingsId = sList?.[0]?.id; const { error } = await supabase.from('store_settings').update({ store_name: $('#setStoreName').value, whatsapp_number: $('#setWhatsappNumber').value, address: $('#setAddress').value, phone: $('#setPhone').value, email: $('#setEmail').value, hours: $('#setHours').value }).eq('id', settingsId); if (error) alert('Gagal menyimpan pengaturan: ' + error.message); });
  const adminUserForm = document.getElementById('adminUserForm');
  if (adminUserForm) adminUserForm.addEventListener('submit', async (e) => { e.preventDefault(); const payload = { admin_id: $('#auAdminId').value, role: $('#auRole').value, is_active: $('#auActive')?.checked ?? true }; const { error } = await supabase.from('admin_roles').insert(payload); if (error) { alert('Gagal menyimpan admin: ' + error.message); return; } adminUserForm.reset(); await loadAdminUsersAdmin(); });
  const permForm = document.getElementById('permForm');
  if (permForm) permForm.addEventListener('submit', async (e) => { e.preventDefault(); const { error } = await supabase.from('role_permissions').insert({ role: $('#permRole').value, module: $('#permModule').value, action: $('#permAction').value }); if (error) { alert('Gagal menyimpan permission: ' + error.message); return; } $('#permModule').value = ''; $('#permAction').value = ''; await loadPermsAdmin(); });
  document.addEventListener('click', async (e) => {
    const auToggle = e.target.closest('[data-au-toggle]');
    const auDel = e.target.closest('[data-au-del]');
    if (auToggle) { const { error } = await supabase.from('admin_roles').update({ is_active: auToggle.dataset.auStatus === 'inactive' }).eq('id', auToggle.dataset.auToggle); if (error) alert('Update admin gagal: ' + error.message); await loadAdminUsersAdmin(); return; }
    if (auDel) { if (confirm('Hapus admin ini?')) { const { error } = await supabase.from('admin_roles').delete().eq('id', auDel.dataset.auDel); if (error) alert('Gagal menghapus admin: ' + error.message); await loadAdminUsersAdmin(); } return; }
  });

  await switchPage(currentAdminPage());
}

document.addEventListener('DOMContentLoaded', async () => {
  try { await init(); } catch (e) { console.error(e); }
});
