# PANG LONG STORE — Toko Material Bangunan Online

Website toko material bangunan modern, minimalis, profesional. Menjual semen, batu, besi, cat, pipa, tools, dan perlengkapan bangunan.

## Stack
- Frontend: HTML5, CSS3, Vanilla JS (ES modules)
- Backend/DB: Supabase (PostgreSQL, Auth, Storage, RLS)
- Checkout: WhatsApp API/Link
- Hosting: Cloudflare Pages

## Fitur (sudah terimplementasi)
- ✅ Homepage (hero, kategori, produk, banner, testimoni, footer)
- ✅ Katalog + filter kategori/harga/sort + search
- ✅ Detail produk + add to cart + checkout WA
- ✅ Keranjang + subtotal/ongkir/total
- ✅ Admin: dashboard (stat/omzet/stok/chart), CRUD produk, kelola pesanan, kategori, banner, promo, pengaturan
- ✅ SEO (meta/OG/Twitter/JSON-LD) + performance (lazy loading, cache headers)
- ✅ Responsive (desktop/tablet/mobile)

## Struktur
- `index.html` — Homepage
- `pages/` — products, product-detail, cart, about, contact
- `admin/` — index, products, orders, categories, banners, promotions, settings
- `js/` — app, products, cart, checkout, supabase, admin
- `css/` — style, responsive, admin
- `supabase/schema.sql` — database schema + RLS
- `config.js` — konfigurasi
- `_headers` — Cloudflare Pages cache headers
- `sitemap.xml`, `robots.txt`

## Setup Supabase
1. Buat project di Supabase.
2. Jalankan `supabase/schema.sql`.
3. Isi `config.js` & `js/supabase.js` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`).
4. Buat user admin di Supabase Auth (email: `admin@panglong.store`).

## Deploy ke Cloudflare Pages
1. Push repo ke GitHub.
2. Cloudflare Pages → Create → Connect to repo.
3. Build settings: Framework preset = None; Build command = (kosong); Output directory = `/panglong-store` (sesuaikan).
4. Set environment variable `SUPABASE_URL` & `SUPABASE_ANON_KEY` (atau hardcode di config).

## Catatan
- Ongkir: input manual di keranjang (admin/pengaturan).
- Pembayaran: transfer/COD via WhatsApp.
