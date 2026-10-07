import { NextRequest, NextResponse } from "next/server";
import { isAdminResultError, requireAdmin } from "../_auth";
import { mapProductRow } from "../_map";
import type { NewProductInput } from "@/lib/inventory";

const PRODUCT_SELECT = `
  id, slug, name, tagline, description, materials, care, price, compare_at_price,
  rating, review_count, featured, best_seller, is_new, active, created_at,
  categories ( slug, name, image ),
  product_variants ( id, color, color_hex, size, sku, price, stock )
`;

function randomToken(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < bytes.length; i++) out += chars[bytes[i] % chars.length];
  return out;
}

/** GET /api/admin/products — full catalog with variants and categories. */
export async function GET() {
  const ctx = await requireAdmin();
  if (isAdminResultError(ctx)) return ctx.error;
  const { data, error } = await ctx.db
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Per-product image URLs live in products.image_url (added by migration
  // 20261007000003). Fetch them separately so the endpoint keeps working on
  // databases where the migration has not been applied yet.
  const imageById = new Map<string, string>();
  try {
    const { data: images, error: imageError } = await ctx.db
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

  return NextResponse.json(
    (data ?? []).map((row) => mapProductRow(row, imageById.get(row.id) ?? null))
  );
}

/** POST /api/admin/products — create a product with one default variant. */
export async function POST(req: NextRequest) {
  const ctx = await requireAdmin();
  if (isAdminResultError(ctx)) return ctx.error;
  const body = (await req.json().catch(() => ({}))) as Partial<NewProductInput>;

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const categorySlug = typeof body.category === "string" ? body.category.trim() : "";
  const price = Number(body.price);
  const stock = Number(body.stock);
  if (!name || !categorySlug || !Number.isFinite(price) || price < 0 || !Number.isFinite(stock) || stock < 0) {
    return NextResponse.json(
      { error: "name, category, price, and stock are required" },
      { status: 400 }
    );
  }

  const { data: category, error: categoryError } = await ctx.db
    .from("categories")
    .select("id, image")
    .eq("slug", categorySlug)
    .maybeSingle();
  if (categoryError || !category) {
    return NextResponse.json(
      { error: `Unknown category: ${categorySlug}` },
      { status: 400 }
    );
  }

  const slug =
    name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") +
    `-${randomToken(4).toLowerCase()}`;

  const { data: product, error: productError } = await ctx.db
    .from("products")
    .insert({
      slug,
      category_id: category.id,
      name,
      tagline: body.tagline ?? null,
      description: body.description ?? null,
      materials: body.materials ?? null,
      care: body.care ?? null,
      price,
      active: body.active ?? true,
    })
    .select("id")
    .single();
  if (productError || !product) {
    return NextResponse.json(
      { error: productError?.message ?? "Failed to create product" },
      { status: 500 }
    );
  }

  // Best-effort: store the image URL when provided. The products.image_url
  // column comes from migration 20261007000003; if it has not been applied
  // yet this update is skipped and the product falls back to the category
  // image instead of failing creation.
  const imageUrl =
    typeof body.imageUrl === "string" && body.imageUrl.trim()
      ? body.imageUrl.trim()
      : null;
  if (imageUrl) {
    try {
      await ctx.db.from("products").update({ image_url: imageUrl }).eq("id", product.id);
    } catch {
      // column missing: leave the category-image fallback in place
    }
  }
  const { error: variantError } = await ctx.db.from("product_variants").insert({
    product_id: product.id,
    color: "As shown",
    sku: `TT-NEW-${randomToken(4)}`,
    price,
    stock: Math.floor(stock),
  });
  if (variantError) {
    // Roll back the product so no orphan row is left behind.
    await ctx.db.from("products").delete().eq("id", product.id);
    return NextResponse.json({ error: variantError.message }, { status: 500 });
  }

  const { data: created, error: fetchError } = await ctx.db
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", product.id)
    .single();
  if (fetchError || !created) {
    return NextResponse.json(
      { error: fetchError?.message ?? "Failed to load created product" },
      { status: 500 }
    );
  }
  return NextResponse.json(mapProductRow(created, imageUrl), { status: 201 });
}
