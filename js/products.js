// PANG LONG STORE — Products Module (Katalog + Detail Produk)
import { fetchProducts, fetchProductsByCategory, fetchCategories, fetchProductById } from './supabase.js';
import { addToCart, getCart, getCartDetailed, getCartCount } from './cart.js';
import { openWhatsAppCheckout } from './checkout.js';
import { STORE } from '../config.js';

const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

const FALLBACK_IMAGES = {
  'semen-mortar': 'assets/images/semen-portland.jpg',
  'pasir-batu': 'assets/images/pasir-bangunan.jpg',
  'besi-baja': 'assets/images/besi-beton.jpg',
  'cat-pelapis': 'assets/images/cat-tembok.jpg',
  'perkakas-tools': 'assets/images/palu-tukang.jpg',
  'plumbing': 'assets/images/pipa-pvc.jpg',
};

function productImage(p) {
  const imgs = Array.isArray(p.product_images) ? p.product_images : (p.product_images ? [p.product_images] : []);
  const primary = imgs.find((i) => i.is_primary) || imgs[0];
  const url = primary?.url || p.image;
  const slug = p.categories?.slug || 'umum';
  const found = Object.keys(FALLBACK_IMAGES).find((k) => slug.includes(k));
  return url || (found ? FALLBACK_IMAGES[found] : 'assets/images/semen-portland.jpg');
}

function badgeHTML(p) {
  if (p.is_featured) return '<span class="badge badge-accent">Terlaris</span>';
  if (p.is_new) return '<span class="badge badge-accent">Terbaru</span>';
  return '';
}

export function productCardHTML(p) {
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

let state = { cat: new URLSearchParams(location.search).get('cat') || 'all', maxPrice: Infinity, sort: 'asc' };
let currentProducts = [];

async function fetchCatalogList() {
  try {
    const products = state.cat && state.cat !== 'all' ? await fetchProductsByCategory(state.cat) : await fetchProducts();
    return products.filter((p) => (p.status || 'active') === 'active');
  } catch (e) { return []; }
}

function applyFilters(list) {
  const filtered = list.filter((p) => Number(p.price) <= state.maxPrice);
  return filtered.slice().sort((a, b) => state.sort === 'asc' ? Number(a.price) - Number(b.price) : Number(b.price) - Number(a.price));
}

async function renderCatalog() {
  const grid = document.getElementById('catalogGrid');
  const title = document.getElementById('catalogTitle');
  const pills = document.getElementById('categoryPills');
  if (!grid) return;

  const products = await fetchCatalogList();
  currentProducts = products;

  let titleText = 'Semua Produk';
  if (state.cat && state.cat !== 'all') {
    const cats = await fetchCategories().catch(() => []);
    const c = cats.find((x) => x.slug === state.cat);
    if (c) titleText = c.name;
  }
  if (title) title.textContent = titleText;

  const cats = await fetchCategories().catch(() => []);
  const allCats = [{ slug: 'all', name: 'Semua' }].concat(cats.map((c) => ({ slug: c.slug, name: c.name })));
  pills.innerHTML = allCats
    .map((c) => `<button class="pill ${state.cat === c.slug ? 'active' : ''}" data-cat="${c.slug}">${c.name}</button>`)
    .join('');

  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById('catalogGrid');
  const list = applyFilters(currentProducts);
  if (!list.length) { grid.innerHTML = '<div class="empty">Produk tidak ditemukan.</div>'; return; }
  grid.innerHTML = list.map(productCardHTML).join('');
}

async function initCatalog() {
  await renderCatalog();

  const grid = document.getElementById('catalogGrid');
  grid.addEventListener('click', async (e) => {
    const addBtn = e.target.closest('[data-add]');
    const card = e.target.closest('.product-card');
    const detailBtn = e.target.closest('[data-detail]');
    if (detailBtn) { window.location.href = 'pages/product-detail.html?id=' + detailBtn.dataset.detail; return; }
    if (!addBtn) return;
    const p = currentProducts.find((x) => String(x.id) === String(addBtn.dataset.add));
    if (p) {
      addToCart(p.id, 1);
      const el = document.getElementById('cartCount');
      if (el) el.textContent = getCartCount();
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = 'Ditambahkan ke keranjang ✓';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1800);
    }
  });

  const pillsWrap = document.getElementById('categoryPills');
  pillsWrap.addEventListener('click', async (e) => {
    const btn = e.target.closest('.pill');
    if (!btn) return;
    state.cat = btn.dataset.cat;
    state.maxPrice = Infinity;
    state.sort = 'asc';
    await renderCatalog();
  });

  const maxPriceInput = document.getElementById('maxPriceInput');
  maxPriceInput.addEventListener('input', () => { state.maxPrice = Number(maxPriceInput.value) || Infinity; renderGrid(); });

  const sortSelect = document.getElementById('sortSelect');
  sortSelect.addEventListener('change', () => { state.sort = sortSelect.value; renderGrid(); });
}

async function initProductDetail() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const box = document.getElementById('productDetail');
  if (!box) return;
  if (!id) { box.innerHTML = '<div class="empty">Produk tidak ditemukan.</div>'; return; }
  const p = await fetchProductById(id).catch(() => null);
  if (!p) { box.innerHTML = '<div class="empty">Produk tidak ditemukan.</div>'; return; }

  const qtyVal = () => Math.max(1, Number(document.getElementById('pdQty')?.value) || 1);

  const add = () => { addToCart(p.id, qtyVal()); const el = document.getElementById('cartCount'); if (el) el.textContent = getCartCount(); const toast = document.createElement('div'); toast.className = 'toast'; toast.textContent = 'Ditambahkan ke keranjang ✓'; document.body.appendChild(toast); setTimeout(() => toast.remove(), 1800); };
  const buy = () => { addToCart(p.id, qtyVal()); openWhatsAppCheckout({ store: STORE, items: [{ product: p, qty: qtyVal() }], customer: { name: '', phone: '', address: '', shippingCost: 0, notes: '' } }); };

  box.innerHTML = `
    <div class="product-detail">
      <div class="pd-media"><img src="${productImage(p)}" alt="${p.name}"></div>
      <div class="pd-body">
        <span class="chip">${p.categories?.name || 'Material Bangunan'}</span>
        <h1>${p.name}</h1>
        <p class="product-unit">Per ${p.unit || 'pcs'}</p>
        <div class="product-price">${fmt(p.price)}</div>
        <p class="product-stock">Stok: ${p.stock ?? 0}</p>
        <p>${p.description || ''}</p>
        <div class="pd-actions">
          <div class="qty">
            <button id="pdMinus" type="button">−</button>
            <input id="pdQty" type="number" min="1" value="1">
            <button id="pdPlus" type="button">+</button>
          </div>
          <button class="btn btn-accent" id="pdAdd">Add to Cart</button>
          <button class="btn btn-dark" id="pdBuy">Beli Sekarang</button>
        </div>
      </div>
    </div>`;

  document.getElementById('pdAdd').addEventListener('click', add);
  document.getElementById('pdBuy').addEventListener('click', buy);
  document.getElementById('pdMinus').addEventListener('click', () => { const q = document.getElementById('pdQty'); q.value = Math.max(1, Number(q.value) - 1); });
  document.getElementById('pdPlus').addEventListener('click', () => { const q = document.getElementById('pdQty'); q.value = Math.min(99, Number(q.value) + 1); });
}

async function init() {
  if (document.getElementById('catalogGrid')) return initCatalog();
  if (document.getElementById('productDetail')) return initProductDetail();
}

document.addEventListener('DOMContentLoaded', async () => {
  try { await init(); } catch (e) { console.error(e); }
});
