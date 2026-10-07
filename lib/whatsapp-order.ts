// Client-safe helpers for "Order on WhatsApp" links.
//
// Builds a wa.me URL with a pre-filled order message so customers who are
// not comfortable with online checkout can order by simply tapping the
// button and pressing send in WhatsApp.
//
// The owner's number is resolved from /api/public-settings (admin-
// configurable) with a built-in fallback.

import { formatPKR } from "./products";

export const WHATSAPP_FALLBACK_NUMBER = "923017378936";

let cachedNumber: string | null = null;

/** Resolve the owner's WhatsApp number, cached for the session. */
export async function getWhatsAppNumber(): Promise<string> {
  if (cachedNumber) return cachedNumber;
  try {
    const res = await fetch("/api/public-settings", { cache: "force-cache" });
    if (res.ok) {
      const data = (await res.json()) as { whatsappNumber?: string };
      const digits = (data.whatsappNumber ?? "").replace(/\D/g, "");
      if (digits) {
        cachedNumber = digits;
        return digits;
      }
    }
  } catch {
    // fall through to the built-in number
  }
  return WHATSAPP_FALLBACK_NUMBER;
}

export function whatsappOrderUrl(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export type WhatsAppOrderLine = {
  name: string;
  variantLabel?: string;
  price: number;
  qty: number;
  url?: string;
};

const DETAILS_PROMPT = [
  "Please confirm my order. My details:",
  "Name:",
  "Phone:",
  "City:",
  "Complete Address:",
].join("\n");

/** Message for a single product (product detail page). */
export function productOrderMessage(line: WhatsAppOrderLine): string {
  const variant = line.variantLabel ? `\nColor/Size: ${line.variantLabel}` : "";
  const link = line.url ? `\nLink: ${line.url}` : "";
  return [
    "Assalam-o-Alaikum Tann & Thread!",
    "I want to order:",
    "",
    `*${line.name}*${variant}`,
    `Price: ${formatPKR(line.price)}`,
    `Quantity: ${line.qty}`,
    `Total: ${formatPKR(line.price * line.qty)}${link}`,
    "",
    DETAILS_PROMPT,
  ].join("\n");
}

/** Message for the whole bag (cart drawer). */
export function cartOrderMessage(
  lines: WhatsAppOrderLine[],
  deliveryNote?: string
): string {
  const items = lines.map((line, i) => {
    const variant = line.variantLabel ? ` (${line.variantLabel})` : "";
    return `*${i + 1}. ${line.name}*${variant}\n${formatPKR(line.price)} x ${line.qty} = ${formatPKR(line.price * line.qty)}`;
  });
  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  return [
    "Assalam-o-Alaikum Tann & Thread!",
    "I want to order:",
    "",
    ...items,
    "",
    `*Order Total: ${formatPKR(total)}*`,
    deliveryNote ?? "",
    "",
    DETAILS_PROMPT,
  ]
    .filter((l) => l !== "")
    .join("\n");
}
