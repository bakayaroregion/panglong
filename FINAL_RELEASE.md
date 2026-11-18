# PANG LONG STORE — FINAL RELEASE (Phase 12)

## Status Keselururan

- **Phase 0 → 11: SELURUHNYA SELESAI** ✅
- Phase 12: Rilis Akhir — **SELESAI** ✅

## Ringkasan Build

- Storefront lengkap: homepage, katalog, detail, cart, checkout WhatsApp.
- Admin lengkap: dashboard, produk CRUD, pesanan, kategori, banner, promo, pengaturan.
- SEO, performance, responsive, sitemap/robots.
- Node server test: 12/12 OK + API OK.

## Sebelum Live (wajib)

1. Supabase real + `supabase/schema.sql`.
2. `config.js` / `js/supabase.js` → `SUPABASE_URL` + `SUPABASE_ANON_KEY`.
3. Admin user: `admin@panglong.store`.
4. Storage foto produk.
5. Cloudflare Pages deploy.

## Cara Menjalankan

```bash
node server.js
```

- Storefront: http://localhost:3000
- Admin: http://localhost:3000/admin
- API: http://localhost:3000/api/
