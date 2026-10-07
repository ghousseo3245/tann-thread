import "server-only";

import { getSupabaseAdmin } from "./db-admin";
import { formatPKR } from "./products";
import type { Order } from "./types";

const OWNER_NUMBER_SETTING_KEY = "whatsapp_owner_number";

/** Built-in fallback when neither the settings table nor the env var has an
 *  owner number. Settings / env always override this. */
const DEFAULT_OWNER_NUMBER = "923017378936";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Resolve the owner's WhatsApp number (digits only, e.g. "923001234567").
 * Precedence:
 *   1. Supabase `settings` table, key `whatsapp_owner_number`
 *      (configurable from /admin/settings)
 *   2. WHATSAPP_OWNER_NUMBER environment variable
 *   3. Built-in default ("923017378936"), used only when both above are
 *      unset or empty
 * Returns null only when the resolved value contains no digits (should not
 * happen given the hardcoded default).
 */
export async function resolveOwnerNumber(): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", OWNER_NUMBER_SETTING_KEY)
        .maybeSingle();
      if (!error && data?.value) {
        const digits = digitsOnly(String(data.value));
        if (digits) return digits;
      }
    } catch {
      // fall through to env fallback
    }
  }

  const envValue = process.env.WHATSAPP_OWNER_NUMBER;
  if (envValue) {
    const digits = digitsOnly(envValue);
    if (digits) return digits;
  }
  return DEFAULT_OWNER_NUMBER;
}

function buildOrderMessage(order: Order): string {
  const lines: string[] = [
    `New ${order.paymentMethod} order ${order.orderNumber}`,
    `Customer: ${order.name}`,
    `Phone: ${order.phone}`,
    `Address: ${order.address}, ${order.city}`,
    `Items:`,
  ];
  for (const item of order.items) {
    const label = item.variantLabel ? ` (${item.variantLabel})` : "";
    lines.push(`- ${item.name}${label} x${item.qty} - ${formatPKR(item.price * item.qty)}`);
  }
  lines.push(`Total: ${formatPKR(order.total)} (${order.paymentMethod})`);
  return lines.join("\n");
}

/**
 * Send a plain-text order notification to the owner via Meta WhatsApp
 * Cloud API. Best effort: returns true on success, false otherwise, and
 * NEVER throws. Missing configuration is silently skipped (console.warn).
 */
export async function sendWhatsAppOrderNotification(order: Order): Promise<boolean> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) {
    console.warn("[whatsapp] skipped: WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN is not set");
    return false;
  }

  const ownerNumber = await resolveOwnerNumber();
  if (!ownerNumber) {
    console.warn("[whatsapp] skipped: owner number could not be resolved");
    return false;
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: ownerNumber,
        type: "text",
        text: { body: buildOrderMessage(order) },
      }),
    });
    if (!res.ok) {
      console.warn(`[whatsapp] Meta API responded ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[whatsapp] send failed:", err instanceof Error ? err.message : String(err));
    return false;
  }
}
