// Pure, client-safe sales-analytics helpers for the admin dashboard.
// Shared by the /api/admin/stats route (Supabase rows) and the dashboard
// page's demo-mode fallback (localStorage-backed Order objects).

export type DayStat = { date: string; revenue: number; orders: number };

export type TopProduct = { name: string; revenue: number; qty: number };

export type AdminStats = {
  revenue: number;
  ordersCount: number;
  avgOrder: number;
  /** Last 30 days, ascending, zero-filled. Dates are local YYYY-MM-DD. */
  daily: DayStat[];
  topProducts: TopProduct[];
};

export type StatsOrderInput = {
  placedAt: string;
  total: number;
  status: string;
  items: { name: string; price: number; qty: number }[];
};

/** Cancelled orders are excluded from sales figures. */
export function isActiveOrder(status: string): boolean {
  return status !== "Cancelled";
}

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function buildAdminStats(orders: StatsOrderInput[]): AdminStats {
  const active = orders.filter((o) => isActiveOrder(o.status));

  const revenue = active.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const ordersCount = active.length;
  const avgOrder = ordersCount > 0 ? Math.round(revenue / ordersCount) : 0;

  // Last 30 days, zero-filled.
  const days: DayStat[] = [];
  const byDay = new Map<string, DayStat>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const entry = { date: dayKey(d), revenue: 0, orders: 0 };
    days.push(entry);
    byDay.set(entry.date, entry);
  }
  for (const o of active) {
    const at = new Date(o.placedAt);
    if (Number.isNaN(at.getTime())) continue;
    const entry = byDay.get(dayKey(at));
    if (entry) {
      entry.revenue += Number(o.total) || 0;
      entry.orders += 1;
    }
  }

  // Top products by revenue across active orders.
  const byProduct = new Map<string, TopProduct>();
  for (const o of active) {
    for (const item of o.items ?? []) {
      const name = (item.name ?? "").trim() || "Unknown product";
      const qty = Number(item.qty) || 0;
      const rev = (Number(item.price) || 0) * qty;
      const existing = byProduct.get(name);
      if (existing) {
        existing.revenue += rev;
        existing.qty += qty;
      } else {
        byProduct.set(name, { name, revenue: rev, qty });
      }
    }
  }
  const topProducts = Array.from(byProduct.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  return { revenue, ordersCount, avgOrder, daily: days, topProducts };
}

/** Compact PKR label for chart axes, e.g. 150000 -> "Rs 1.5L", 25000 -> "Rs 25k". */
export function compactPKR(n: number): string {
  const trim = (v: number) =>
    Number.isInteger(v) ? String(v) : v.toFixed(1).replace(/\.0$/, "");
  if (n >= 100000) return `Rs ${trim(Math.round(n / 1000) / 100)}L`;
  if (n >= 1000) return `Rs ${trim(Math.round(n / 100) / 10)}k`;
  return `Rs ${Math.round(n)}`;
}
