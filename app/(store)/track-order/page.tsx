"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  ClipboardCheck,
  Home,
  Package,
  PackageSearch,
  Truck,
} from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { useStore } from "@/lib/store";
import { formatPKR } from "@/lib/products";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_STEPS: { status: OrderStatus; icon: typeof Truck; label: string }[] = [
  { status: "Placed", icon: ClipboardCheck, label: "Order placed" },
  { status: "Confirmed", icon: CheckCircle2, label: "Confirmed" },
  { status: "Shipped", icon: Truck, label: "Shipped" },
  { status: "Out for delivery", icon: Package, label: "Out for delivery" },
  { status: "Delivered", icon: Home, label: "Delivered" },
];

export default function TrackOrderPage() {
  const getOrder = useStore((s) => s.getOrder);
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!orderNumber.trim()) next.orderNumber = "Enter your order number.";
    if (!phone.trim()) next.phone = "Enter the mobile number used for the order.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const found = getOrder(orderNumber.trim().toUpperCase(), phone.replace(/\D/g, ""));
    setOrder(found ?? null);
    setSearched(true);
  };

  const currentIndex = order
    ? Math.max(
        0,
        STATUS_STEPS.findIndex((s) => s.status === order.status)
      )
    : 0;

  const inputClass = (hasError: boolean) =>
    clsx(
      "w-full rounded-xl border bg-ivory px-4 py-3 text-sm text-espresso placeholder:text-espresso/40 focus:outline-none focus:ring-2 focus:ring-cognac",
      hasError ? "border-red-700" : "border-espresso/20"
    );

  return (
    <div className="container-x py-10 sm:py-14">
      <SectionHeader
        eyebrow="Order tracking"
        title="Track your order"
        copy="Enter your order number and the mobile number you checked out with."
      />

      <form
        onSubmit={submit}
        noValidate
        className="mx-auto mt-8 grid max-w-2xl gap-4 rounded-2xl border border-espresso/10 p-5 sm:grid-cols-[1fr_1fr_auto] sm:p-6"
      >
        <div>
          <label htmlFor="track-order-number" className="mb-1.5 block text-sm font-medium text-espresso">
            Order number
          </label>
          <input
            id="track-order-number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="TT-2026-1042"
            autoComplete="off"
            className={inputClass(!!errors.orderNumber)}
          />
          {errors.orderNumber ? (
            <p role="alert" className="mt-1 text-xs text-red-700">{errors.orderNumber}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="track-phone" className="mb-1.5 block text-sm font-medium text-espresso">
            Mobile number
          </label>
          <input
            id="track-phone"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="03001234567"
            autoComplete="tel"
            className={inputClass(!!errors.phone)}
          />
          {errors.phone ? (
            <p role="alert" className="mt-1 text-xs text-red-700">{errors.phone}</p>
          ) : null}
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full sm:w-auto">
            Track
          </Button>
        </div>
        <p className="text-xs text-espresso/55 sm:col-span-3">
          Trying the demo? Use <span className="font-semibold text-espresso">TT-2026-1042</span>{" "}
          with <span className="font-semibold text-espresso">03001234567</span>.
        </p>
      </form>

      {searched && !order ? (
        <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center rounded-2xl border border-dashed border-espresso/20 px-6 py-12 text-center">
          <span className="rounded-full bg-espresso/5 p-4">
            <PackageSearch className="h-7 w-7 text-espresso/50" aria-hidden="true" />
          </span>
          <h2 className="font-display mt-4 text-2xl text-espresso">No order found</h2>
          <p className="mt-2 max-w-sm text-sm text-espresso/60">
            We could not find an order with that number and mobile combination. Double-check
            both, or contact us and we will help.
          </p>
        </div>
      ) : null}

      {order ? (
        <div className="mx-auto mt-8 max-w-3xl">
          <div className="rounded-2xl border border-espresso/10 p-5 sm:p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl text-espresso">{order.orderNumber}</h2>
              <p className="text-sm text-espresso/60">
                Placed {order.placedAt} · {order.city}
              </p>
            </div>

            {/* Status timeline */}
            <ol className="mt-6">
              {STATUS_STEPS.map((step, i) => {
                const done = i < currentIndex;
                const current = i === currentIndex;
                return (
                  <li key={step.status} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < STATUS_STEPS.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className={clsx(
                          "absolute left-5 top-10 h-[calc(100%-2.5rem)] w-0.5",
                          done || current ? "bg-cognac" : "bg-espresso/15"
                        )}
                      />
                    ) : null}
                    <span
                      className={clsx(
                        "z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        current
                          ? "bg-cognac text-white ring-4 ring-cognac/25"
                          : done
                            ? "bg-cognac/20 text-cognac-dark"
                            : "bg-espresso/8 text-espresso/40"
                      )}
                    >
                      <step.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="pt-1">
                      <p
                        className={clsx(
                          "text-sm font-semibold",
                          current ? "text-espresso" : done ? "text-espresso/80" : "text-espresso/45"
                        )}
                      >
                        {step.label}
                        {current ? (
                          <span className="ml-2 rounded-full bg-cognac/15 px-2.5 py-0.5 text-xs font-semibold text-cognac-dark">
                            Current
                          </span>
                        ) : null}
                      </p>
                      {current && order.timeline.length > 0 ? (
                        <p className="mt-0.5 text-xs text-espresso/55">
                          Last update: {order.timeline[order.timeline.length - 1].at}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Order summary */}
          <div className="mt-5 rounded-2xl border border-espresso/10 p-5 sm:p-7">
            <h3 className="font-display text-xl text-espresso">Order summary</h3>
            <ul className="mt-4 space-y-4">
              {order.items.map((item, i) => (
                <li key={`${item.name}-${i}`} className="flex gap-3">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-espresso/5">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium leading-snug text-espresso">{item.name}</p>
                      <p className="mt-0.5 text-xs text-espresso/55">
                        {item.variantLabel} · Qty {item.qty}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-espresso">
                      {formatPKR(item.price * item.qty)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-espresso/10 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-espresso/65">Subtotal</dt>
                <dd className="font-medium text-espresso">{formatPKR(order.subtotal)}</dd>
              </div>
              {order.discount > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-espresso/65">Discount</dt>
                  <dd className="font-medium text-cognac-dark">-{formatPKR(order.discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-espresso/65">Delivery</dt>
                <dd className="font-medium text-espresso">
                  {order.deliveryFee === 0 ? "Free" : formatPKR(order.deliveryFee)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-espresso/10 pt-3 text-base">
                <dt className="font-semibold text-espresso">Total</dt>
                <dd className="font-display text-xl font-semibold text-espresso">
                  {formatPKR(order.total)}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-espresso/55">
              Payment: {order.paymentMethod === "COD" ? "Cash on Delivery" : "Card"} · Shipping
              to {order.address}, {order.city}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
