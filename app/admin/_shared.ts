import { siteConfig } from "@/site.config";
import { listProducts } from "@/lib/inventory";
import type { OrderStatus, Product, ProductVariant } from "@/lib/types";

/** A product row as returned by the admin inventory API. */
export type AdminProduct = Product & { active: boolean };

/** listProducts() typed with the `active` flag the admin UI relies on. */
export async function listAdminProducts(): Promise<AdminProduct[]> {
  return (await listProducts()) as AdminProduct[];
}

/** Added by the data layer; fall back to 5 when not configured yet. */
export const LOW_STOCK_THRESHOLD: number =
  (siteConfig as typeof siteConfig & { lowStockThreshold?: number }).lowStockThreshold ?? 5;

/** The canonical order pipeline shown in the admin UI. "Cancelled" is a
 *  terminal side state, offered separately from the forward pipeline.
 *  "Out for delivery" remains a valid legacy status on old rows but is no
 *  longer part of the pipeline. */
export const ORDER_STATUSES: OrderStatus[] = [
  "Placed",
  "Confirmed",
  "Shipped",
  "Delivered",
];

/** Every status the status-update select may offer. */
export const UPDATABLE_STATUSES: OrderStatus[] = [
  ...ORDER_STATUSES,
  "Cancelled",
];

/** Badge tone per order status (matches the tones in components/ui/badge.tsx). */
export function statusTone(status: OrderStatus): "default" | "sale" | "new" | "low" {
  switch (status) {
    case "Confirmed":
      return "new";
    case "Shipped":
    case "Out for delivery":
      return "low";
    case "Delivered":
      return "new";
    case "Cancelled":
      return "sale";
    case "Placed":
    default:
      return "default";
  }
}

/** Human-friendly variant label, e.g. "Cognac / M". */
export function variantLabel(variant: Pick<ProductVariant, "color" | "size">): string {
  return variant.size ? `${variant.color} / ${variant.size}` : variant.color;
}

/** "7 Oct 2026" style date for order timestamps. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Shared styling for admin text inputs and selects. */
export const inputClass =
  "w-full rounded-xl border border-espresso/20 bg-white px-4 py-2.5 text-sm text-espresso placeholder:text-espresso/40 focus:border-cognac focus:outline-none focus:ring-2 focus:ring-cognac/30";
