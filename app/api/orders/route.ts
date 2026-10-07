import { getSupabaseAdmin } from "@/lib/db-admin";
import type { Order } from "@/lib/types";
import { sendWhatsAppOrderNotification } from "@/lib/whatsapp";

type OrderInput = {
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

    const { error: itemsError } = await supabase.from("order_items").insert(
      order.items.map((item) => ({
        order_id: (orderRow as { id: string }).id,
        product_id: null,
        variant_id: null,
        name: item.name,
        variant_label: item.variantLabel,
        price: item.price,
        qty: item.qty,
      }))
    );

    if (itemsError) throw itemsError;
  } catch (err) {
    console.error("[orders] failed to persist order:", err);
    // Return 200 with ok:false so the client still falls back smoothly.
    return Response.json({ ok: false, reason: "db-error" }, { status: 200 });
  }

  // Best effort WhatsApp notification to the owner. Never throws.
  await sendWhatsAppOrderNotification(order);

  return Response.json({ ok: true, order }, { status: 200 });
}
