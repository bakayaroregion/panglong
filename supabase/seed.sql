-- PANG LONG STORE — Seed awal produk & kategori
-- Jalankan di Supabase Dashboard → SQL Editor → paste → run

insert into public.categories (name, slug, description) values
('Semen & Mortar', 'semen-mortar', 'Semen, mortar, dan admixture untuk konstruksi.'),
('Pasir & Batu', 'pasir-batu', 'Pasir, batu split, dan agregat kasar.'),
('Besi & Baja', 'besi-baja', 'Baja beton, wiremesh, dan profil baja.'),
('Kayu & Papan', 'kayu-papan', 'Kayu konstruksi dan papan plat.'),
('Cat & Pelapis', 'cat-pelapis', 'Cat dinding, cat lantai, dan waterproofing.'),
('Pipa & Plumbing', 'pipa-plumbing', 'Pipa PVC, PPR, dan aksesoris plumbing.'),
('Listrik & Elektrikal', 'listrik-elektrikal', 'Kabel, MCB, dan perlengkapan instalasi listrik.'),
('Keramik & Granit', 'keramik-granit', 'Keramik tile dan granit slab.'),
('Atap & Genteng', 'atap-genteng', 'Genteng, lis menahan air, dan aksesoris atap.'),
('Perkakas & Tools', 'perkakas-tools', 'Tool tukang dan perkakas bergerak.'),
('Baut & Mur', 'baut-mur', 'Baut, mur, dan fastener konstruksi.'),
('Perlengkapan Bangunan', 'perlengkapan-bangunan', 'Alat & perlengkapan umum bangunan.'),
('Pintu & Jendela', 'pintu-jendela', 'Pintu pagar, pintu pagar, dan jendela aluminium.'),
('Perlengkapan Kamar Mandi', 'perlengkapan-kamar-mandi', 'Sanitasi, grab, dan perlengkapan kamar mandi.');

insert into public.products (category_id, name, slug, description, price, unit, stock, status, is_featured, is_new) values
(select c.id, 'Semen Portland 50 KG', 'semen-portland-50kg', 'Semen Portland 50 kg untuk konstruksi struktural.', 145000, 'sak', 40, 'active', true, false from public.categories c where c.slug = 'semen-mortar'),
(select c.id, 'Semen Mortar 200 KG', 'semen-mortar-200kg', 'Mortar semen untuk perekat bata merata.', 320000, 'sak', 25, 'active', false, false from public.categories c where c.slug = 'semen-mortar'),
(select c.id, 'Pasir Bangunan 1 Kubik', 'pasir-bangunan-1m3', 'Pasir beton 1 m3 untuk campuran kering.', 350000, 'm3', 15, 'active', false, false from public.categories c where c.slug = 'pasir-batu'),
(select c.id, 'Batu Split 1 Kubik', 'batu-split-1m3', 'Batu split untuk campuran beton.', 380000, 'm3', 12, 'active', false, false from public.categories c where c.slug = 'pasir-batu'),
(select c.id, 'Besi Beton 10 MM', 'besi-beton-10mm', 'Baja beton 10 mm untuk pondasi & balok.', 520000, 'lembar', 25, 'active', true, false from public.categories c where c.slug = 'besi-baja'),
(select c.id, 'Baja Hollow 40x40', 'baja-hollow-4040', 'Baja hollow 40x40 untuk atap & partisi.', 980000, 'pcs', 8, 'active', false, true from public.categories c where c.slug = 'besi-baja'),
(select c.id, 'Cat Tembok 5 KG', 'cat-tembok-5kg', 'Cat lantai tembok interior/exterior.', 185000, 'kaleng', 60, 'active', false, false from public.categories c where c.slug = 'cat-pelapis'),
(select c.id, 'Waterproof Coating 10 L', 'waterproof-coating-10l', 'Waterproof coating untuk atap & balik.', 1450000, 'kaleng', 10, 'active', false, false from public.categories c where c.slug = 'cat-pelapis'),
(select c.id, 'Pipa PVC 4 Inch', 'pipa-pvc-4in', 'Pipa PVC 4 inch untuk saluran air.', 145000, 'roll', 30, 'active', false, false from public.categories c where c.slug = 'pipa-plumbing'),
(select c.id, 'Pompa Air 1/2 HP', 'pompa-air-12hp', 'Pompa air mini 1/2 HP untuk bor listrik.', 750000, 'pcs', 5, 'active', false, false from public.categories c where c.slug = 'pipa-plumbing'),
(select c.id, 'Bor Listrik 650W', 'bor-listrik-650w', 'Bor listrik 650 watt untuk pengeboran.', 1450000, 'pcs', 8, 'active', false, true from public.categories c where c.slug = 'listrik-elektrikal'),
(select c.id, 'Kabel Flat 1.5 mm2', 'kabel-flat-15mm2', 'Kabel flat 1.5 mm2 untuk instalasi listrik.', 125000, 'roll', 100, 'active', false, false from public.categories c where c.slug = 'listrik-elektrikal'),
(select c.id, 'Keramik 40x40 CM', 'keramik-40x40', 'Keramik tile 40x40 import.', 320000, 'pcs', 50, 'active', false, false from public.categories c where c.slug = 'keramik-granit'),
(select c.id, 'Granit Slab 60x60', 'granit-slab-6060', 'Granit slab 60x60 untuk backsplash dapur.', 1500000, 'lembar', 6, 'active', false, false from public.categories c where c.slug = 'keramik-granit'),
(select c.id, 'Genteng Metal 3 Ply', 'genteng-metal-3ply', 'Genteng metal 3 ply untuk atap.', 280000, 'pcs', 40, 'active', false, false from public.categories c where c.slug = 'atap-genteng'),
(select c.id, 'Palu Tukang Baja', 'palu-tukang-baja', 'Palu tukang baja untuk obras.', 75000, 'pcs', 100, 'active', false, false from public.categories c where c.slug = 'perkakas-tools'),
(select c.id, 'Paku Beton 12', 'paku-beton-12', 'Paku beton 12 untuk penempatan besi.', 25000, 'box', 200, 'active', false, false from public.categories c where c.slug = 'baut-mur');
