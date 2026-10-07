"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ui/product-card";
import { categories } from "@/lib/products";
import type { Product } from "@/lib/types";

/**
 * CategoryBestSellers — one premium section per category showing that
 * category's best-seller products in an elegant horizontal scroll row.
 * Categories without best sellers are skipped.
 */
export function CategoryBestSellers({ products }: { products: Product[] }) {
  const sections = categories
    .map((category) => ({
      category,
      items: products.filter(
        (p) => p.active !== false && p.category === category.slug && p.bestSeller
      ).slice(0, 4),
    }))
    .filter((s) => s.items.length > 0);

  if (sections.length === 0) return null;

  return (
    <>
      {sections.map(({ category, items }, si) => (
        <section
          key={category.slug}
          aria-label={`${category.name} best sellers`}
          className={
            si % 2 === 1
              ? "border-y border-espresso/10 bg-ivory-dark/60 py-16 sm:py-20"
              : "py-16 sm:py-20"
          }
        >
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-xl">
                <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-cognac">
                  <span className="inline-block h-px w-8 bg-cognac" aria-hidden="true" />
                  Best sellers
                </p>
                <h2 className="font-display mt-3 text-3xl tracking-tight text-espresso sm:text-4xl">
                  {category.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-espresso/60 sm:text-base">
                  {category.tagline}
                </p>
              </div>
              <Link
                href={`/shop?category=${category.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-cognac-dark transition-colors hover:text-espresso"
              >
                Shop all {category.name.toLowerCase()}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div
              className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-6 sm:overflow-visible sm:px-0"
              role="list"
              aria-label={`${category.name} best sellers`}
            >
              {items.map((product) => (
                <div
                  key={product.id}
                  role="listitem"
                  className="w-[68vw] max-w-[260px] shrink-0 snap-start sm:w-auto sm:max-w-none"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
