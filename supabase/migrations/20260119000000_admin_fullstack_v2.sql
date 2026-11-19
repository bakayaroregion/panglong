-- ============================================================
-- PANG LONG STORE — FULL STACK ADMIN MIGRATION v2.0
-- Master Prompt Tahap 2: Database SQL, Autentikasi, RLS, Permission
-- ============================================================

create extension if not exists "pgcrypto";

-- ============ ADMIN ROLES & PERMISSIONS ============
create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('super_admin','admin','staff_gudang','staff_pesanan','finance')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (admin_id, role)
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  module text not null,
  action text not null,
  created_at timestamptz not null default now(),
  unique (role, module, action)
);

-- ============ CATEGORIES (EXTEND) ============
alter table public.categories
  add column if not exists display_order int not null default 0,
  add column if not exists icon text,
  add column if not exists image_url text;

-- ============ PRODUCTS (EXTEND) ============
alter table public.products
  add column if not exists sku text,
  add column if not exists barcode text,
  add column if not exists weight numeric not null default 0,
  add column if not exists dimensions text,
  add column if not exists cost_price numeric not null default 0,
  add column if not exists wholesale_price numeric,
  add column if not exists discount_percent int not null default 0;

-- ============ PRODUCT VARIANTS ============
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sku text,
  price numeric not null,
  stock int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_product_variants_product on public.product_variants (product_id);

-- ============ INVENTORY ============
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  stock int not null default 0,
  minimum_stock int not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  movement_type text not null check (movement_type in ('in','out','adjustment','reserve','release')),
  qty int not null,
  stock_after int not null,
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_inventory_product on public.inventory (product_id);
create index idx_inventory_movements_product on public.inventory_movements (product_id);

-- ============ SUPPLIERS & PURCHASE ORDERS ============
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references public.suppliers(id) on delete set null,
  order_date date not null default current_date,
  expected_date date,
  status text not null default 'pending' check (status in ('pending','received','cancelled')),
  total_cost numeric not null default 0,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  qty int not null,
  cost_price numeric not null default 0,
  subtotal numeric not null default 0,
  created_at timestamptz not null default now()
);

-- ============ CUSTOMERS & ADDRESSES ============
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  phone text not null,
  address text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id)
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  label text not null,
  recipient text not null,
  phone text not null,
  address text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ ORDER STATUS HISTORY ============
create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  note text,
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_order_status_history_order on public.order_status_history (order_id);

-- ============ PAYMENTS & PAYMENT PROOFS ============
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  method text not null check (method in ('bank_transfer','qris','e_wallet','cash','cod','whatsapp')),
  amount numeric not null,
  status text not null default 'pending' check (status in ('pending','paid','refunded','failed')),
  paid_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  url text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============ SHIPPING ============
