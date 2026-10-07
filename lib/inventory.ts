// Unified data API for the Phase 2a admin dashboard.
//
// CLIENT-SAFE: this module never imports server-only code (db-admin.ts,
// admin-auth.ts). It works in both demo mode (Supabase not configured,
// localStorage-backed overrides on top of seed data) and live mode
// (fetches the JSON admin API routes, which enforce the session cookie and
// use the service-role key server-side).
//
// Demo persistence keys:
//   tt_admin_overrides — product/variant overrides + admin-created products
//   tt_demo_orders     — order status overrides keyed by order number

import { isSupabaseConfigured } from "./db";
import { DEMO_ORDERS } from "./store";
import { categories, products } from "./products";
import type { Order, OrderStatus, Product, ProductVariant } from "./types";

export type NewProductInput = {
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  tagline?: string;
  materials?: string;
  care?: string;
  active?: boolean;
};

/* ------------------------------------------------------------------ */
/* Local storage helpers                                               */
/* ------------------------------------------------------------------ */

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable: continue on memory state only
  }
}

/* ------------------------------------------------------------------ */
/* Mode                                                                */
/* ------------------------------------------------------------------ */

/** True when Supabase is not configured: the admin UI uses demo data. */
export function isDemoMode(): boolean {
  return !isSupabaseConfigured();
}

/* ------------------------------------------------------------------ */
/* Demo override store (tt_admin_overrides)                            */
/* ------------------------------------------------------------------ */

type ProductOverride = {
  price?: number;
  active?: boolean;
  deleted?: boolean;
  name?: string;
  description?: string;
  tagline?: string;
};

type VariantOverride = { price?: number; stock?: number };

type AdminOverrides = {
  products: Record<string, ProductOverride>;
  variants: Record<string, VariantOverride>;
  created: Product[];
};

const OVERRIDES_KEY = "tt_admin_overrides";
const DEMO_ORDER_STATUS_KEY = "tt_demo_orders";

function emptyOverrides(): AdminOverrides {
  return { products: {}, variants: {}, created: [] };
}

function readOverrides(): AdminOverrides {
  const stored = readLS<Partial<AdminOverrides>>(OVERRIDES_KEY, emptyOverrides());
  return {
    products: stored.products ?? {},
    variants: stored.variants ?? {},
    created: stored.created ?? [],
  };
}

function writeOverrides(overrides: AdminOverrides): void {
  writeLS(OVERRIDES_KEY, overrides);
}

function productOverride(
  overrides: AdminOverrides,
  productId: string
): ProductOverride {
  const existing = overrides.products[productId] ?? {};
  overrides.products[productId] = existing;
  return existing;
}

/** Seed products + admin-created products, minus deleted, with overrides applied. */
function applyDemoOverrides(): Product[] {
  const overrides = readOverrides();
  return [...products, ...overrides.created]
    .filter((p) => !overrides.products[p.id]?.deleted)
    .map((p) => {
      const po = overrides.products[p.id];
      const variants: ProductVariant[] = p.variants.map((v) => {
        const vo = overrides.variants[v.id];
        if (!vo) return v;
        return {
          ...v,
          price: vo.price ?? v.price,
          stock: vo.stock ?? v.stock,
        };
      });
      return {
        ...p,
        ...(po?.name !== undefined ? { name: po.name } : {}),
        ...(po?.tagline !== undefined ? { tagline: po.tagline } : {}),
        ...(po?.description !== undefined ? { description: po.description } : {}),
        ...(po?.price !== undefined ? { price: po.price } : {}),
        active: po?.active ?? p.active ?? true,
        variants,
      };
    });
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, credentials: "include" });
  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) detail = `: ${body.error}`;
    } catch {
      // non-JSON error body: fall through
    }
    throw new Error(`Request failed (${res.status})${detail}`);
  }
  return (await res.json()) as T;
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

export async function listProducts(): Promise<Product[]> {
  if (isDemoMode()) return applyDemoOverrides();
  return api<Product[]>("/api/admin/products");
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const list = await listProducts();
  return list.find((p) => p.slug === slug);
}

