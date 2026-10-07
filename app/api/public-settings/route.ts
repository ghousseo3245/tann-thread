import { NextResponse } from "next/server";
import { resolveOwnerNumber } from "@/lib/whatsapp";
import {
  SETTINGS_DEFAULTS,
  parseHeroSlides,
  type HeroSlide,
} from "@/lib/site-settings";
import { getSupabaseClient } from "@/lib/db";

export type PublicContent = {
  whatsappNumber: string;
  heroSlides: HeroSlide[];
  sale: { title: string; subtitle: string; endsAt: string };
};

/**
 * GET /api/public-settings — public storefront content.
 * Returns the WhatsApp owner number, hero carousel slides and sale config.
 * Only public, non-secret values are exposed. Cacheable for 5 minutes.
 */
export async function GET() {
  const whatsappNumber = (await resolveOwnerNumber()) ?? "923017378936";

  let raw: Record<string, string> = {};
  const db = getSupabaseClient();
  if (db) {
    try {
      const { data } = await db.from("settings").select("key, value");
      for (const row of (data ?? []) as { key: string; value: string | null }[]) {
        if (row.value !== null && row.value !== undefined) raw[row.key] = row.value;
      }
    } catch {
      // fall through to defaults
    }
  }

  const heroSlides = parseHeroSlides(raw["hero_slides"]);
  const sale = {
    title: raw["sale_title"]?.trim() || SETTINGS_DEFAULTS.sale_title,
    subtitle: raw["sale_subtitle"]?.trim() || SETTINGS_DEFAULTS.sale_subtitle,
    endsAt: raw["sale_ends_at"]?.trim() || "",
  };

  const body: PublicContent = { whatsappNumber, heroSlides, sale };
  return NextResponse.json(body, {
    headers: { "cache-control": "public, max-age=300" },
  });
}
