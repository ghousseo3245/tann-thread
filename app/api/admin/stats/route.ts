import { NextResponse } from "next/server";
import { isAdminResultError, requireAdmin } from "../_auth";
import {
  buildAdminStats,
  type StatsOrderInput,
} from "@/lib/admin-analytics";

/** GET /api/admin/stats — sales analytics: revenue, order counts, average
 *  order value, daily revenue/orders for the last 30 days, and top products
 *  by revenue. Cancelled orders are excluded from sales figures. */
export async function GET() {
  const ctx = await requireAdmin();
  if (isAdminResultError(ctx)) return ctx.error;
  const { data, error } = await ctx.db
    .from("orders")
    .select("total, status, placed_at, order_items ( name, price, qty )");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const orders: StatsOrderInput[] = (
    (data ?? []) as {
      total: string | number | null;
      status: string | null;
      placed_at: string | null;
      order_items: {
        name: string | null;
        price: string | number | null;
        qty: number | null;
      }[];
    }[]
  ).map((row) => ({
    placedAt: row.placed_at ?? new Date().toISOString(),
    total: Number(row.total ?? 0),
    status: row.status ?? "Placed",
    items: (row.order_items ?? []).map((i) => ({
      name: i.name ?? "",
      price: Number(i.price ?? 0),
      qty: i.qty ?? 0,
    })),
  }));
  return NextResponse.json(buildAdminStats(orders));
}
