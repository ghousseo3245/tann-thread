-- Per-product image URL for the admin add-product form and inventory
-- thumbnails. Run this in the Supabase SQL editor before deploying the
-- updated admin; the products API tolerates the column being absent and
-- falls back to the category image until then.

alter table products
  add column if not exists image_url text;
