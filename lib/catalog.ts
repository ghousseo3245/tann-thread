// Public storefront catalog (Phase 3): Supabase-first, demo fallback.
//
// CLIENT-SAFE: used by the (store) pages, which are client components.
// In live mode (Supabase configured) it fetches the PUBLIC /api/products
// endpoint (no admin auth needed). In demo mode — or when the fetch fails —
// it falls back to the bundled seed data with admin localStorage overrides
// applied, so the storefront keeps working exactly as before.

import { isSupabaseConfigured } from "./db";
import { applyDemoOverrides } from "./inventory";
import type { Product } from "./types";

type CatalogResponse = {
  ok?: boolean;
  products?: Product[];
};

/** Full product catalog for the storefront. */
export async function getCatalog(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return applyDemoOverrides();
  try {
    const res = await fetch("/api/products");
    if (!res.ok) return applyDemoOverrides();
    const body = (await res.json()) as CatalogResponse;
    if (!body?.ok || !Array.isArray(body.products)) return applyDemoOverrides();
    return body.products;
  } catch {
    return applyDemoOverrides();
  }
}

/** One product by slug from the storefront catalog. */
export async function getCatalogProduct(
  slug: string
): Promise<Product | undefined> {
  const catalog = await getCatalog();
  return catalog.find((p) => p.slug === slug);
}
