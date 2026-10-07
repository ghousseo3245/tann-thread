"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ProductCard } from "@/components/ui/product-card";
import { useStore } from "@/lib/store";
import { getCatalog } from "@/lib/catalog";
import type { Product } from "@/lib/types";

export default function WishlistPage() {
  const router = useRouter();
  const wishlist = useStore((s) => s.wishlist);
  const [catalog, setCatalog] = useState<Product[]>([]);

  useEffect(() => {
    getCatalog()
      .then(setCatalog)
      .catch(() => setCatalog([]));
  }, []);

  const items = wishlist
    .map((id) => catalog.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <div className="container-x py-10 sm:py-14">
      <SectionHeader
        eyebrow="Saved pieces"
        title="Your wishlist"
        copy={
          items.length > 0
            ? `${items.length} ${items.length === 1 ? "piece" : "pieces"} you have your eye on.`
            : undefined
        }
      />

      {items.length === 0 ? (
        <div className="mx-auto mt-10 flex max-w-md flex-col items-center rounded-2xl border border-dashed border-espresso/20 px-6 py-16 text-center">
          <span className="rounded-full bg-espresso/5 p-5">
            <Heart className="h-8 w-8 text-espresso/40" aria-hidden="true" />
          </span>
          <h2 className="font-display mt-6 text-2xl text-espresso">Nothing saved yet</h2>
          <p className="mt-2 text-sm text-espresso/60">
            Tap the heart on any piece to keep it here for later. Full-grain leather waits for
            no one.
          </p>
          <Button className="mt-6" onClick={() => router.push("/shop")}>
            Browse the collection
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
