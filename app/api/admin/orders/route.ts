import { NextResponse } from "next/server";
import { isAdminResultError, requireAdmin } from "../_auth";
import { mapOrderRow } from "../_map";

/** GET /api/admin/orders — all orders, newest first, with items and a
 *  synthesized timeline. */
export async function GET() {
  const ctx = await requireAdmin();
  if (isAdminResultError(ctx)) return ctx.error;
  const { data, error } = await ctx.db
    .from("orders")
    .select(
      `order_number, phone, name, email, city, address, payment_method,
       subtotal, discount, delivery_fee, total, status, placed_at,
       order_items ( name, variant_label, price, qty )`
    )
    .order("placed_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json((data ?? []).map(mapOrderRow));
}
