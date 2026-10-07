"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Info,
  Package,
  Receipt,
  ShoppingBag,
  TriangleAlert,
} from "lucide-react";
import { isDemoMode, listOrders } from "@/lib/inventory";
import {
  buildAdminStats,
  compactPKR,
  type AdminStats,
  type DayStat,
} from "@/lib/admin-analytics";
import { formatPKR } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LOW_STOCK_THRESHOLD,
  listAdminProducts,
  statusTone,
  variantLabel,
  type AdminProduct,
} from "./_shared";
import type { Order } from "@/lib/types";
import { clsx } from "clsx";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | null;
  icon: typeof Package;
}) {
  return (
    <div className="rounded-2xl border border-espresso/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-espresso/5 p-2.5 text-cognac">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-espresso/60">{label}</p>
      </div>
      <div className="mt-3">
        {value === null ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className="font-display text-3xl text-espresso">{value}</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sales chart (hand-rolled SVG, no chart dependencies)                 */
/* ------------------------------------------------------------------ */

function niceCeil(v: number): number {
  if (v <= 0) return 1;
  const exp = Math.floor(Math.log10(v));
  const base = Math.pow(10, exp);
  const n = v / base;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return nice * base;
}

function shortDayLabel(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-full border border-espresso/15 bg-ivory p-1"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={o.value === value}
          className={clsx(
            "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
            o.value === value
              ? "bg-espresso text-ivory"
              : "text-espresso/60 hover:text-espresso"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SalesChart({ daily }: { daily: DayStat[] }) {
  const [metric, setMetric] = useState<"revenue" | "orders">("revenue");
  const [range, setRange] = useState<7 | 30>(7);

  const data = useMemo(() => daily.slice(-range), [daily, range]);
  const valueOf = (d: DayStat) => (metric === "revenue" ? d.revenue : d.orders);

  const W = 680;
  const H = 250;
  const PL = 56;
  const PR = 14;
  const PT = 16;
  const PB = 32;
  const iw = W - PL - PR;
  const ih = H - PT - PB;

  const max = Math.max(1, ...data.map(valueOf));
  const yMax = niceCeil(max);
  const x = (i: number) =>
    data.length <= 1 ? PL + iw / 2 : PL + (i / (data.length - 1)) * iw;
  const y = (v: number) => PT + ih - (v / yMax) * ih;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * yMax);
  const pts = data.map((d, i) => ({ x: x(i), y: y(valueOf(d)), d }));
  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${x(data.length - 1).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`;

  const labelEvery = range === 7 ? 1 : 5;
  const summary =
    metric === "revenue"
      ? `Revenue per day for the last ${range} days`
      : `Orders per day for the last ${range} days`;
  const periodTotal =
    metric === "revenue"
      ? formatPKR(data.reduce((s, d) => s + d.revenue, 0))
      : String(data.reduce((s, d) => s + d.orders, 0));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          label="Metric"
          value={metric}
          onChange={setMetric}
          options={[
            { value: "revenue", label: "Revenue" },
            { value: "orders", label: "Orders" },
          ]}
        />
        <SegmentedControl
          label="Time range"
          value={String(range) as "7" | "30"}
          onChange={(v) => setRange(Number(v) as 7 | 30)}
          options={[
            { value: "7", label: "Last 7 days" },
            { value: "30", label: "Last 30 days" },
          ]}
        />
        <p className="ml-auto text-sm text-espresso/60">
          <span className="font-display text-xl text-espresso">{periodTotal}</span>{" "}
          <span className="text-xs">
            {metric === "revenue" ? "revenue" : "orders"} in period
          </span>
        </p>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={summary}
        className="mt-4 w-full"
      >
        <title>{summary}</title>
        <defs>
          <linearGradient id="sales-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C17A3D" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#C17A3D" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Gridlines + y labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PL}
              x2={W - PR}
              y1={y(t)}
              y2={y(t)}
              stroke="#2A1D11"
              strokeOpacity="0.08"
            />
            <text
              x={PL - 8}
              y={y(t) + 4}
              textAnchor="end"
              fontSize="11"
              fill="#2A1D11"
              fillOpacity="0.55"
            >
              {metric === "revenue" ? compactPKR(t) : Math.round(t)}
            </text>
          </g>
        ))}

        {metric === "revenue" ? (
          <g>
            <path d={areaPath} fill="url(#sales-area)" />
            <path
              d={linePath}
              fill="none"
              stroke="#C17A3D"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {range === 7
              ? pts.map((p, i) => (
                  <g key={i}>
                    <title>
                      {shortDayLabel(p.d.date)}: {formatPKR(p.d.revenue)}
                    </title>
                    <circle cx={p.x} cy={p.y} r="4" fill="#C17A3D" stroke="#fff" strokeWidth="2" />
                  </g>
                ))
              : null}
          </g>
        ) : (
          <g>
            {pts.map((p, i) => {
              const slot = iw / data.length;
              const bw = Math.min(30, slot * 0.55);
              const v = valueOf(p.d);
              return (
                <g key={i}>
                  <title>
                    {shortDayLabel(p.d.date)}: {v} {v === 1 ? "order" : "orders"}
                  </title>
                  <rect
                    x={p.x - bw / 2}
                    y={y(v)}
                    width={bw}
                    height={Math.max(0, y(0) - y(v))}
                    rx={4}
                    fill="#C17A3D"
                    fillOpacity={v === 0 ? 0.25 : 1}
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* X labels */}
        {data.map((d, i) =>
          i % labelEvery === 0 ? (
            <text
              key={d.date}
              x={x(i)}
              y={H - 10}
              textAnchor="middle"
              fontSize="11"
              fill="#2A1D11"
              fillOpacity="0.55"
            >
              {shortDayLabel(d.date)}
            </text>
          ) : null
        )}
      </svg>
      <p className="mt-1 text-xs text-espresso/50">
        Cancelled orders are excluded from sales figures.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard page                                                      */
/* ------------------------------------------------------------------ */

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    async function load() {
      const demoMode = isDemoMode();
      setDemo(demoMode);
      try {
        const [ps, os] = await Promise.all([listAdminProducts(), listOrders()]);
        setProducts(ps);
        setOrders(os);
        if (demoMode) {
          setStats(buildAdminStats(os));
        } else {
          const res = await fetch("/api/admin/stats", { credentials: "include" });
          if (!res.ok) throw new Error(`stats ${res.status}`);
          setStats((await res.json()) as AdminStats);
        }
      } catch {
        setError("Could not load dashboard data. Please refresh the page.");
      }
    }
    load();
  }, []);

  const lowStockRows = useMemo(() => {
    if (!products) return null;
    return products
      .flatMap((p) =>
        p.variants
          .filter((v) => v.stock <= LOW_STOCK_THRESHOLD)
          .map((v) => ({ product: p, variant: v }))
      )
      .slice(0, 5);
  }, [products]);

  const lowStockCount = useMemo(() => {
    if (!products) return null;
    return products.reduce(
      (n, p) => n + p.variants.filter((v) => v.stock <= LOW_STOCK_THRESHOLD).length,
      0
    );
  }, [products]);

  const recentOrders = useMemo(() => {
    if (!orders) return null;
    return [...orders]
      .sort((a, b) => b.placedAt.localeCompare(a.placedAt))
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-espresso">Dashboard</h1>
        <p className="mt-1 text-sm text-espresso/60">
          A quick look at your store today.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-[#8C2F2F]/20 bg-[#8C2F2F]/5 px-4 py-3 text-sm font-medium text-[#8C2F2F]">
          {error}
        </p>
      ) : null}

      {demo ? (
        <div className="flex gap-3 rounded-2xl border border-cognac/25 bg-cognac/10 px-4 py-3 text-sm text-espresso">
          <Info className="h-5 w-5 shrink-0 text-cognac" aria-hidden="true" />
          <p>
            You are viewing demo data. It is stored in this browser and any changes stay
            on this device. Once Supabase is configured, the admin switches to the live
            database automatically.
          </p>
        </div>
      ) : null}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={stats ? formatPKR(stats.revenue) : null}
          icon={Banknote}
        />
        <StatCard
          label="Orders"
          value={stats ? String(stats.ordersCount) : null}
          icon={ShoppingBag}
        />
        <StatCard
          label="Average order value"
          value={stats ? formatPKR(stats.avgOrder) : null}
          icon={Receipt}
        />
        <StatCard
          label="Low-stock variants"
          value={lowStockCount === null ? null : String(lowStockCount)}
          icon={TriangleAlert}
        />
      </div>

      {/* Sales chart */}
      <section className="rounded-2xl border border-espresso/10 bg-white p-5">
        <h2 className="font-display text-xl text-espresso">Sales</h2>
        <div className="mt-3">
          {stats === null ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-56 w-full" />
            </div>
          ) : stats.ordersCount === 0 ? (
            <p className="py-10 text-center text-sm text-espresso/60">
              No order data yet. Sales charts will appear once orders are placed.
            </p>
          ) : (
            <SalesChart daily={stats.daily} />
          )}
        </div>
      </section>

      {/* Panels */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top products */}
        <section className="rounded-2xl border border-espresso/10 bg-white p-5">
          <h2 className="font-display mb-4 text-xl text-espresso">
            Top products by revenue
          </h2>
          {stats === null ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : stats.topProducts.length === 0 ? (
            <p className="py-6 text-center text-sm text-espresso/60">
              No product sales yet.
            </p>
          ) : (
            <ol className="divide-y divide-espresso/5">
              {stats.topProducts.map((p, i) => (
                <li
                  key={`${p.name}-${i}`}
                  className="flex items-center gap-3 py-2.5"
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-espresso/5 text-xs font-bold text-espresso/60"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-espresso">
                      {p.name}
                    </p>
                    <p className="text-xs text-espresso/50">
                      {p.qty} {p.qty === 1 ? "unit" : "units"} sold
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-espresso">
                    {formatPKR(p.revenue)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Recent orders */}
        <section className="rounded-2xl border border-espresso/10 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl text-espresso">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-sm font-semibold text-cognac hover:text-cognac-dark"
            >
              View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          {recentOrders === null ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-espresso/60">
              No orders yet. New orders will appear here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-espresso/10 text-xs uppercase tracking-wide text-espresso/50">
                    <th className="py-2 pr-4 font-semibold">Order</th>
                    <th className="py-2 pr-4 font-semibold">Customer</th>
                    <th className="py-2 pr-4 font-semibold">Total</th>
                    <th className="py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.orderNumber} className="border-b border-espresso/5 last:border-0">
                      <td className="py-2.5 pr-4">
                        <Link
                          href="/admin/orders"
                          className="font-mono text-xs font-semibold text-cognac hover:text-cognac-dark"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 text-espresso">{order.name}</td>
                      <td className="py-2.5 pr-4 font-medium text-espresso">
                        {formatPKR(order.total)}
                      </td>
                      <td className="py-2.5">
                        <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Low stock */}
      <section className="rounded-2xl border border-espresso/10 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-espresso">Low stock</h2>
          <Link
            href="/admin/inventory"
            className="inline-flex items-center gap-1 text-sm font-semibold text-cognac hover:text-cognac-dark"
          >
            Manage inventory <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {lowStockRows === null ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : lowStockRows.length === 0 ? (
          <p className="py-6 text-center text-sm text-espresso/60">
            All variants are well stocked. Nice work.
          </p>
        ) : (
          <ul className="divide-y divide-espresso/5">
            {lowStockRows.map(({ product, variant }) => (
              <li
                key={variant.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-espresso">
                    {product.name}
                  </p>
                  <p className="text-xs text-espresso/50">{variantLabel(variant)}</p>
                </div>
                <Badge tone="low">
                  <TriangleAlert className="mr-1 h-3 w-3" aria-hidden="true" />
                  {variant.stock} left
                </Badge>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-espresso/50">
          Variants with {LOW_STOCK_THRESHOLD} or fewer units in stock.
        </p>
      </section>
    </div>
  );
}
