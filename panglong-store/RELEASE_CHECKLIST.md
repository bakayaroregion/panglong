# PANG LONG STORE — RELEASE CHECKLIST (Phase 10)

## Status: BUILD SELESAI (Phase 0 → 10)

## Pre-Live Checklist
- [ ] Supabase project aktif & `supabase/schema.sql` dijalankan.
- [ ] `config.js` & `js/supabase.js` diisi `SUPABASE_URL` + `SUPABASE_ANON_KEY`.
- [ ] Admin user dibuat di Supabase Auth (email: `admin@panglong.store`).
- [ ] Storage bucket aktif untuk foto produk.
- [ ] Cloudflare Pages terhubung ke repo.
- [ ] Build settings: Framework = None, Build command = kosong, Output = `/panglong-store`.
- [ ] Environment variable: `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

## QA Final
- [ ] Homepage load (200).
- [ ] Katalog + filter + sort + search.
- [ ] Detail produk + qty + add to cart.
- [ ] Cart + checkout WA.
- [ ] Admin login + dashboard + CRUD produk + orders.
- [ ] SEO meta + OG + JSON-LD.
- [ ] Responsive mobile.

## Deploy
- Push ke GitHub → Cloudflare Pages → Deploy.
- Setelah deploy: test di preview URL → production URL.
