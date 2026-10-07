"use client";

import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store";
import { formatPKR } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function ProductCard({ product }: { product: Product }) {
  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const wishlisted = wishlist.includes(product.id);

  const href = `/product/${product.slug}`;

  return (
    <div className="relative group">
      <Link href={href} aria-label={product.name} className="block">
        <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-espresso/5">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.compareAtPrice ? <Badge tone="sale">Sale</Badge> : null}
            {product.isNew ? <Badge tone="new">New</Badge> : null}
            {product.bestSeller ? <Badge tone="default">Bestseller</Badge> : null}
          </div>
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
        className="absolute right-3 top-3 rounded-full bg-ivory/90 backdrop-blur p-2 shadow-sm transition-colors hover:bg-ivory"
      >
        <Heart
          className={clsx("h-4 w-4", wishlisted ? "fill-cognac text-cognac" : "text-espresso")}
          aria-hidden="true"
        />
      </button>
      <div className="pt-4">
        <p className="text-xs uppercase tracking-wide text-espresso/50">{capitalize(product.category)}</p>
        <Link href={href} className="block mt-1">
          <h3 className="font-display text-lg text-espresso leading-snug">{product.name}</h3>
        </Link>
        <div className="mt-1.5 flex items-center gap-1.5">
          <StarRating value={product.rating} size={14} />
          <span className="text-xs text-espresso/50">({product.reviewCount})</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-semibold text-espresso">{formatPKR(product.price)}</span>
          {product.compareAtPrice ? (
            <span className="text-sm text-espresso/40 line-through">{formatPKR(product.compareAtPrice)}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
