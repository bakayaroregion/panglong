// PANG LONG STORE — App Bootstrap & Homepage/Cart Wiring
import { fetchProducts, fetchCategories } from './supabase.js';
import { addToCart, getCart, getCartDetailed, getCartCount, setQty, removeFromCart, clearCart } from './cart.js';
import { openWhatsAppCheckout } from './checkout.js';
import { STORE } from '../config.js';

const IMG_FALLBACK = {
  'semen-mortar': 'assets/images/semen-portland.jpg',
  'pasir-batu': 'assets/images/pasir-bangunan.jpg',
  'besi-baja': 'assets/images/besi-beton.jpg',
  'cat-pelapis': 'assets/images/cat-tembok.jpg',
  'perkakas-tools': 'assets/images/palu-tukang.jpg',
  'plumbing': 'assets/images/pipa-pvc.jpg',
};

const FALLBACK_PRODUCTS = [
  { id: 'p1', name: 'Semen Portland 50 KG', slug: 'semen-portland-50kg', description: 'Semen Portland 50 kg untuk konstruksi struktural.', price: 145000, unit: 'sak', stock: 40, status: 'active', is_featured: true, is_new: false, categories: { name: 'Semen & Mortar', slug: 'semen-mortar' } },
];

let products = [];
const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

function productImage(p) {
  const imgs = Array.isArray(p.product_images) ? p.product_images : (p.product_images ? [p.product_images] : []);
  const primary = imgs.find((i) => i.is_primary) || imgs[0];
  const url = primary?.url || p.image;
  const slug = p.categories?.slug || 'umum';
  const found = Object.keys(IMG_FALLBACK).find((k) => slug.includes(k));
  return url || (found ? IMG_FALLBACK[found] : 'assets/images/semen-portland.jpg');
}

function badgeHTML(p) {
  if (p.is_featured) return '<span class="badge badge-accent">Terlaris</span>';
  if (p.is_new) return '<span class="badge badge-accent">Terbaru</span>';
  return '';
}

function productCardHTML(p) {
  const outOfStock = Number(p.stock) <= 0;
  const catName = p.categories?.name || 'Material Bangunan';
  return `
    <article class="product-card" data-id="${p.id}">
      <div class="product-media">
        <img src="${productImage(p)}" alt="${p.name}" loading="lazy" decoding="async">
        ${badgeHTML(p)}
      </div>
      <div class="product-info">
        <span class="product-cat">${catName}</span>
        <h3 class="product-name"><a href="pages/product-detail.html?id=${p.id}">${p.name}</a></h3>
        <p class="product-unit">Per ${p.unit || 'pcs'}</p>
        <div class="product-price">${fmt(p.price)}</div>
        <p class="product-stock">Stok: ${p.stock ?? 0}</p>
        <div class="product-actions">
          <button class="btn btn-accent" data-add="${p.id}" ${outOfStock ? 'disabled' : ''}>Add to Cart</button>
          <button class="btn btn-dark" data-detail="${p.id}">Detail</button>
        </div>
      </div>
    </article>`;
}

async function api(url, options = {}) {
  return fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } }).then(async (r) => {
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || 'Request gagal');
    return data;
  });
}

function updateCartBadge() { const el = document.getElementById('cartCount'); if (el) el.textContent = getCartCount(); }

async function renderCategories() {
  const grid = document.querySelector('.category-grid');
  if (!grid) return;
  try {
    const categories = await fetchCategories();
    if (!categories.length) return;
    grid.innerHTML = categories.slice(0, 8).map((c) => `
      <a class="category-card" href="pages/products.html?cat=${c.slug}">
        <div class="category-icon">🏗️</div>
        <h3>${c.name}</h3>
      </a>`).join('');
  } catch (e) { /* fallback */ }
}

async function renderProducts(targetId, products, limit) {
  const grid = document.getElementById(targetId);
  if (!grid) return;
  const list = (products || []).slice(0, limit || products.length);
  if (!list.length) { grid.innerHTML = '<div class="empty">Belum ada produk.</div>'; return; }
  grid.innerHTML = list.map(productCardHTML).join('');
}

function scrollToProducts() { document.getElementById('produk')?.scrollIntoView({ behavior: 'smooth' }); }

