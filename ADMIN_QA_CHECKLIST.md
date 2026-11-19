# PANG LONG STORE — ADMIN QA CHECKLIST (Tahap 11)

Checklist uji keamanan, fungsionalitas, responsivitas, dan performa untuk full stack admin.

## ✅ Uji Fungsional (Admin)

- [ ] Login admin (email/password) berhasil via `adminLogin`.
- [ ] Dashboard render: stat cards, chart penjualan 7 hari, stok menipis, pesanan terbaru, produk terlaris, aktivitas.
- [ ] Produk: tambah/edit/hapus produk, upload stok, harga jual, harga modal, grosir, diskon.
- [ ] Kategori: create/update/toggle/hapus.
- [ ] Pesanan: search + filter status, ubah status (auto-log `order_status_history`), ubah payment/shipping status, simpan catatan, WhatsApp, cetak invoice.
- [ ] Pelanggan: list, hapus.
- [ ] CMS: pengumuman, FAQ, testimoni, halaman statis — semua tersimpan ke DB.
- [ ] Promo: create, toggle aktif/nonaktif, hapus.
- [ ] Laporan: hitung omzet/laba/pengeluaran, export CSV.
- [ ] Admin user: tambah, aktif/nonaktif, hapus, permission matrix, audit log.
- [ ] Settings: simpan toko (store_name, whatsapp, address, phone, email, hours).

## ✅ Uji Keamanan

- [ ] Tidak ada service role key di frontend (`js/`, `admin/`, `index.html`).
- [ ] RLS aktif di semua tabel publik/admin.
- [ ] Admin hanya akses modul sesuai role (RBAC).
- [ ] Audit log tercatat untuk perubahan pesanan/status/admin.

## ✅ Uji Storefront (Integrasi Tahap 10)

- [ ] Announcement bar homepage menampilkan dari `store_settings.announcement`.
- [ ] Hero banner homepage menampilkan dari `banners` (aktif).
- [ ] Testimoni homepage menampilkan dari `testimonials`.
- [ ] FAQ homepage menampilkan dari `faqs`.
- [ ] Produk dari Supabase langsung muncul di katalog & detail.

## ✅ Uji Responsivitas & Performa

- [ ] Admin sidebar menutup di mobile.
- [ ] Table admin scroll horizontal.
- [ ] Chart render < 2 detik.
- [ ] Semua query Supabase punya indeks yang didefinisikan di migration.

## ✅ Uji Deploy

- [ ] `git push` → Cloudflare Pages deploy.
- [ ] Environment variable `SUPABASE_URL` & `SUPABASE_ANON_KEY` di-set di Cloudflare.
- [ ] Supabase real project + migration `20260119000000_admin_fullstack_v2.sql` dijalankan.
- [ ] Admin user dibuat (auth + `admin_roles`).

## Status

- [x] Sintaks JS lolos validasi (`node --check`) untuk seluruh `js/`.
- [x] Tag HTML section balance di `admin/index.html`.
- [ ] Jalankan checklist di atas di lingkungan staging/production.
- [ ] Uji end-to-end setelah deploy.
