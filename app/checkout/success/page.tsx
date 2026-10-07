"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
  PhoneCall,
  Truck,
} from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/lib/store";

const STEPS = [
  { icon: ClipboardCheck, label: "Order placed", copy: "We have your order and are preparing it." },
  { icon: PhoneCall, label: "Confirmation call", copy: "Our team calls to confirm your details." },
  { icon: Truck, label: "Shipped", copy: "Your pieces leave our Lahore workshop." },
  { icon: PackageCheck, label: "Delivered", copy: "At your doorstep in 3 to 5 working days." },
];

function SuccessContent() {
  const searchParams = useSearchParams();
  const orders = useStore((s) => s.orders);

  const orderNumber = (searchParams.get("order") ?? "").trim();
  const order = orderNumber
    ? orders.find((o) => o.orderNumber.toLowerCase() === orderNumber.toLowerCase())
    : undefined;
  const firstName = order?.name.split(" ")[0] ?? "friend";

  return (
    <div className="container-x py-14 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto inline-flex rounded-full bg-cognac/15 p-5">
          <CheckCircle2 className="h-12 w-12 text-cognac-dark" aria-hidden="true" />
        </span>
        <h1 className="font-display mt-6 text-4xl text-espresso sm:text-5xl">
          Thank you, {firstName}.
        </h1>
        <p className="mt-3 text-espresso/65">
          Your order is confirmed. We will call you shortly to confirm the details before
          dispatch.
        </p>
        <div className="mt-6 inline-block rounded-2xl border border-espresso/15 bg-ivory-dark/60 px-8 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso/55">
            Order number
          </p>
          <p className="font-display mt-1 text-3xl font-semibold tracking-wide text-espresso">
            {orderNumber || "TT-2026-0000"}
          </p>
        </div>

        {/* Next steps timeline */}
        <ol className="mt-10 grid gap-4 text-left sm:grid-cols-4">
          {STEPS.map((step, i) => (
            <li
              key={step.label}
              className={clsx(
                "relative rounded-2xl border p-4",
                i === 0
                  ? "border-cognac bg-cognac/5"
                  : "border-espresso/10 opacity-70"
              )}
            >
              <span
                className={clsx(
                  "inline-flex rounded-full p-2.5",
                  i === 0 ? "bg-cognac text-white" : "bg-espresso/8 text-espresso/60"
                )}
              >
                <step.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-semibold text-espresso">
                {i + 1}. {step.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-espresso/60">{step.copy}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/track-order">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Track Your Order
            </Button>
          </Link>
          <Link href="/shop">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container-x py-20 text-center">
          <Skeleton className="mx-auto h-16 w-16 rounded-full" />
          <Skeleton className="mx-auto mt-6 h-10 w-64" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