create table if not exists public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shipping_rates (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid references public.shipping_zones(id) on delete set null,
  name text not null,
  base_cost numeric not null default 0,
  per_kg numeric not null default 0,
  free_above numeric,
  min_cost numeric not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ COUPONS ============
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text not null check (type in ('percent','nominal')),
  value numeric not null,
  min_purchase numeric not null default 0,
  max_discount numeric,
  usage_limit int,
  used_count int not null default 0,
  valid_from date,
  valid_to date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ TESTIMONIALS ============
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  content text not null,
  rating int not null default 5,
  product_ref text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ CMS PAGES & FAQS ============
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  title text not null,
  content text,
  is_published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ EXPENSES ============
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  amount numeric not null,
  note text,
  expense_date date not null default current_date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============ AUDIT LOGS ============
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_logs_created on public.audit_logs (created_at);

-- ============ ORDERS: EXTEND STATUS CONSTRAINT ============
alter table public.orders
  drop constraint if exists orders_status_check,
  add constraint orders_status_check
  check (status in ('pending','awaiting_payment','payment_verified','processing','ready_to_ship','shipped','delivered','cancelled'));

-- ============ RLS: ENABLE + POLICIES ============

alter table public.admin_roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.suppliers enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.customers enable row level security;
alter table public.addresses enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payments enable row level security;
alter table public.payment_proofs enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.coupons enable row level security;
alter table public.testimonials enable row level security;
alter table public.pages enable row level security;
alter table public.faqs enable row level security;
alter table public.expenses enable row level security;
alter table public.audit_logs enable row level security;

create policy "Admin full access admin_roles" on public.admin_roles for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access role_permissions" on public.role_permissions for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access product_variants" on public.product_variants for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access inventory" on public.inventory for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access inventory_movements" on public.inventory_movements for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access suppliers" on public.suppliers for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access purchase_orders" on public.purchase_orders for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access purchase_order_items" on public.purchase_order_items for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access customers" on public.customers for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access addresses" on public.addresses for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access order_status_history" on public.order_status_history for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access payments" on public.payments for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access payment_proofs" on public.payment_proofs for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access shipping_zones" on public.shipping_zones for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access shipping_rates" on public.shipping_rates for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access coupons" on public.coupons for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access testimonials" on public.testimonials for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access pages" on public.pages for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access faqs" on public.faqs for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access expenses" on public.expenses for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access audit_logs" on public.audit_logs for all
  using (public.is_admin()) with check (public.is_admin());

-- Customer-facing read access
create policy "Customer read testimonials" on public.testimonials for select
  using (is_active = true);
create policy "Customer read faqs" on public.faqs for select
  using (is_active = true);
create policy "Customer read pages" on public.pages for select
  using (is_published = true);

-- ============ AUTH FUNCTIONS & PERMISSIONS ============
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    join public.admin_roles ar on ar.admin_id = p.id
    where p.id = auth.uid() and ar.is_active = true
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    join public.admin_roles ar on ar.admin_id = p.id
    where p.id = auth.uid() and ar.is_active = true and ar.role = 'super_admin'
  );
$$;

create or replace function public.has_role(p_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_roles ar
    join public.profiles p on p.id = ar.admin_id
    where p.id = auth.uid() and ar.is_active = true and ar.role = p_role
  );
$$;

-- Audit trigger function (produk: perubahan harga/stok)
create or replace function public.audit_log_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
  begin
    insert into public.audit_logs (admin_id, action, entity, entity_id, details)
    values (
      auth.uid(),
      'UPDATE',
      'products',
      new.id::text,
      jsonb_build_object('price', new.price, 'stock', new.stock, 'cost_price', new.cost_price, 'wholesale_price', new.wholesale_price)
    );
    return new;
  end;
$$;

drop trigger if exists trg_products_audit on public.products;
create trigger trg_products_audit
  after update on public.products
  for each row
  execute function public.audit_log_trigger();

-- ============ RLS: ORDERS / ORDER ITEMS / CARTS / PROFILES (ADMIN ACCESS) ============
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.carts enable row level security;
alter table public.profiles enable row level security;

create policy "Admin full access orders" on public.orders for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access order_items" on public.order_items for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin full access carts" on public.carts for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Customer manage own cart" on public.carts for all
  using (customer_id = auth.uid());
create policy "Customer manage own orders" on public.orders for all
  using (customer_id = auth.uid());

-- ADD COLUMN: announcement to store_settings (CMS)\nalter table public.store_settings add column if not exists announcement text;

alter table public.promotions add column if not exists discount_type text not null default 'percent';
alter table public.promotions add column if not exists discount_value numeric not null default 0;
alter table public.promotions add column if not exists max_discount numeric;
alter table public.promotions add column if not exists min_purchase numeric not null default 0;
alter table public.promotions add column if not exists usage_limit int;
alter table public.promotions add column if not exists used_count int not null default 0;
alter table public.promotions add column if not exists applies_to text not null default 'all';
alter table public.promotions add column if not exists product_id uuid references public.products(id) on delete set null;
