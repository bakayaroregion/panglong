// PANG LONG STORE — Supabase Client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supa-js/dist/supa-js.min.js';

const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, description, price, unit, stock, status, is_featured, is_new, category_id, categories(name, slug), product_images(id, url, is_primary, sort_order)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchProductsByCategory(categorySlug) {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, description, price, unit, stock, status, is_featured, is_new, category_id, categories(name, slug), product_images(id, url, is_primary, sort_order)')
    .eq('categories.slug', categorySlug)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .order('name', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, description, price, unit, stock, status, is_featured, is_new, category_id, categories(name, slug), product_images(id, url, is_primary, sort_order)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchBanners() {
  const { data, error } = await supabase.from('banners').select('*').eq('is_active', true);
  if (error) throw error;
  return data || [];
}
