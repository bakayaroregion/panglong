// PANG LONG STORE — Admin Module (Phase 5)
import { supabase, fetchProducts, fetchCategories } from './supabase.js';

const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

function $(id) { return document.getElementById(id); }

function showLogin() { const el = $('#adminLogin'); if (el) el.classList.add('hidden'); const app = $('#adminApp'); if (app) app.classList.remove('hidden'); }
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
  await loadDashboard();
}

async function checkAdminSession() {
  const { data } = await supabase.auth.getSession();
  if (data.session) { showApp(); await loadDashboard(); }
  else showLogin();
}

async function loadDashboard() {
  const products = await fetchProducts();
  const categories = await fetchCategories();
  const ordersRes = await supabase.from('orders').select('id, order_number, customer_name, customer_phone, total, status, payment_status, shipping_status, created_at, order_items(*)').order('created_at', { ascending: false });
  const orders = ordersRes.data || [];
  const validOrders = orders.filter((o) => o.status !== 'cancelled');
  const revenue = validOrders.reduce((s, o) => s + Number(o.total || 0), 0);

  const statProducts = $('#statProducts'); if (statProducts) statProducts.textContent = products.length;
  const statCategories = $('#statCategories'); if (statCategories) statCategories.textContent = categories.length;
  const statOrders = $('#statOrders'); if (statOrders) statOrders.textContent = orders.length;
  const statRevenue = $('#statRevenue'); if (statRevenue) statRevenue.textContent = fmt(revenue);

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

async function loadProductsAdmin() {
  const products = await fetchProducts();
  const body = $('#productsTableBody');
  if (!body) return;
  body.innerHTML = products.map((p) => `
    <tr>
      <td>${p.categories?.name || '-'}<br><small>${p.name}</small></td>
      <td>${fmt(p.price)}</td>
      <td>${p.stock}</td>
      <td>${p.unit || 'pcs'}</td>
      <td>${p.status}</td>
      <td>
        <button class="btn btn-sm" data-edit="${p.id}">Edit</button>
        <button class="btn btn-sm btn-danger" data-del="${p.id}">Hapus</button>
      </td>
    </tr>`).join('');

  body.onclick = async (e) => {
    const edit = e.target.closest('[data-edit]');
    const del = e.target.closest('[data-del]');
    if (edit) { await openProductModal(await fetchProductById(edit.dataset.edit)); return; }
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
    $('#pfCategory').value = p.category_id || '';
    $('#pfUnit').value = p.unit || 'pcs';
    $('#pfStatus').value = p.status || 'active';
    $('#pfFeatured').checked = !!p.is_featured;
    $('#pfNew').checked = !!p.is_new;
    $('#pfImage').value = p.image || '';
    $('#pfDesc').value = p.description || '';
    $('#pfId').value = p.id;
  } else {
    $('#productModalTitle').textContent = 'Tambah Produk';
    $('#pfName').value = '';
    $('#pfPrice').value = '';
    $('#pfStock').value = '';
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
  };
  const { error } = id ? await supabase.from('products').update(payload).eq('id', id) : await supabase.from('products').insert(payload);
  if (error) { alert('Simpan gagal: ' + error.message); return; }
  const modalBox = $('#productModalBox');
  if (modalBox) modalBox.classList.add('hidden');
  await loadProductsAdmin();
}

async function loadOrdersAdmin() {
  const res = await supabase.from('orders').select('id, order_number, customer_name, customer_phone, customer_address, total, status, payment_status, shipping_status, created_at, order_items(*)').order('created_at', { ascending: false });
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
        <option value="paid" ${o.status === 'paid' ? 'selected' : ''}>Paid</option>
        <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
        <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Completed</option>
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
    await loadOrdersAdmin();
  };
}

function switchPage(page) {
  const map = { dashboard: 'adminDashboard', produk: 'adminProducts', pesanan: 'adminOrders' };
  const target = document.getElementById(map[page]);
  if (!target) return;
  document.querySelectorAll('.admin-page').forEach((s) => s.classList.add('hidden'));
  document.querySelectorAll('.side-link').forEach((b) => b.classList.toggle('active', b.dataset.page === page));
  target.classList.remove('hidden');
}

