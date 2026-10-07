import { NextRequest, NextResponse } from "next/server";
import { isAdminResultError, requireAdmin } from "../../_auth";

type PatchBody = {
  op?: unknown;
  variantId?: unknown;
  value?: unknown;
};

const FIELD_WHITELIST = [
  "name",
  "tagline",
  "description",
  "materials",
  "care",
  "price",
  "compare_at_price",
  "active",
  "featured",
  "best_seller",
  "is_new",
] as const;

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/** PATCH /api/admin/products/[id]
 *  { op: "stock",  variantId: string | null, value: number } — update one
 *    variant's stock, or every variant of the product when variantId is null.
 *  { op: "price",  variantId: string | null, value: number } — update one
 *    variant's price, or the product-level price when variantId is null.
 *  { op: "active", value: boolean } — flip the product's active flag.
 *  { op: "fields", value: Record<string, unknown> } — update whitelisted
 *    product columns (name, tagline, description, materials, care, price,
 *    compare_at_price, active, featured, best_seller, is_new). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await requireAdmin();
  if (isAdminResultError(ctx)) return ctx.error;
  const productId = decodeURIComponent(params.id);
  const body = (await req.json().catch(() => ({}))) as PatchBody;
  const op = body.op;

  if (op === "stock") {
    const stock = Math.floor(Number(body.value));
    if (!Number.isFinite(stock) || stock < 0) return badRequest("Invalid stock value");
    const query = ctx.db.from("product_variants").update({ stock });
    const { error } =
      typeof body.variantId === "string" && body.variantId
        ? await query.eq("id", body.variantId).eq("product_id", productId)
        : await query.eq("product_id", productId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (op === "price") {
    const price = Number(body.value);
    if (!Number.isFinite(price) || price < 0) return badRequest("Invalid price value");
    if (typeof body.variantId === "string" && body.variantId) {
      const { error } = await ctx.db
        .from("product_variants")
        .update({ price })
        .eq("id", body.variantId)
        .eq("product_id", productId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const { error } = await ctx.db
        .from("products")
        .update({ price })
        .eq("id", productId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (op === "active") {
    if (typeof body.value !== "boolean") return badRequest("Invalid active value");
    const { error } = await ctx.db
      .from("products")
      .update({ active: body.value })
      .eq("id", productId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (op === "fields") {
    const value = body.value;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return badRequest("Invalid fields value");
    }
    const patch: Record<string, unknown> = {};
    for (const key of FIELD_WHITELIST) {
      if ((value as Record<string, unknown>)[key] !== undefined) {
        patch[key] = (value as Record<string, unknown>)[key];
      }
    }
    if (Object.keys(patch).length === 0) return badRequest("No updatable fields");
    const { error } = await ctx.db.from("products").update(patch).eq("id", productId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return badRequest('Unknown op. Use "stock", "price", "active", or "fields".');
}

/** DELETE /api/admin/products/[id] — delete the product (variants cascade). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await requireAdmin();
  if (isAdminResultError(ctx)) return ctx.error;
  const productId = decodeURIComponent(params.id);
  const { error } = await ctx.db.from("products").delete().eq("id", productId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