/** Update stock. `variantId: null` applies to every variant of the product. */
export async function updateStock(
  productId: string,
  variantId: string | null,
  stock: number
): Promise<void> {
  if (isDemoMode()) {
    const overrides = readOverrides();
    const target = applyDemoOverrides().find((p) => p.id === productId);
    if (!target) return;
    const ids = variantId ? [variantId] : target.variants.map((v) => v.id);
    for (const id of ids) {
      const vo = overrides.variants[id] ?? {};
      vo.stock = stock;
      overrides.variants[id] = vo;
    }
    writeOverrides(overrides);
    return;
  }
  await api(`/api/admin/products/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ op: "stock", variantId, value: stock }),
  });
}

/** Update price. `variantId: null` updates the product-level price. */
export async function updatePrice(
  productId: string,
  variantId: string | null,
  price: number
): Promise<void> {
  if (isDemoMode()) {
    const overrides = readOverrides();
    if (variantId) {
      const vo = overrides.variants[variantId] ?? {};
      vo.price = price;
      overrides.variants[variantId] = vo;
    } else {
      productOverride(overrides, productId).price = price;
    }
    writeOverrides(overrides);
    return;
  }
  await api(`/api/admin/products/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ op: "price", variantId, value: price }),
  });
}

export async function setProductActive(
  productId: string,
  active: boolean
): Promise<void> {
  if (isDemoMode()) {
    const overrides = readOverrides();
    productOverride(overrides, productId).active = active;
    writeOverrides(overrides);
    return;
  }
  await api(`/api/admin/products/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ op: "active", value: active }),
  });
}

export async function createProduct(input: NewProductInput): Promise<Product> {
  if (isDemoMode()) {
    const overrides = readOverrides();
    const slugBase = input.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const id = `${slugBase || "product"}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const category =
      categories.find((c) => c.slug === input.category) ?? categories[0];
    const variantId = `${id}-shown`;
    const product: Product = {
      id,
      slug: id,
      name: input.name,
      category: input.category,
      tagline: input.tagline ?? "",
      description: input.description,
      materials: input.materials ?? "",
      care: input.care ?? "",
      price: input.price,
      images: [category.image],
      variants: [
        {
          id: variantId,
          color: "As shown",
          colorHex: "#C17A3D",
          sku: `TT-NEW-${Math.random()
            .toString(36)
            .slice(2, 6)
            .toUpperCase()}`,
          price: input.price,
          stock: input.stock,
        },
      ],
      rating: 0,
      reviewCount: 0,
      active: input.active ?? true,
      createdAt: new Date().toISOString(),
    };
    overrides.created.push(product);
    writeOverrides(overrides);
    return product;
  }
  return api<Product>("/api/admin/products", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  if (isDemoMode()) {
    const overrides = readOverrides();
    productOverride(overrides, productId).deleted = true;
    overrides.created = overrides.created.filter((p) => p.id !== productId);
    writeOverrides(overrides);
    return;
  }
  await api(`/api/admin/products/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

/** Demo orders merge (same order as StoreProvider): DEMO_ORDERS first,
 *  deduplicated against stored tt-orders, then stored orders, then status
 *  overrides from tt_demo_orders are applied. */
function mergeDemoOrders(): Order[] {
  const stored = readLS<Order[]>("tt-orders", []);
  const storedNumbers = new Set(stored.map((o) => o.orderNumber));
  const merged = [
    ...DEMO_ORDERS.filter((d) => !storedNumbers.has(d.orderNumber)),
    ...stored,
  ];
  const statusOverrides = readLS<Record<string, OrderStatus>>(
    DEMO_ORDER_STATUS_KEY,
    {}
  );
  return merged.map((o) =>
    statusOverrides[o.orderNumber]
      ? { ...o, status: statusOverrides[o.orderNumber] }
      : o
  );
}

export async function listOrders(): Promise<Order[]> {
  if (isDemoMode()) return mergeDemoOrders();
  return api<Order[]>("/api/admin/orders");
}

export async function updateOrderStatus(
  orderNumber: string,
  status: OrderStatus
): Promise<void> {
  if (isDemoMode()) {
    const overrides = readLS<Record<string, OrderStatus>>(
      DEMO_ORDER_STATUS_KEY,
      {}
    );
    overrides[orderNumber] = status;
    writeLS(DEMO_ORDER_STATUS_KEY, overrides);
    return;
  }
  await api(`/api/admin/orders/${encodeURIComponent(orderNumber)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status }),
  });
}
