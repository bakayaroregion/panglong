// PANG LONG STORE — Cart Module (localStorage + operasi terhadap produk)
const CART_KEY = 'panglong_store_cart';

export function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
}
export function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
export function addToCart(productId, qty = 1) {
  const cart = getCart();
  const ex = cart.find((i) => i.productId === productId);
  if (ex) ex.qty += qty; else cart.push({ productId, qty });
  saveCart(cart);
  return cart;
}
export function setQty(productId, qty) {
  let cart = getCart().map((i) => (i.productId === productId ? { ...i, qty: Math.max(1, qty) } : i)).filter((i) => i.qty > 0);
  saveCart(cart);
  return cart;
}
export function removeFromCart(productId) { return getCart().filter((i) => i.productId !== productId); }
export function clearCart() { saveCart([]); }
export function getCartCount() { return getCart().reduce((s, i) => s + i.qty, 0); }
export function getCartDetailed(products) {
  return getCart()
    .map((i) => ({ ...i, product: products.find((p) => p.id === i.productId) }))
    .filter((i) => i.product);
}
