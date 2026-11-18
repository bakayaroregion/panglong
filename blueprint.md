# PANG LONG STORE — MASTER BUILD PROMPT / BLUEPRINT

## 1. Executive Summary
Toko online material bangunan (semen, batu, besi, cat, pipa, tools, dll) dengan desain premium minimalis, ekosistem e-commerce lengkap, dan operasional via WhatsApp.

## 2. Tech Stack
- Frontend: HTML5, CSS3, JavaScript Vanilla (modular)
- Backend/DB: Supabase (PostgreSQL + Auth + Storage + RLS)
- Pembayaran/Order: WhatsApp API / WhatsApp Link
- Hosting: Cloudflare Pages
- Deploy target: Static frontend + Supabase cloud

## 3. Design System
- Background utama: `#FFFFFF`
- Secondary: `#F5F6F7`
- Text utama: `#20242B`
- Dark section: `#171B22`
- Accent: `#F28C28`
- Radius cards: 14–18px
- Font: premium typography (Inter / Poppins / Playfair Display combo)

## 4. Fitur Utama
- Homepage: announcement bar, header, hero, CTA, kategori populer, produk terlaris, produk terbaru, banner promo, keunggulan toko, rekomendasi, testimoni, footer.
- Katalog per kategori (14 kategori).
- Product card: foto, nama, kategori, harga, unit, stok, badge, CTA.
- E-commerce: search, filter kategori/ harga, sort, detail produk, cart, qty, total, local cart, checkout WA.
- Admin: dashboard statistik, CRUD produk, manajemen pesanan, kategori, banner, promo, settings.

## 5. Fase Build
- Phase 0: Blueprint + struktur + DB — [DONE]
- Phase 1: Design system + Homepage HTML/CSS — [IN PROGRESS]
- Phase 2: Homepage JS (Supabase fetch produk, render card)
- Phase 3: Katalog per kategori + filter/sort
- Phase 4: Product detail + cart + checkout WhatsApp
- Phase 5: Admin dashboard lengkap
- Phase 6: SEO, performance, deploy Cloudflare Pages

## 6. Catatan Arsitektur
- Frontend static (Cloudflare Pages) → Supabase (PostgREST) via `@supabase/supabase-js`.
- Tidak pernah expose Service Role Key di frontend.
- Semua transaksi & pesanan via WhatsApp format rapi.
