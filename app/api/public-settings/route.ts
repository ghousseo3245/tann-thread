import { NextResponse } from "next/server";
import { resolveOwnerNumber } from "@/lib/whatsapp";

/**
 * GET /api/public-settings — public store contact info.
 * Returns the WhatsApp owner number so the storefront can build
 * "Order on WhatsApp" links. The number is a public business contact,
 * so no authentication is required.
 */
export async function GET() {
  const whatsappNumber = (await resolveOwnerNumber()) ?? "923017378936";
  return NextResponse.json(
    { whatsappNumber },
    { headers: { "cache-control": "public, max-age=300" } }
  );
}
