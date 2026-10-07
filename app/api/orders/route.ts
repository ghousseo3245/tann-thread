import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";
import { mapProductRow } from "@/app/api/admin/_map";

const PRODUCT_SELECT = `
  id, slug, name, tagline, description, materials, care, price, compare_at_price,
  rating, review_count, featured, best_seller, is_new, active, created_at,
  categories ( slug, name, image ),
  product_variants ( id, color, color_hex, size, sku, price, stock )
`;

/**
 * GET /api/products — PUBLIC storefront catalog (no admin auth).
 * Returns { ok: true, products } from Supabase, or { ok: false } when
 * Supabase is not configured or the query fails, so the storefront can
 * fall back to the bundled demo catalog.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseClient();
  if (!supabase) return NextResponse.json({ ok: false });

  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ ok: false });

    // Per-product image URLs live in products.image_url (added by migration
    // 20261007000003). Fetch them separately so the endpoint keeps working
    // on databases where the migration has not been applied yet.
    const imageById = new Map<string, string>();
    try {
      const { data: images, error: imageError } = await supabase
        .from("products")
        .select("id, image_url");
      if (!imageError && images) {
        for (const row of images as { id: string; image_url: string | null }[]) {
          if (row.image_url?.trim()) imageById.set(row.id, row.image_url);
        }
      }
    } catch {
      // image_url column missing: products fall back to the category image.
    }

    const products = (data ?? []).map((row) =>
      mapProductRow(row, imageById.get(row.id) ?? null)
    );
    return NextResponse.json({ ok: true, products });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
