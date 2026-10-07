-- Tann & Thread: Phase 2a admin dashboard migration.
--
-- Adds the `active` flag to products so items can be hidden from the
-- storefront without deleting them. Fully idempotent (safe to run more
-- than once).

alter table products
  add column if not exists active boolean default true;

comment on column products.active is
  'Admin flag: false hides the product from the storefront without deleting it.';
