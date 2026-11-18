// PANG LONG STORE — Checkout Module (format pesanan WhatsApp)

export function buildWhatsAppMessage({ store, items, customer }) {
  const lines = [
    `NAMA TOKO: ${store.name}`,
    `NAMA PEMBELI: ${customer.name || '-'}`,
    `NOMOR TELEPON: ${customer.phone || '-'}`,
    `ALAMAT PENGIRIMAN: ${customer.address || '-'}`,
    ``,
    `DAFTAR PESANAN:`,
  ];
  let subtotal = 0;
  for (const i of items) {
    const lineTotal = (Number(i.product.price) || 0) * (Number(i.qty) || 1);
    subtotal += lineTotal;
    lines.push(
      `- ${i.product.name} | Jumlah: ${i.qty} | Satuan: ${i.product.unit || 'pcs'} | Harga: Rp ${Number(i.product.price || 0).toLocaleString('id-ID')} | Subtotal: Rp ${lineTotal.toLocaleString('id-ID')}`
    );
  }
  const shippingCost = Number(customer.shippingCost || 0);
  const total = subtotal + shippingCost;
  lines.push(``, `TOTAL PEMBAYARAN: Rp ${total.toLocaleString('id-ID')}`);
  lines.push(`CATATAN: ${customer.notes || '-'}`);
  return lines.join('\n');
}

export function openWhatsAppCheckout({ store, items, customer }) {
  const message = buildWhatsAppMessage({ store, items, customer });
  const url = `https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}
