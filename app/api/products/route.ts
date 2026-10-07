import { getSupabaseAdmin } from "@/lib/db-admin";
import type { Order } from "@/lib/types";
import { sendWhatsAppOrderNotification } from "@/lib/whatsapp";

type OrderInputItem = {
  name: string;
  variantLabel: string;
  price: number;
  qty: number;
  /** Supabase product_variants UUID when the cart was built from the live
   *  catalog; may be a demo-style id for stale carts. Optional. */
  variantId?: string;
  productSlug?: string;
  /** Variant SKU; fallback lookup key for stock resolution. Optional. */
  sku?: string;
};

type OrderInput = {
  name: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  paymentMethod: "COD" | "CARD";
  items: OrderInputItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
};

const PK_MOBILE_RE = /^0?3\d{9}$/;

function validate(body: OrderInput): string | null {
  if (!body || typeof body !== "object") return "Invalid request body.";
  if (typeof body.name !== "string" || body.name.trim().length < 3)
    return "Please enter your full name (at least 3 characters).";
  if (typeof body.phone !== "string" || !PK_MOBILE_RE.test(body.phone.replace(/[\s-]/g, "")))
    return "Please enter a valid Pakistani mobile number (e.g. 03001234567).";
  if (typeof body.city !== "string" || body.city.trim().length === 0)
    return "City is required.";
  if (typeof body.address !== "string" || body.address.trim().length === 0)
    return "Address is required.";
  if (body.paymentMethod !== "COD" && body.paymentMethod !== "CARD")
    return "Payment method must be COD or CARD.";
  if (!Array.isArray(body.items) || body.items.length === 0)
    return "Your cart is empty.";
  for (const item of body.items) {
    if (
      typeof item.name !== "string" ||
      typeof item.price !== "number" ||
      typeof item.qty !== "number" ||
      item.qty < 1
    )
      return "One or more cart items are invalid.";
  }
  if (typeof body.total !== "number" || body.total <= 0)
    return "Order total must be greater than zero.";
  return null;
}

export async function POST(req: Request) {
  let body: OrderInput;
  try {
    body = (await req.json()) as OrderInput;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const validationError = validate(body);
  if (validationError) {
    return Response.json({ ok: false, error: validationError }, { status: 400 });
  }

  const placedAt = new Date().toISOString();
  const orderNumber = `TT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const order: Order = {
    orderNumber,
    phone: body.phone,
    name: body.name,
    email: body.email || undefined,
    city: body.city,
    address: body.address,
    paymentMethod: body.paymentMethod,
    items: body.items.map((i) => ({
      name: i.name,
      variantLabel: i.variantLabel ?? "",
      image: "",
      price: i.price,
      qty: i.qty,
    })),
    subtotal: body.subtotal,
    discount: body.discount,
    deliveryFee: body.deliveryFee,
    total: body.total,
    status: "Placed",
    placedAt,
    timeline: [{ label: "Order placed", at: placedAt }],
  };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // No backend configured: let the client fall back to localStorage.
    return Response.json({ ok: false, reason: "no-backend" }, { status: 200 });
  }

  try {
    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        phone: body.phone,
        name: body.name,
        email: body.email || null,
        city: body.city,
        address: body.address,
        payment_method: body.paymentMethod,
        subtotal: body.subtotal,
        discount: body.discount,
        delivery_fee: body.deliveryFee,
        total: body.total,
        status: "Placed",
        placed_at: placedAt,
      })
      .select("id")
      .single();

    if (orderError || !orderRow) {
      throw orderError ?? new Error("orders insert returned no row");
    }

    const orderId = (orderRow as { id: string }).id;

    // Resolve each cart item to a Supabase variant (best effort). Matches by
    // variant UUID first, then by SKU. Unknown ids are skipped silently so a
    // stale cart can never fail the order.
    const UUID_RE =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    type ResolvedVariant = { id: string; product_id: string; stock: number };
    const variantCache = new Map<string, ResolvedVariant | null>();
    // Non-null alias: getSupabaseAdmin() was checked above, but TS cannot
    // narrow it inside the closure below.
    const db = supabase;
    const resolveVariant = async (
      item: OrderInputItem
    ): Promise<ResolvedVariant | null> => {
      const cacheKey = `${item.variantId ?? ""}|${item.sku ?? ""}`;
      if (variantCache.has(cacheKey)) return variantCache.get(cacheKey)!;
      let resolved: ResolvedVariant | null = null;
      try {
        if (item.variantId && UUID_RE.test(item.variantId)) {
          const { data } = await db
            .from("product_variants")
            .select("id, product_id, stock")
            .eq("id", item.variantId)
            .maybeSingle();
          if (data) {
            resolved = {
              id: data.id as string,
              product_id: data.product_id as string,
              stock: (data.stock as number) ?? 0,
            };
          }
        }
        if (!resolved && item.sku) {
          const { data } = await db
            .from("product_variants")
            .select("id, product_id, stock")
            .eq("sku", item.sku)
            .maybeSingle();
          if (data) {
            resolved = {
              id: data.id as string,
              product_id: data.product_id as string,
              stock: (data.stock as number) ?? 0,
            };
          }
        }
      } catch {
        resolved = null;
      }
      variantCache.set(cacheKey, resolved);
      return resolved;
    };

    const resolvedItems: { item: OrderInputItem; variant: ResolvedVariant | null }[] =
      [];
    for (const item of body.items) {
      resolvedItems.push({ item, variant: await resolveVariant(item) });
    }

    const { error: itemsError } = await db.from("order_items").insert(
      resolvedItems.map(({ item, variant }) => ({
        order_id: orderId,
        product_id: variant?.product_id ?? null,
        variant_id: variant?.id ?? null,
        name: item.name,
        variant_label: item.variantLabel,
        price: item.price,
        qty: item.qty,
      }))
    );

    if (itemsError) throw itemsError;

    // Decrement variant stock, floored at zero. Best effort: a failure here
    // must never fail the order itself.
    try {
      for (const { item, variant } of resolvedItems) {
        if (!variant) continue;
        const newStock = Math.max(0, variant.stock - item.qty);
        await db
          .from("product_variants")
          .update({ stock: newStock })
          .eq("id", variant.id);
      }
    } catch (stockErr) {
      console.error("[orders] stock decrement failed (non-fatal):", stockErr);
    }
  } catch (err) {
    console.error("[orders] failed to persist order:", err);
    // Return 200 with ok:false so the client still falls back smoothly.
    return Response.json({ ok: false, reason: "db-error" }, { status: 200 });
  }

  // Best effort WhatsApp notification to the owner. Never throws.
  await sendWhatsAppOrderNotification(order);

  return Response.json({ ok: true, order }, { status: 200 });
}