async function initHomepage() {
  updateCartBadge();

  const cartBtn = document.getElementById('cartBtn');
  const heroCta = document.querySelector('.hero .btn-accent');
  const searchInput = document.getElementById('headerSearch');
  const gridTerlaris = document.getElementById('grid-terlaris');
  const gridTerbaru = document.getElementById('grid-terbaru');
  const gridRekomendasi = document.getElementById('grid-rekomendasi');
  const gridKategori = document.querySelector('.category-grid');

  if (heroCta) heroCta.addEventListener('click', scrollToProducts);
  if (cartBtn) cartBtn.addEventListener('click', () => { window.location.href = 'pages/cart.html'; });

  if (searchInput) {
    searchInput.addEventListener('input', async () => {
      const q = searchInput.value.trim().toLowerCase();
      const products = await fetchProducts().catch(() => FALLBACK_PRODUCTS);
      const filtered = q ? products.filter((p) => (p.name || '').toLowerCase().includes(q)) : products;
      await renderProducts('grid-terlaris', filtered.slice(0, 4));
      await renderProducts('grid-terbaru', filtered.slice(0, 4));
      await renderProducts('grid-rekomendasi', filtered.slice(0, 2));
    });
  }

  // Event delegation: mendukung tombol Add to Cart / Detail pada kartu yang di-render dinamis
  document.addEventListener('click', async (e) => {
    const addBtn = e.target.closest('[data-add]');
    const detailBtn = e.target.closest('[data-detail]');
    if (addBtn) {
      const id = addBtn.dataset.add;
      const products = await fetchProducts().catch(() => FALLBACK_PRODUCTS);
      const p = products.find((x) => String(x.id) === String(id));
      if (!p) return;
      addToCart(p.id, 1);
      updateCartBadge();
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = 'Ditambahkan ke keranjang ✓';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1800);
      return;
    }
    if (detailBtn) {
      const id = detailBtn.dataset.detail;
      const products = await fetchProducts().catch(() => FALLBACK_PRODUCTS);
      const p = products.find((x) => String(x.id) === String(id));
      if (p) window.location.href = 'pages/product-detail.html?id=' + p.id;
    }
  });

  if (gridKategori) await renderCategories();
  try {
    const products = await fetchProducts();
    await renderProducts('grid-terlaris', products.filter((p) => p.is_featured).length ? products.filter((p) => p.is_featured) : products, 4);
    await renderProducts('grid-terbaru', products.filter((p) => p.is_new), 4);
    await renderProducts('grid-rekomendasi', products.slice(0, 2), 2);
  } catch (e) {
    await renderProducts('grid-terlaris', FALLBACK_PRODUCTS.filter((p) => p.is_featured), 4);
    await renderProducts('grid-terbaru', FALLBACK_PRODUCTS.filter((p) => p.is_new), 4);
    await renderProducts('grid-rekomendasi', FALLBACK_PRODUCTS.slice(0, 2), 2);
  }
}

async function initCartPage() {
  const listEl = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmpty');
  const summaryEl = document.getElementById('cartSummary');
  const checkoutBtn = document.getElementById('cartCheckout');
  const cancelBtn = document.getElementById('cartCancel');
  if (!listEl || !emptyEl || !summaryEl || !checkoutBtn) return;

  const load = async () => {
    const list = await fetchProducts().catch(() => []);
    products = list;
    renderCart();
  };

  const renderCart = () => {
    const detailed = getCartDetailed(products);
    if (!detailed.length) {
      listEl.innerHTML = '';
      emptyEl.classList.remove('hidden');
      summaryEl.classList.add('hidden');
      return;
    }
    emptyEl.classList.add('hidden');
    summaryEl.classList.remove('hidden');
    listEl.innerHTML = detailed.map((i) => `
      <div class="drawer-item">
        <div class="di-img">${i.product.image || ''}</div>
        <div class="di-info">
          <h4>${i.product.name}</h4>
          <p>${fmt(i.product.price)} / ${i.product.unit || 'pcs'}</p>
        </div>
        <div class="di-right">
          <div class="qty qty-sm">
            <button type="button" data-qty-minus="${i.productId}">-</button>
            <input type="number" value="${i.qty}" min="1" data-qty-input="${i.productId}">
            <button type="button" data-qty-plus="${i.productId}">+</button>
          </div>
          <button class="remove-btn" data-rm="${i.productId}">Hapus</button>
        </div>
      </div>`).join('');

    let subtotal = 0;
    for (const i of detailed) subtotal += Number(i.product.price || 0) * Number(i.qty || 1);
    document.getElementById('cartSubtotal').textContent = fmt(subtotal);
    const shipping = Number(document.getElementById('coShipping')?.value) || 0;
    document.getElementById('cartTotal').textContent = fmt(subtotal + shipping);
  };

  listEl.addEventListener('click', async (e) => {
    const plus = e.target.closest('[data-qty-plus]');
    const minus = e.target.closest('[data-qty-minus]');
    const rm = e.target.closest('[data-rm]');
    if (plus) { const pid = plus.dataset.qtyPlus; const item = getCart().find((i) => String(i.productId) === String(pid)); if (item) { setQty(pid, (Number(item.qty) || 1) + 1); await load(); } return; }
    if (minus) { const pid = minus.dataset.qtyMinus; const item = getCart().find((i) => String(i.productId) === String(pid)); if (item) { setQty(pid, Math.max(1, (Number(item.qty) || 1) - 1)); await load(); } return; }
    if (rm) { removeFromCart(String(rm.dataset.rm)); await load(); }
  });

  checkoutBtn.addEventListener('click', async () => {
    const detailed = getCartDetailed(products);
    if (!detailed.length) return;
    const subtotal = detailed.reduce((s, i) => s + Number(i.product.price || 0) * Number(i.qty || 1), 0);
    const shipping = Number(document.getElementById('coShipping')?.value) || 0;
    openWhatsAppCheckout({
      store: STORE,
      items: detailed,
      customer: {
        name: document.getElementById('coName')?.value || '',
        phone: document.getElementById('coPhone')?.value || '',
        address: document.getElementById('coAddress')?.value || '',
        shippingCost: shipping,
        notes: document.getElementById('coNotes')?.value || '',
      },
    });
    clearCart();
    await load();
  });

  if (cancelBtn) cancelBtn.addEventListener('click', async () => { clearCart(); updateCartBadge(); await load(); });

  await load();
}

async function init() {
  if (document.getElementById('grid-terlaris')) return initHomepage();
  if (document.getElementById('cartPage')) return initCartPage();
}

document.addEventListener('DOMContentLoaded', async () => {
  try { await init(); } catch (e) { console.error(e); }
});
