"use client";

import { useEffect, useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { listOrders, updateOrderStatus } from "@/lib/inventory";
import { formatPKR } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { UPDATABLE_STATUSES, formatDate, inputClass, statusTone } from "../_shared";
import type { Order, OrderStatus } from "@/lib/types";
import { clsx } from "clsx";

function itemsCount(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.qty, 0);
}

function paymentLabel(order: Order): string {
  return order.paymentMethod === "COD" ? "Cash on delivery" : "Card";
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [statusBusy, setStatusBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      setOrders(await listOrders());
    } catch {
      setError("Could not load orders. Please refresh the page.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const sorted = useMemo(() => {
    if (!orders) return null;
    return [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  }, [orders]);

  const selected = useMemo(
    () => orders?.find((o) => o.orderNumber === selectedNumber) ?? null,
    [orders, selectedNumber]
  );

  async function handleStatusChange(order: Order, status: OrderStatus) {
    if (status === order.status) return;
    setError("");
    setStatusBusy(true);
    try {
      await updateOrderStatus(order.orderNumber, status);
      setOrders(await listOrders());
    } catch {
      setError("Could not update the order status. Please try again.");
    } finally {
      setStatusBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-espresso">Orders</h1>
        <p className="mt-1 text-sm text-espresso/60">
          Click an order to see the details and update its status.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-[#8C2F2F]/20 bg-[#8C2F2F]/5 px-4 py-3 text-sm font-medium text-[#8C2F2F]">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-espresso/10 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-espresso/10 text-xs uppercase tracking-wide text-espresso/50">
              <th className="px-4 py-3 font-semibold">Order no.</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Items</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted === null ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-espresso/5">
                  <td className="px-4 py-3" colSpan={6}>
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <ShoppingBag
                    className="mx-auto h-10 w-10 text-espresso/25"
                    aria-hidden="true"
                  />
                  <p className="mt-3 font-display text-xl text-espresso">
                    No orders yet
                  </p>
                  <p className="mt-1 text-sm text-espresso/60">
                    Orders placed on the store will appear here.
                  </p>
                </td>
              </tr>
            ) : (
              sorted.map((order) => (
                <tr
                  key={order.orderNumber}
                  onClick={() => setSelectedNumber(order.orderNumber)}
                  className="cursor-pointer border-b border-espresso/5 transition-colors last:border-0 hover:bg-ivory-dark/60"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-cognac">
                      {order.orderNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-espresso/80">
                    {formatDate(order.placedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-espresso">{order.name}</p>
                    <p className="text-xs text-espresso/50">{order.city}</p>
                  </td>
                  <td className="px-4 py-3 text-espresso/80">{itemsCount(order)}</td>
                  <td className="px-4 py-3 font-medium text-espresso">
                    {formatPKR(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order detail drawer */}
      <Drawer
        open={selected !== null}
        onClose={() => setSelectedNumber(null)}
        title={selected ? `Order ${selected.orderNumber}` : "Order"}
      >
        {selected ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge tone={statusTone(selected.status)}>{selected.status}</Badge>
              <span className="text-sm text-espresso/60">
                Placed on {formatDate(selected.placedAt)}
              </span>
            </div>

            {/* Customer */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-espresso/50">
                Customer
              </h3>
              <div className="mt-2 rounded-xl bg-white p-4 text-sm leading-relaxed text-espresso">
                <p className="font-semibold">{selected.name}</p>
                <p className="text-espresso/70">{selected.phone}</p>
                {selected.email ? (
                  <p className="text-espresso/70">{selected.email}</p>
                ) : null}
                <p className="mt-2 text-espresso/70">
                  {selected.address}
                  <br />
                  {selected.city}
                </p>
              </div>
            </section>

            {/* Items */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-espresso/50">
                Items ({itemsCount(selected)})
              </h3>
              <ul className="mt-2 divide-y divide-espresso/5 rounded-xl bg-white px-4">
                {selected.items.map((item, i) => (
                  <li key={`${item.name}-${i}`} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-espresso">
                          {item.name} <span className="text-espresso/50">x {item.qty}</span>
                        </p>
                        <p className="text-xs text-espresso/50">{item.variantLabel}</p>
                      </div>
                      <p className="text-sm font-medium text-espresso">
                        {formatPKR(item.price * item.qty)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Summary */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-espresso/50">
                Summary
              </h3>
              <dl className="mt-2 space-y-1.5 rounded-xl bg-white p-4 text-sm text-espresso">
                <div className="flex justify-between">
                  <dt className="text-espresso/60">Subtotal</dt>
                  <dd>{formatPKR(selected.subtotal)}</dd>
                </div>
                {selected.discount > 0 ? (
                  <div className="flex justify-between">
                    <dt className="text-espresso/60">Discount</dt>
                    <dd className="text-emerald-700">-{formatPKR(selected.discount)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <dt className="text-espresso/60">Delivery</dt>
                  <dd>{formatPKR(selected.deliveryFee)}</dd>
                </div>
                <div className="flex justify-between border-t border-espresso/10 pt-2 font-semibold">
                  <dt>Total</dt>
                  <dd>{formatPKR(selected.total)}</dd>
                </div>
                <div className="flex justify-between pt-1">
                  <dt className="text-espresso/60">Payment</dt>
                  <dd>{paymentLabel(selected)}</dd>
                </div>
              </dl>
            </section>

            {/* Status timeline */}
            {selected.timeline.length > 0 ? (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-espresso/50">
                  Timeline
                </h3>
                <ol className="mt-2 space-y-2.5 rounded-xl bg-white p-4">
                  {selected.timeline.map((entry, i) => (
                    <li key={`${entry.label}-${i}`} className="flex items-start gap-3 text-sm">
                      <span
                        className={clsx(
                          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                          i === 0 ? "bg-cognac" : "bg-espresso/20"
                        )}
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-medium text-espresso">{entry.label}</p>
                        <p className="text-xs text-espresso/50">{formatDate(entry.at)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {/* Status update */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-espresso/50">
                Update status
              </h3>
              <select
                value={selected.status}
                onChange={(event) =>
                  handleStatusChange(selected, event.target.value as OrderStatus)
                }
                disabled={statusBusy}
                aria-label="Order status"
                className={clsx(inputClass, "mt-2", statusBusy && "opacity-60")}
              >
                {UPDATABLE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
                {/* Legacy status kept readable on old rows; new orders use the pipeline above. */}
                {!UPDATABLE_STATUSES.includes(selected.status) ? (
                  <option value={selected.status}>{selected.status}</option>
                ) : null}
              </select>
              {statusBusy ? (
                <p className="mt-2 text-xs text-espresso/50">Updating status...</p>
              ) : null}
            </section>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