async function loadCategoriesAdmin() {
  const { data } = await supabase.from('categories').select('*').order('name');
  const el = document.getElementById('adminCategories');
  if (!el) return;
  el.innerHTML = (data || []).map((c) => `<div class="low-item">🗂️ <strong>${c.name}</strong> — <small>${c.slug}</small></div>`).join('');
}

async function loadBannersAdmin() {
  const { data } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
  const el = document.getElementById('adminBanners');
  if (!el) return;
  el.innerHTML = (data || []).map((b) => `<div class="low-item">📢 <strong>${b.title}</strong> — ${b.subtitle || ''}</div>`).join('');
}

async function loadPromotionsAdmin() {
  const { data } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
  const el = document.getElementById('adminPromotions');
  if (!el) return;
  el.innerHTML = (data || []).map((p) => `<div class="low-item">🎁 <strong>${p.title}</strong> — Diskon ${p.discount_percent}%</div>`).join('');
}

async function loadSettingsAdmin() {
  const { data } = await supabase.from('store_settings').select('*');
  const el = document.getElementById('adminSettings');
  if (!el) return;
  const s = data && data[0];
  if (!s) return;
}

async function init() {
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
  const ordersBody = document.getElementById('ordersTableBody');
  if (ordersBody) ordersBody.addEventListener('click', async (e) => {
    const sel = e.target.closest('[data-order]');
    if (!sel) return;
    const id = sel.dataset.order;
    const field = sel.dataset.field;
    const value = sel.value;
    const { error } = await supabase.from('orders').update({ [field]: value }).eq('id', id);
    if (error) alert('Update gagal: ' + error.message);
    await loadOrdersAdmin();
  });

  const categoryForm = document.getElementById('categoryForm');
  if (categoryForm) categoryForm.addEventListener('submit', async (e) => { e.preventDefault(); const { error } = await supabase.from('categories').insert({ name: $('#catName').value, slug: $('#catSlug').value }); if (error) alert('Gagal menyimpan kategori: ' + error.message); await loadCategoriesAdmin(); categoryForm.reset(); });
  const bannersList = document.getElementById('adminBannersList');
  if (bannersList) bannersList.addEventListener('click', async (e) => { const b = e.target.closest('[data-banner]'); if (!b) return; const { error } = await supabase.from('banners').update({ is_active: !b.dataset.active }).eq('id', b.dataset.banner); if (error) alert('Gagal: ' + error.message); await loadBannersAdmin(); });
  const promosList = document.getElementById('adminPromotionsList');
  if (promosList) promosList.addEventListener('click', async (e) => { const p = e.target.closest('[data-promo]'); if (!p) return; const { error } = await supabase.from('promotions').update({ is_active: !p.dataset.active }).eq('id', p.dataset.promo); if (error) alert('Gagal: ' + error.message); await loadPromotionsAdmin(); });
  const settingsForm = document.getElementById('settingsForm');
  if (settingsForm) settingsForm.addEventListener('submit', async (e) => { e.preventDefault(); const { error } = await supabase.from('store_settings').update({ store_name: $('#setStoreName').value, whatsapp_number: $('#setWhatsappNumber').value, address: $('#setAddress').value, phone: $('#setPhone').value, email: $('#setEmail').value, hours: $('#setHours').value }); if (error) alert('Gagal menyimpan pengaturan: ' + error.message); });

  const dashboard = document.getElementById('adminDashboard');
  const products = document.getElementById('adminProducts');
  const orders = document.getElementById('adminOrders');
  const categories = document.getElementById('adminCategories');
  const banners = document.getElementById('adminBanners');
  const promotions = document.getElementById('adminPromotions');
  const settings = document.getElementById('adminSettings');

  if (dashboard && !dashboard.classList.contains('hidden')) await loadDashboard();
  else if (products && !products.classList.contains('hidden')) await loadProductsAdmin();
  else if (orders && !orders.classList.contains('hidden')) await loadOrdersAdmin();
  else if (categories) await loadCategoriesAdmin();
  else if (banners) await loadBannersAdmin();
  else if (promotions) await loadPromotionsAdmin();
  else if (settings) await loadSettingsAdmin();
}

document.addEventListener('DOMContentLoaded', async () => {
  try { await init(); } catch (e) { console.error(e); }
});
