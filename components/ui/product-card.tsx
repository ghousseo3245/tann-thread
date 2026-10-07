"use client";

import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import { ArrowRight, Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store";
import { formatPKR } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function ProductCard({ product, dark }: { product: Product; dark?: boolean }) {
  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const wishlisted = wishlist.includes(product.id);

  const href = `/product/${product.slug}`;

  return (
    <div className="group relative">
      <Link href={href} aria-label={product.name} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-espresso/5 ring-1 ring-espresso/10">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso-deep/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            aria-hidden="true"
          />
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {product.compareAtPrice ? <Badge tone="sale">Sale</Badge> : null}
            {product.isNew ? <Badge tone="new">New</Badge> : null}
            {product.bestSeller ? <Badge tone="default">Bestseller</Badge> : null}
          </div>
          <span className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ivory/95 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-espresso shadow-lg backdrop-blur">
              Quick view
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </span>
        </div>
      </Link>
      <button
        type="button"
        aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        aria-pressed={wishlisted}
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          toggleWishlist(product.id);
        }}
        className={clsx(
          "absolute right-3 top-3 rounded-full p-2 shadow-md ring-1 ring-espresso/10 backdrop-blur transition-all",
          wishlisted
            ? "bg-ivory text-cognac"
            : "bg-ivory/90 text-espresso/70 hover:bg-ivory hover:text-espresso"
        )}
      >
        <Heart
          className={clsx("h-4 w-4", wishlisted && "fill-cognac text-cognac")}
          aria-hidden="true"
        />
      </button>
      <div className="px-0.5 pt-4">
        <p
          className={clsx(
            "text-[11px] font-semibold uppercase tracking-[0.18em]",
            dark ? "text-ivory/50" : "text-espresso/45"
          )}
        >
          {capitalize(product.category)}
        </p>
        <Link href={href} className="mt-1 block">
          <h3
            className={clsx(
              "font-display text-[1.05rem] leading-snug transition-colors",
              dark
                ? "text-ivory group-hover:text-gold"
                : "text-espresso group-hover:text-cognac-dark"
            )}
          >
            {product.name}
          </h3>
        </Link>
        <div className="mt-1.5 flex items-center gap-1.5">
          <StarRating value={product.rating} size={13} />
          <span className={clsx("text-xs", dark ? "text-ivory/50" : "text-espresso/45")}>
            ({product.reviewCount})
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span
            className={clsx(
              "text-[1.05rem] font-semibold tracking-tight",
              dark ? "text-ivory" : "text-espresso"
            )}
          >
            {formatPKR(product.price)}
          </span>
          {product.compareAtPrice ? (
            <span
              className={clsx(
                "text-sm line-through",
                dark ? "text-ivory/40" : "text-espresso/40"
              )}
            >
              {formatPKR(product.compareAtPrice)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
