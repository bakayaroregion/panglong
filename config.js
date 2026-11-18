// PANG LONG STORE — Konfigurasi
const SUPABASE_URL = 'https://gmrheljzcrfwrvitjycb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bzdCMr4QvLc2SZAkkE3JNw_KtA6sRPL';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtcmhlbGp6Y3Jmd3J2aXRqeWNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDkwOTU5NSwiZXhwIjoyMTEwNDg1NTk1fQ.wUdRKUQj4OSXRIUyLBDfx5LyMTvDNhZTZMr0BDIhAwA'; // JANGAN dipakai di frontend

const STORE = {
  name: 'PANG LONG STORE',
  whatsappNumber: '6282117728722',
  address: 'Jl. Konstruksi No. 123, Indonesia',
  phone: '0210000000',
  email: 'hello@panglong.store',
  hours: 'Senin - Sabtu, 08:00 - 17:00 WIB',
};

const CATEGORIES = [
  { id: 'semen-mortar', name: 'Semen & Mortar' },
  { id: 'pasir-batu', name: 'Pasir & Batu' },
  { id: 'besi-baja', name: 'Besi & Baja' },
  { id: 'kayu-papan', name: 'Kayu & Papan' },
  { id: 'cat-pelapis', name: 'Cat & Pelapis' },
  { id: 'pipa-plumbing', name: 'Pipa & Plumbing' },
  { id: 'listrik-elektrikal', name: 'Listrik & Elektrikal' },
  { id: 'keramik-granit', name: 'Keramik & Granit' },
  { id: 'atap-genteng', name: 'Atap & Genteng' },
  { id: 'perkakas-tools', name: 'Perkakas & Tools' },
  { id: 'baut-mur', name: 'Baut & Mur' },
  { id: 'perlengkapan-bangunan', name: 'Perlengkapan Bangunan' },
  { id: 'pintu-jendela', name: 'Pintu & Jendela' },
  { id: 'perlengkapan-kamar-mandi', name: 'Perlengkapan Kamar Mandi' },
];

const PRODUCT_PLACEHOLDERS = [
  { name: 'Semen Portland 50 KG', price: 145000, unit: 'sak', category: 'Semen & Mortar', stock: 40, badge: 'Terlaris', image: 'assets/images/semen-portland.jpg' },
  { name: 'Besi Beton 10 MM', price: 520000, unit: 'lembar', category: 'Besi & Baja', stock: 25, badge: 'Terlaris', image: 'assets/images/besi-beton.jpg' },
  { name: 'Pasir Bangunan 1 Kubik', price: 350000, unit: 'm3', category: 'Pasir & Batu', stock: 15, badge: null, image: 'assets/images/pasir-bangunan.jpg' },
  { name: 'Batu Split 1 Kubik', price: 380000, unit: 'm3', category: 'Pasir & Batu', stock: 12, badge: null, image: 'assets/images/batu-split.jpg' },
  { name: 'Cat Tembok 5 KG', price: 185000, unit: 'kaleng', category: 'Cat & Pelapis', stock: 60, badge: 'Terlaris', image: 'assets/images/cat-tembok.jpg' },
  { name: 'Pipa PVC 4 Inch', price: 145000, unit: 'roll', category: 'Pipa & Plumbing', stock: 30, badge: null, image: 'assets/images/pipa-pvc.jpg' },
  { name: 'Keramik 40x40 CM', price: 320000, unit: 'pcs', category: 'Keramik & Granit', stock: 50, badge: 'Terbaru', image: 'assets/images/keramik-40.jpg' },
  { name: 'Palu Tukang', price: 75000, unit: 'pcs', category: 'Perkakas & Tools', stock: 100, badge: null, image: 'assets/images/palu-tukang.jpg' },
  { name: 'Bor Listrik', price: 1450000, unit: 'pcs', category: 'Listrik & Elektrikal', stock: 8, badge: null, image: 'assets/images/bor-listrik.jpg' },
  { name: 'Paku Beton', price: 25000, unit: 'box', category: 'Baut & Mur', stock: 200, badge: null, image: 'assets/images/paku-beton.jpg' },
];

export default {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  STORE,
  CATEGORIES,
  PRODUCT_PLACEHOLDERS,
};
