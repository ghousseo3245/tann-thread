"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Info,
  Package,
  ShoppingBag,
  TriangleAlert,
} from "lucide-react";
import { isDemoMode, listOrders } from "@/lib/inventory";
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

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    setDemo(isDemoMode());
    Promise.all([listAdminProducts(), listOrders()])
      .then(([ps, os]) => {
        setProducts(ps);
        setOrders(os);
      })
      .catch(() => {
        setError("Could not load dashboard data. Please refresh the page.");
      });
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

  const revenue = useMemo(() => {
    if (!orders) return null;
    return orders.reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

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
          label="Total products"
          value={products ? String(products.length) : null}
          icon={Package}
        />
        <StatCard
          label="Low-stock variants"
          value={lowStockCount === null ? null : String(lowStockCount)}
          icon={TriangleAlert}
        />
        <StatCard
          label="Orders"
          value={orders ? String(orders.length) : null}
          icon={ShoppingBag}
        />
        <StatCard
          label="Revenue"
          value={revenue === null ? null : formatPKR(revenue)}
          icon={Banknote}
        />
      </div>

      {/* Panels */}
      <div className="grid gap-4 lg:grid-cols-2">
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
    </div>
  );
}
