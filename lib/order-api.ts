import type { Order } from "./types";

export type SubmitOrderInput = {
  name: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  paymentMethod: "COD" | "CARD";
  items: { name: string; variantLabel: string; price: number; qty: number }[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
};

export type SubmitOrderResult = {
  /** The confirmed server order, or null when the server path failed. */
  order: Order | null;
  /** True when the order was persisted by /api/orders; false on any failure. */
  viaServer: boolean;
};

/**
 * Submit an order to the server. Never throws. Returns { order, viaServer } —
 * on any failure (network error, non-ok response, {ok:false}) the caller
 * should fall back to the local placeOrder() in lib/store.tsx.
 */
export async function submitOrder(input: SubmitOrderInput): Promise<SubmitOrderResult> {
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) return { order: null, viaServer: false };
    const data = (await res.json()) as { ok: boolean; order?: Order };
    if (!data.ok || !data.order) return { order: null, viaServer: false };
    return { order: data.order, viaServer: true };
  } catch {
    return { order: null, viaServer: false };
  }
}
