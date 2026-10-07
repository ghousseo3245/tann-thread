"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PackageSearch, SlidersHorizontal, X } from "lucide-react";
import { clsx } from "clsx";
import { queryProducts, formatPKR } from "@/lib/products";
import type { ProductQuery } from "@/lib/products";
import { getCatalog } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ui/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

const COLOR_FILTERS = [
  { name: "Cognac", hex: "#C17A3D" },
  { name: "Espresso", hex: "#2A1D11" },
  { name: "Black", hex: "#1C1A17" },
  { name: "Tan", hex: "#D9A45B" },
  { name: "Sand", hex: "#C9A24B" },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getCatalog()
      .then((ps) => {
        const visible = ps.filter((p) => p.active !== false);
        setAllProducts(visible);
        const cap =
          visible.length === 0
            ? 0
            : Math.ceil(Math.max(...visible.map((p) => p.price), 0) / 5000) * 5000;
        setMaxPrice(cap);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const priceCap = useMemo(
    () =>
      allProducts.length === 0
        ? 0
        : Math.ceil(Math.max(...allProducts.map((p) => p.price), 0) / 5000) * 5000,
    [allProducts]
  );

  const [q, setQ] = useState(() => searchParams.get("q") ?? "");
  const [category, setCategory] = useState(() => searchParams.get("category") ?? "all");
  const [maxPrice, setMaxPrice] = useState(priceCap);
  const [colors, setColors] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Keep filters in sync when arriving from header search or category links.
  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
    const c = searchParams.get("category");
    if (c) setCategory(c);
  }, [searchParams]);

  const results = useMemo(() => {
    if (!loaded) return [];
    const query: ProductQuery = { sort };
    if (q.trim()) query.q = q.trim();
    if (category !== "all") query.category = category;
    if (maxPrice < priceCap) query.maxPrice = maxPrice;
    if (colors.length > 0) query.colors = colors;
    if (inStockOnly) query.inStock = true;
    return queryProducts(query, allProducts);
  }, [q, category, maxPrice, priceCap, colors, inStockOnly, sort, loaded, allProducts]);

  const toggleColor = (name: string) =>
    setColors((prev) => (prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]));

  const clearAll = () => {
    setQ("");
    setCategory("all");
    setMaxPrice(priceCap);
    setColors([]);
    setInStockOnly(false);
    setSort("featured");
  };

  const pills: { label: string; onClear: () => void }[] = [];
  if (q) pills.push({ label: `Search: ${q}`, onClear: () => setQ("") });
  if (category !== "all")
    pills.push({ label: category.charAt(0).toUpperCase() + category.slice(1), onClear: () => setCategory("all") });
  if (maxPrice < priceCap)
    pills.push({ label: `Under ${formatPKR(maxPrice)}`, onClear: () => setMaxPrice(priceCap) });
  colors.forEach((c) =>
    pills.push({ label: c, onClear: () => setColors((prev) => prev.filter((x) => x !== c)) })
  );
  if (inStockOnly) pills.push({ label: "In stock", onClear: () => setInStockOnly(false) });

  if (!loaded) return <ShopSkeleton />;

  const filterPanel = (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-espresso">Filters</h2>
        {pills.length > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-cognac-dark underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <div className="mt-5 border-t border-espresso/10 pt-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso/50">
          Category
        </h3>
        <ul className="mt-3 space-y-1">
          {[{ slug: "all", name: "All pieces" }].map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => setCategory(c.slug)}
                aria-pressed={category === c.slug}
                className={clsx(
                  "w-full rounded-xl px-3.5 py-2.5 text-left text-sm transition-all",
                  category === c.slug
                    ? "bg-espresso font-semibold text-ivory shadow-sm"
                    : "text-espresso/75 hover:bg-espresso/5 hover:text-espresso"
                )}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 border-t border-espresso/10 pt-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso/50">
          Max price
        </h3>
        <input
          type="range"
          min={5000}
          max={priceCap}
          step={1000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          aria-label="Maximum price"
          className="mt-4 w-full accent-cognac"
        />
        <p className="mt-1.5 text-sm font-semibold text-espresso">
          Up to <span className="tabular-nums">{formatPKR(maxPrice)}</span>
        </p>
      </div>

      <div className="mt-6 border-t border-espresso/10 pt-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso/50">
          Colour
        </h3>
        <div className="mt-3.5 flex flex-wrap gap-3">
          {COLOR_FILTERS.map((c) => {
            const active = colors.includes(c.name);
            return (
              <button
                key={c.name}
                type="button"
                title={c.name}
                aria-label={`Filter by ${c.name}`}
                aria-pressed={active}
                onClick={() => toggleColor(c.name)}
                className={clsx(
                  "h-9 w-9 rounded-full border transition-all",
                  active
                    ? "border-cognac ring-2 ring-cognac ring-offset-2 ring-offset-ivory"
                    : "border-espresso/20 hover:scale-105 hover:border-espresso/50"
                )}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-6 border-t border-espresso/10 pt-5">
        <button
          type="button"
          role="switch"
          aria-checked={inStockOnly}
          onClick={() => setInStockOnly((v) => !v)}
          className="flex w-full items-center justify-between gap-3"
        >
          <span className="text-sm font-medium text-espresso">In stock only</span>
          <span
            className={clsx(
              "relative h-6 w-11 shrink-0 rounded-full transition-colors",
              inStockOnly ? "bg-cognac" : "bg-espresso/20"
            )}
          >
            <span
              className={clsx(
                "absolute top-0.5 h-5 w-5 rounded-full bg-ivory shadow transition-all",
                inStockOnly ? "left-[22px]" : "left-0.5"
              )}
            />
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="container-x py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cognac">
            The full collection
          </p>
          <h1 className="font-display mt-2 text-balance text-4xl tracking-tight text-espresso sm:text-5xl">
            Shop
          </h1>
          <p className="mt-2.5 text-sm text-espresso/60" aria-live="polite">
            <span className="font-semibold text-espresso">{results.length}</span>{" "}
            {results.length === 1 ? "piece" : "pieces"}
            {q ? (
              <>
                {" "}
                for <span className="font-medium text-espresso">&ldquo;{q}&rdquo;</span>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-espresso/25 bg-ivory px-4 py-2.5 text-sm font-semibold text-espresso shadow-sm transition-colors hover:border-espresso/50 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters
            {pills.length > 0 ? (
              <span className="rounded-full bg-cognac px-2 py-0.5 text-xs font-semibold text-white">
                {pills.length}
              </span>
            ) : null}
          </button>
          <label htmlFor="sort" className="sr-only">
            Sort products
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="cursor-pointer rounded-full border border-espresso/25 bg-ivory px-4 py-2.5 text-sm font-semibold text-espresso shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cognac hover:border-espresso/50"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {pills.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {pills.map((pill) => (
            <button
              key={pill.label}
              type="button"
              onClick={pill.onClear}
              aria-label={`Remove filter: ${pill.label}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-espresso/[0.07] px-3.5 py-1.5 text-xs font-semibold text-espresso ring-1 ring-espresso/10 transition-colors hover:bg-espresso/[0.12]"
            >
              {pill.label}
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-cognac-dark underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        </div>
      ) : null}

      <div className="mt-9 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-espresso/10 bg-ivory p-6 shadow-sm">
            {filterPanel}
          </div>
        </aside>

        <div>
          {results.length === 0 ? (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-espresso/25 bg-ivory px-6 py-20 text-center">
              <span className="rounded-full bg-espresso/5 p-5 ring-1 ring-espresso/10">
                <PackageSearch className="h-8 w-8 text-espresso/50" aria-hidden="true" />
              </span>
              <h2 className="font-display mt-6 text-2xl tracking-tight text-espresso">
                No pieces match those filters
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-espresso/60">
                Try widening the price range, clearing a colour or two, or browse the full
                collection instead.
              </p>
              <Button className="mt-7" onClick={clearAll}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 xl:grid-cols-3">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters" side="left">
        {filterPanel}
        <Button className="mt-8 w-full" onClick={() => setFiltersOpen(false)}>
          Show {results.length} {results.length === 1 ? "piece" : "pieces"}
        </Button>
      </Drawer>
    </div>
  );
}

function ShopSkeleton() {
  return (
    <div className="container-x py-10 sm:py-14">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="mt-3 h-5 w-32" />
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 xl:grid-cols-3">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
            <Skeleton className="mt-4 h-5 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopContent />
    </Suspense>
  );
}
