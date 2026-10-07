-- Tann & Thread: product image uploads via Supabase Storage.
--
-- Creates a public `product-images` bucket for admin-uploaded product photos.
-- Public read so the storefront can serve images; writes restricted to the
-- service role (uploads go through the admin API route, which enforces the
-- admin session cookie server-side).

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access to product images.
DROP POLICY IF EXISTS "product-images public read" ON storage.objects;
CREATE POLICY "product-images public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Writes only via the service-role key (admin API route). No anon/
-- authenticated insert/update/delete policies are created, so the
-- service role bypasses RLS while all other roles are denied.
-- (intentionally no write policies here)
