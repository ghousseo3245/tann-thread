"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { formatPKR } from "@/lib/products";
import type { Product } from "@/lib/types";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
    ended: diff <= 0,
  };
}

/**
 * SaleSection — premium FOMO band for discounted products.
 * Deep espresso background, gold accents, live countdown timer.
 * Hidden entirely when there are no discounted products.
 */
export function SaleSection({
  products,
  title,
  subtitle,
  endsAt,
}: {
  products: Product[];
  title: string;
  subtitle: string;
  endsAt: string;
}) {
  const router = useRouter();

  const discounted = useMemo(
    () =>
      products.filter(
        (p) =>
          p.active !== false &&
          p.compareAtPrice !== undefined &&
          p.compareAtPrice > p.price
      ),
    [products]
  );

  // Sale end: CMS value when valid, otherwise a rolling 7-day fallback so the
  // timer always has something to count down to.
  const target = useMemo(() => {
    const parsed = endsAt ? Date.parse(endsAt) : NaN;
    if (!Number.isNaN(parsed) && parsed > Date.now()) return parsed;
    return Date.now() + 7 * 24 * 60 * 60 * 1000;
  }, [endsAt]);

  const { days, hours, minutes, seconds, ended } = useCountdown(target);

  if (discounted.length === 0 || ended) return null;

  const units = [
    { value: pad(days), label: "Days" },
    { value: pad(hours), label: "Hours" },
    { value: pad(minutes), label: "Mins" },
    { value: pad(seconds), label: "Secs" },
  ];

  return (
    <section
      aria-label={title}
      className="relative overflow-hidden bg-espresso-deep py-16 sm:py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,162,75,0.12),transparent_65%)]"
        aria-hidden="true"
      />
      <div className="container-x relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            <Timer className="h-3.5 w-3.5" aria-hidden="true" />
            Limited time
          </p>
          <h2 className="font-display mt-5 text-balance text-4xl tracking-tight text-ivory sm:text-5xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ivory/70">{subtitle}</p>

          {/* Countdown */}
          <div
            className="mt-8 flex items-stretch justify-center gap-2 sm:gap-3"
            role="timer"
            aria-label={`Sale ends in ${days} days, ${hours} hours, ${minutes} minutes`}
          >
            {units.map((u) => (
              <div
                key={u.label}
                className="min-w-[70px] rounded-2xl border border-gold/25 bg-ivory/[0.06] px-3 py-3 backdrop-blur-sm sm:min-w-[86px] sm:px-4 sm:py-4"
              >
                <p className="font-display text-2xl tabular-nums text-gold sm:text-4xl">
                  {u.value}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory/55 sm:text-xs">
                  {u.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {discounted.slice(0, 4).map((product) => {
            const pct = Math.round(
              ((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100
            );
            return (
              <div key={product.id} className="relative">
                <span className="absolute -top-2.5 left-3 z-10 rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-espresso-deep shadow-md">
                  Save {pct}%
                </span>
                <ProductCard product={product} dark />
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <Button
            size="lg"
            onClick={() => router.push("/shop?onSale=true")}
            className="bg-gold text-espresso-deep hover:bg-gold-light"
          >
            Shop the Sale
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <p className="text-xs text-ivory/50">
            Discounts applied automatically. No codes needed.
          </p>
        </div>
      </div>
    </section>
  );
}
