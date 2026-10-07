// Row -> domain mappers for the Phase 2a admin API routes (server-side).

import type { Order, OrderItem, OrderStatus, Product } from "@/lib/types";

type VariantRow = {
  id: string;
  color: string;
  color_hex: string | null;
  size: string | null;
  sku: string;
  price: string | number;
  stock: number | null;
};

type CategoryRow = { slug: string; name: string; image: string | null };

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  materials: string | null;
  care: string | null;
  price: string | number;
  compare_at_price: string | number | null;
  rating: string | number | null;
  review_count: number | null;
  featured: boolean | null;
  best_seller: boolean | null;
  is_new: boolean | null;
  active: boolean | null;
  created_at: string | null;
  categories: CategoryRow | CategoryRow[] | null;
  product_variants: VariantRow[];
};

export function mapProductRow(row: ProductRow, imageUrl?: string | null): Product {
  // Supabase types to-many/one-to-one joins as arrays; normalize here.
  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  const image = imageUrl?.trim() ? imageUrl.trim() : category?.image ?? null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: category?.slug ?? "",
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    materials: row.materials ?? "",
    care: row.care ?? "",
    price: Number(row.price),
    compareAtPrice:
      row.compare_at_price !== null ? Number(row.compare_at_price) : undefined,
    // products table has no image column by default; when an explicit
    // per-product image URL is passed in (image_url, added by a later
    // migration), it wins over the category image.
    images: image ? [image] : [],
    variants: (row.product_variants ?? []).map((v) => ({
      id: v.id,
      color: v.color,
      colorHex: v.color_hex ?? "#C17A3D",
      size: v.size ?? undefined,
      sku: v.sku,
      price: Number(v.price),
      stock: v.stock ?? 0,
    })),
    rating: Number(row.rating ?? 0),
    reviewCount: row.review_count ?? 0,
    featured: row.featured ?? undefined,
    bestSeller: row.best_seller ?? undefined,
    isNew: row.is_new ?? undefined,
    active: row.active ?? true,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

const TIMELINE_LABELS: Record<Exclude<OrderStatus, "Placed">, string> = {
  Confirmed: "Order confirmed",
  Shipped: "Order shipped",
  "Out for delivery": "Out for delivery",
  Delivered: "Delivered",
  Cancelled: "Order cancelled",
};

const STATUS_ORDER: OrderStatus[] = [
  "Placed",
  "Confirmed",
  "Shipped",
  "Out for delivery",
  "Delivered",
];

/** Synthesize a timeline from status: "Order placed" at placed_at, then the
 *  Confirmed/Shipped/Delivered-style steps implied by the current status.
 *  Cancelled orders get a single "Order cancelled" step instead. */
export function timelineForStatus(
  status: OrderStatus,
  placedAt: string
): { label: string; at: string }[] {
  const timeline = [{ label: "Order placed", at: placedAt }];
  if (status === "Cancelled") {
    timeline.push({ label: TIMELINE_LABELS.Cancelled, at: placedAt });
    return timeline;
  }
  const depth = STATUS_ORDER.indexOf(status);
  for (let i = 1; i <= depth; i++) {
    const s = STATUS_ORDER[i];
    if (s !== "Placed") timeline.push({ label: TIMELINE_LABELS[s], at: placedAt });
  }
  return timeline;
}

type OrderItemRow = {
  name: string | null;
  variant_label: string | null;
  price: string | number | null;
  qty: number | null;
};

type OrderRow = {
  order_number: string;
  phone: string;
  name: string;
  email: string | null;
  city: string | null;
  address: string | null;
  payment_method: string | null;
  subtotal: string | number | null;
  discount: string | number | null;
  delivery_fee: string | number | null;
  total: string | number | null;
  status: string | null;
  placed_at: string | null;
  order_items: OrderItemRow[];
};

export function mapOrderRow(row: OrderRow): Order {
  const status = (row.status ?? "Placed") as OrderStatus;
  const placedAt = row.placed_at ?? new Date().toISOString();
  const items: OrderItem[] = (row.order_items ?? []).map((i) => ({
    name: i.name ?? "",
    variantLabel: i.variant_label ?? "",
    image: "",
    price: Number(i.price ?? 0),
    qty: i.qty ?? 0,
  }));
  return {
    orderNumber: row.order_number,
    phone: row.phone ?? "",
    name: row.name ?? "",
    email: row.email ?? undefined,
    city: row.city ?? "",
    address: row.address ?? "",
    paymentMethod: row.payment_method === "CARD" ? "CARD" : "COD",
    items,
    subtotal: Number(row.subtotal ?? 0),
    discount: Number(row.discount ?? 0),
    deliveryFee: Number(row.delivery_fee ?? 0),
    total: Number(row.total ?? 0),
    status,
    placedAt,
    timeline: timelineForStatus(status, placedAt),
  };
}
