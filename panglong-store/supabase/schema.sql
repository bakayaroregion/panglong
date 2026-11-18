-- PANG LONG STORE — Supabase Schema
create extension if not exists "pgcrypto";

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ CATEGORIES ============
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ PRODUCTS ============
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text,
  price numeric not null check (price >= 0),
  unit text not null default 'pcs',
  stock int not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive')),
  is_featured boolean not null default false,
  is_new boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_category on public.products (category_id);
create index idx_products_status on public.products (status);

-- ============ PRODUCT IMAGES ============
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  is_primary boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_product_images_product on public.product_images (product_id);

-- ============ CARTS ============
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  qty int not null check (qty > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, product_id)
);

-- ============ ORDERS ============
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  subtotal numeric not null default 0,
  shipping_cost numeric not null default 0,
  total numeric not null default 0,
  status text not null default 'pending' check (status in ('pending','paid','shipped','completed','cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','refunded')),
  shipping_status text not null default 'pending' check (shipping_status in ('pending','preparing','shipped','delivered','cancelled')),
  notes text,
  whatsapp_number text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_orders_status on public.orders (status);

-- ============ ORDER ITEMS ============
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  qty int not null check (qty > 0),
  unit text not null default 'pcs',
  price numeric not null,
  subtotal numeric not null
);

create index idx_order_items_order on public.order_items (order_id);

-- ============ STORE SETTINGS ============
create table public.store_settings (
  id uuid primary key default gen_random_uuid(),
  store_name text not null default 'PANG LONG STORE',
  whatsapp_number text not null default '',
  address text,
  phone text,
  email text,
  hours text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ BANNERS ============
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  cta_label text not null default 'Belanja Sekarang',
  cta_link text not null default '#produk',
  is_active boolean not null default true,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ PROMOTIONS ============
create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  discount_percent int not null default 0,
  start_date date,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ RLS ============
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.carts enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.store_settings enable row level security;
alter table public.banners enable row level security;
alter table public.promotions enable row level security;

-- Helper: cek admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Policies: admin full access
create policy "Admin full access products" on public.products for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access categories" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access banners" on public.banners for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access promotions" on public.promotions for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access settings" on public.store_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- Customer: read products, manage own cart/orders
create policy "Customer read products" on public.products for select
  using (status = 'active');
create policy "Customer read categories" on public.categories for select
  using (true);
create policy "Customer manage own cart" on public.carts for all
  using (customer_id = auth.uid());
create policy "Customer manage own orders" on public.orders for all
  using (customer_id = auth.uid());
