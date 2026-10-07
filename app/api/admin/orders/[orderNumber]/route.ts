import { NextRequest, NextResponse } from "next/server";
import { isAdminResultError, requireAdmin } from "../../_auth";
import { mapOrderRow } from "../../_map";
import type { OrderStatus } from "@/lib/types";

const VALID_STATUSES: OrderStatus[] = [
  "Placed",
  "Confirmed",
  "Shipped",
  "Out for delivery",
  "Delivered",
];

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

/** PATCH /api/admin/orders/[orderNumber] — { status } updates the order status. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  const ctx = await requireAdmin();
  if (isAdminResultError(ctx)) return ctx.error;
  const orderNumber = decodeURIComponent(params.orderNumber);
  const body = (await req.json().catch(() => ({}))) as { status?: unknown };
  if (!VALID_STATUSES.includes(body.status as OrderStatus)) {
    return NextResponse.json(
      { error: `Invalid status. Use one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }
  const { error } = await ctx.db
    .from("orders")
    .update({ status: body.status })
    .eq("order_number", orderNumber);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
