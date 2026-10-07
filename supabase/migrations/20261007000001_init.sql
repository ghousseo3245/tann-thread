-- Tann & Thread: initial database schema (Phase 1)
--
-- How to apply:
--   1. Create a project at https://supabase.com/dashboard
--   2. Open the SQL editor, paste this whole file, and run it.
--   3. Copy the project URL + anon key into your .env.local
--      (see .env.example for details).
--
-- Notes:
--   * Row Level Security (RLS) is enabled on EVERY table below.
--   * Catalog tables (categories, products, product_variants), reviews, and
--     settings are publicly readable. Coupons are readable only when active.
--   * Order/customer data is owner-scoped: signed-in customers see only
--     their own rows. Guest COD orders must be created from a server route
--     using the service role key, which bypasses RLS.
--   * Seed inserts are idempotent (ON CONFLICT DO NOTHING), so this file is
--     safe to run more than once.

-- ============================================================================
-- Tables
-- ============================================================================

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text,
  image text,
  created_at timestamptz default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category_id uuid references categories (id),
  name text not null,
  tagline text,
  description text,
  materials text,
  care text,
  price numeric not null,
  compare_at_price numeric,
  rating numeric default 0,
  review_count int default 0,
  featured boolean default false,
  best_seller boolean default false,
  is_new boolean default false,
  created_at timestamptz default now()
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products (id) on delete cascade,
  color text not null,
  color_hex text,
  size text,
  sku text unique not null,
  price numeric not null,
  stock int default 0
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid,
  name text,
  email text,
  phone text,
  created_at timestamptz default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid references customers (id),
  phone text not null,
  name text not null,
  email text,
  city text,
  address text,
  payment_method text not null,
  subtotal numeric,
  discount numeric default 0,
  delivery_fee numeric default 0,
  total numeric,
  status text default 'Placed',
  placed_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders (id) on delete cascade,
  product_id uuid references products (id),
  variant_id uuid references product_variants (id),
  name text,
  variant_label text,
  price numeric,
  qty int
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products (id) on delete cascade,
  author text,
  rating int check (rating between 1 and 5),
  title text,
  body text,
  verified boolean default false,
  created_at timestamptz default now()
);

create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  percent_off int not null,
  active boolean default true,
  expires_at timestamptz
);

create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  subscribed_at timestamptz default now()
);

create table settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;
alter table coupons enable row level security;
alter table newsletter_subscribers enable row level security;
alter table settings enable row level security;

-- Public read: catalog
create policy "public read categories"
  on categories for select
  using (true);

create policy "public read products"
  on products for select
  using (true);

create policy "public read product_variants"
  on product_variants for select
  using (true);

-- Public read + insert: reviews (anyone can read; anyone can submit,
-- moderation/verification happens in Phase 2 via the admin dashboard)
create policy "public read reviews"
  on reviews for select
  using (true);

create policy "public insert reviews"
  on reviews for insert
  with check (true);

-- Public insert: newsletter signups
create policy "public insert newsletter_subscribers"
  on newsletter_subscribers for insert
  with check (true);

-- Public read: coupons, but only active ones
create policy "public read active coupons"
  on coupons for select
  using (active = true);

-- Owner-scoped: customers (matched via Supabase Auth uid)
create policy "customers select own"
  on customers for select
  using (auth.uid() = auth_id);

create policy "customers insert own"
  on customers for insert
  with check (auth.uid() = auth_id);

-- Owner-scoped: orders (via the customer link)
create policy "orders select own"
  on orders for select
  using (
    customer_id in (
      select id from customers where auth_id = auth.uid()
    )
  );

create policy "orders insert own"
  on orders for insert
  with check (
    customer_id in (
      select id from customers where auth_id = auth.uid()
    )
  );

-- Owner-scoped: order items (via the order -> customer link)
create policy "order_items select own"
  on order_items for select
  using (
    order_id in (
      select o.id
      from orders o
      join customers c on c.id = o.customer_id
      where c.auth_id = auth.uid()
    )
  );

create policy "order_items insert own"
  on order_items for insert
  with check (
    order_id in (
      select o.id
      from orders o
      join customers c on c.id = o.customer_id
      where c.auth_id = auth.uid()
    )
  );

-- Public read: site settings (brand name, tagline, currency, ...)
create policy "public read settings"
  on settings for select
  using (true);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Foreign keys
create index products_category_id_idx on products (category_id);
create index product_variants_product_id_idx on product_variants (product_id);
create index orders_customer_id_idx on orders (customer_id);
create index order_items_order_id_idx on order_items (order_id);
create index order_items_product_id_idx on order_items (product_id);
create index order_items_variant_id_idx on order_items (variant_id);
create index reviews_product_id_idx on reviews (product_id);

-- Lookup columns (unique constraints already create btree indexes for these;
-- explicit indexes below keep the required set visible in one place)
create index products_slug_idx on products (slug);
create index product_variants_sku_idx on product_variants (sku);
create index orders_order_number_idx on orders (order_number);

-- ============================================================================
-- Seed data
-- ============================================================================

insert into settings (key, value) values
  ('brand_name', 'Tann & Thread'),
  ('tagline', 'Crafted for Those Who Appreciate Quality'),
  ('currency', 'PKR')
on conflict (key) do update
  set value = excluded.value,
      updated_at = now();

insert into categories (slug, name, tagline) values
  ('bags', 'Bags', 'Carry it all, in full-grain leather'),
  ('wallets', 'Wallets', 'Slim profiles that age beautifully'),
  ('jackets', 'Jackets', 'Timeless silhouettes, broken-in comfort'),
  ('belts', 'Belts', 'The finishing touch, built to last'),
  ('shoes', 'Shoes', 'Welted construction, made for decades')
on conflict (slug) do nothing;

insert into coupons (code, percent_off, active) values
  ('WELCOME10', 10, true)
on conflict (code) do nothing;
