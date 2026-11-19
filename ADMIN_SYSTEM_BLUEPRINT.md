# PANG LONG STORE — FULL STACK ADMIN SYSTEM BLUEPRINT (Master Prompt v2)

> Berikut blueprint sistem untuk **Full-Stack Admin Dashboard** berdasarkan Master Prompt final
> Toko online material bangunan "Panglong Store".

## 1. Executive Summary

Membangun sistem **Admin Dashboard Full Stack** untuk website PANG LONG STORE — pusat kendali
seluruh operasional toko online material bangunan. Semua konten, produk, kategori, transaksi,
promosi, pengiriman, pembayaran, dan pengaturan toko dapat dikelola melalui dashboard,
tanpa perlu edit source code manual.

## 2. Architecture Overview

```text
[ Admin Frontend (Cloudflare Pages - static) ]
        │  Supabase JS Client (PostgREST / Auth / Storage)
        ▼
[ Supabase Backend (PostgreSQL + Auth + Storage + RLS + Edge Functions) ]
        │  WhatsApp API (checkout / notifikasi / invoice)
        ▼
[ Website Pelanggan (Cloudflare Pages - static) ]
```

- Frontend admin: HTML5 + CSS3 + Vanilla JS (ES modules), multi-page di folder `admin/`.
- Backend: Supabase (PostgreSQL, Auth, Storage, RLS) + Supabase Edge Functions untuk operasi sensitif.
- Tidak boleh expose `service_role` key di frontend.
- Semua state source of truth: database Supabase.

## 3. Folder Structure (target)

```text
panglong-store/
├── index.html
├── pages/
│   ├── products.html
│   ├── product-detail.html
│   ├── cart.html
│   ├── about.html
│   └── contact.html
├── admin/
│   ├── index.html          # Dashboard
│   ├── products.html
│   ├── orders.html
│   ├── categories.html
│   ├── banners.html
│   ├── promotions.html
│   └── settings.html
├── css/
│   ├── style.css
│   ├── responsive.css
│   └── admin.css
├── js/
│   ├── app.js
│   ├── products.js
│   ├── cart.js
│   ├── checkout.js
│   ├── supabase.js
│   └── admin.js
├── supabase/
│   ├── schema.sql
│   ├── seed.sql
│   └── functions/          # Edge Functions (operasi sensitif)
├── config.js
├── _headers
├── sitemap.xml
├── robots.txt
└── docs/
    ├── ADMIN_SYSTEM_BLUEPRINT.md
    ├── PHASE_01_BLUEPRINT.md
    └── ...
```

## 4. Module Map (dari Master Prompt A–T)

| No | Modul | Status |
|----|-------|--------|
| A | Teknologi | ✅ Approved stack |
| B | Desain Admin | 🟡 In progress |
| C | Dashboard Overview | 🟡 Basic → full |
| D | Product Management | 🔴 Perlu ekspansi |
| E | Category Management | 🔴 Perlu ekspansi |
| F | Order Management | 🔴 Perlu ekspansi |
| G | Inventory Management | 🔴 Belum ada |
| H | Customer Management | 🔴 Belum ada |
| I | CMS | 🔴 Belum ada |
| J | Promo & Discount | 🔴 Perlu ekspansi |
| K | Shipping | 🔴 Belum ada |
| L | Payment | 🔴 Perlu ekspansi |
| M | Report & Finance | 🔴 Belum ada |
| N | Admin User & Role | 🔴 Belum ada |
| O | Store Settings | 🟡 Partial |
| P | Security & Backend | 🟡 Perlu RBAC/Edge fn |
| Q | Database | 🔴 Perlu migration baru |
| R | UX Admin | 🟡 Perlu polish |
| S | Phase Plan | 📋 1–11 |
| T | Hasil Akhir | 📋 Production-ready |

## 5. Phase Plan (sesuai Master Prompt)

- **Tahap 1** — Blueprint sistem & struktur folder: ✅ INI (dokumen ini).
- **Tahap 2** — Database SQL, autentikasi, RLS, permission. ✅ Selesai.
- **Tahap 3** — Layout dashboard, sidebar, topbar, overview. ✅ Selesai.
- **Tahap 4** — Manajemen produk, kategori, inventory. ✅ Selesai.
- **Tahap 5** — Manajemen pesanan, pelanggan. ✅ Selesai.
- **Tahap 6** — CMS website & banner. ✅ Selesai.
- **Tahap 7** — Promo, pengiriman, pembayaran. 🟡 Promo selesai; shipping/payment pending.
- **Tahap 8** — Laporan & keuangan. ✅ Basic selesai.
- **Tahap 9** — Admin user & pengaturan toko. ✅ Selesai.
- **Tahap 10** — Integrasi admin ↔ website pelanggan. ✅ Selesai (CMS, hero, testimoni, FAQ live dari DB).
- **Tahap 11** — Uji keamanan, fungsionalitas, responsivitas, performa. 🟡 Sedang (checklist dibuat: `ADMIN_QA_CHECKLIST.md`).

## 6. Security Blueprint

- Supabase Auth + RBAC (Super Admin / Admin / Staff Gudang / Staff Pesanan / Finance).
- RLS policies di semua tabel.
- Audit log untuk aktivitas admin.
- Validasi server-side via Edge Functions untuk operasi sensitif (stok, pesanan).
- Input sanitasi & validasi.
- Upload dibatasi MIME type & ukuran.

## 7. Data Flow Utama

1. Pelanggan checkout → WhatsApp (pesanan via `orders` + `order_items`).
2. Admin update status → `orders.status_history` (riwayat).
3. Admin update stok → `inventory_movements` + validasi stok (cek double deduction, cegah negatif).
4. Admin publish konten → tabel CMS langsung update → tampilan website pelanggan re-render.
5. Admin laporan → agregasi dari `orders`, `order_items`, `products`, dll.

---

*Next step: **Tahap 2** — buat SQL migration lengkap (tabel + RLS + fungsi database).*
