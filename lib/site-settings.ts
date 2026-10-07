// Site settings: editable store configuration backed by the Supabase
// `settings` table (public read policy), with a localStorage fallback and
// built-in defaults when nothing is stored.
//
// CLIENT-SAFE: only uses the anon client and localStorage, so it can be used
// from storefront components as well as admin pages.
//
// Settings keys (contract):
//   announcement_text     - announcement bar override (empty = rotating messages)
//   whatsapp_owner_number  - digits-only owner number for order alerts.
//                            Precedence: saved non-empty setting > WHATSAPP_OWNER_NUMBER
//                            env var > DEFAULT_WHATSAPP_OWNER_NUMBER below.
//   support_phone          - shown in the footer and on the contact page when set
//   support_email          - shown in the footer and on the contact page when set

import { getSupabaseClient, isSupabaseConfigured } from "./db";

/** Built-in default owner WhatsApp number (country code, no +). */
export const DEFAULT_WHATSAPP_OWNER_NUMBER = "923017378936";

export const SETTING_KEYS = [
  "announcement_text",
  "whatsapp_owner_number",
  "support_phone",
  "support_email",
  "hero_slides",
  "sale_title",
  "sale_subtitle",
  "sale_ends_at",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export const SETTINGS_DEFAULTS: Record<SettingKey, string> = {
  announcement_text: "",
  whatsapp_owner_number: DEFAULT_WHATSAPP_OWNER_NUMBER,
  support_phone: "",
  support_email: "",
  hero_slides: "",
  sale_title: "Private Sale",
  sale_subtitle:
    "Up to 25 percent off selected full-grain pieces. When the timer ends, so do the prices.",
  sale_ends_at: "",
};

const LS_KEY = "tt-admin-settings";

/** One hero carousel slide, stored as JSON in the `hero_slides` setting. */
export type HeroSlide = {
  eyebrow: string;
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaLink: string;
  image: string;
};

/** Default hero slides used when the admin has not saved custom slides. */
export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: "Full-grain leather goods",
    headline: "Carry it for a lifetime.",
    subtext:
      "Bags, wallets, jackets, belts and shoes, cut and stitched by hand in Lahore from full-grain leather. Built to age beautifully, guaranteed for life.",
    ctaLabel: "Shop Best Sellers",
    ctaLink: "/shop",
    image: "/images/hero.jpg",
  },
  {
    eyebrow: "The craft",
    headline: "Cut by hand. Built for decades.",
    subtext:
      "More than forty hand-finishing steps in our Lahore workshop. Burnished edges, solid brass hardware, and lifetime repairs on every stitch.",
    ctaLabel: "Explore the Collection",
    ctaLink: "/shop",
    image: "/images/craft.jpg",
  },
  {
    eyebrow: "New arrivals",
    headline: "Leather that tells your story.",
    subtext:
      "Full-grain hides that scar, darken and shine with every year you carry them. No two pieces age alike.",
    ctaLabel: "Shop New Arrivals",
    ctaLink: "/shop?sort=newest",
    image: "/images/products/highway-jacket.jpg",
  },
];

/** Parse the hero_slides setting; falls back to defaults on any problem. */
export function parseHeroSlides(raw: string | undefined | null): HeroSlide[] {
  if (!raw || !raw.trim()) return DEFAULT_HERO_SLIDES;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return DEFAULT_HERO_SLIDES;
    const slides = parsed
      .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
      .map((s) => ({
        eyebrow: String(s.eyebrow ?? ""),
        headline: String(s.headline ?? ""),
        subtext: String(s.subtext ?? ""),
        ctaLabel: String(s.ctaLabel ?? "Shop Now"),
        ctaLink: String(s.ctaLink ?? "/shop"),
        image: String(s.image ?? ""),
      }))
      .filter((s) => s.headline.trim() && s.image.trim());
    return slides.length > 0 ? slides : DEFAULT_HERO_SLIDES;
  } catch {
    return DEFAULT_HERO_SLIDES;
  }
}

function readStoredSettings(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    if (parsed && typeof parsed === "object") {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof v === "string") out[k] = v;
      }
      return out;
    }
  } catch {
    // storage unavailable or corrupt: fall through to defaults
  }
  return {};
}

/** Read every setting: Supabase first, localStorage fallback, defaults last. */
export async function getSiteSettings(): Promise<Record<string, string>> {
  const stored = readStoredSettings();
  const db = getSupabaseClient();
  if (db) {
    try {
      const { data, error } = await db.from("settings").select("key, value");
      if (!error && data) {
        for (const row of data as { key: string; value: string | null }[]) {
          if (row.value !== null && row.value !== undefined) {
            stored[row.key] = row.value;
          }
        }
      }
    } catch {
      // network/RLS failure: fall through to stored + defaults
    }
  }
  return { ...SETTINGS_DEFAULTS, ...stored };
}

/** Read a single setting with the same precedence. */
export async function getSiteSetting(key: string): Promise<string> {
  const all = await getSiteSettings();
  return all[key] ?? SETTINGS_DEFAULTS[key as SettingKey] ?? "";
}

/** React hook for a single setting — lives in ./use-site-setting (client-only). */

/**
 * Resolve the WhatsApp owner number for order alerts.
 * Contract: a saved non-empty settings value takes precedence over the
 * WHATSAPP_OWNER_NUMBER env var; when unset/empty, fall back to env, then
 * to the built-in default.
 */
export function resolveWhatsAppOwnerNumber(
  settingsValue?: string | null,
  envValue?: string | null
): string {
  const saved = (settingsValue ?? "").trim();
  if (saved) return saved;
  const env = (envValue ?? "").trim();
  if (env) return env;
  return DEFAULT_WHATSAPP_OWNER_NUMBER;
}

/* ------------------------------------------------------------------ */
/* Admin page helpers (live API when Supabase is configured,            */
/* localStorage demo fallback otherwise)                               */
/* ------------------------------------------------------------------ */

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, credentials: "include" });
  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) detail = `: ${body.error}`;
    } catch {
      // non-JSON error body
    }
    throw new Error(`Request failed (${res.status})${detail}`);
  }
  return (await res.json()) as T;
}

function writeStoredSettings(values: Record<string, string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(values));
  } catch {
    // storage full or unavailable: continue on memory state only
  }
}

/** Load all settings for the admin page. `live` is false in demo mode. */
export async function loadAdminSettings(): Promise<{
  values: Record<string, string>;
  live: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { values: readStoredSettings(), live: false };
  }
  const values = await api<Record<string, string>>("/api/admin/settings");
  return { values, live: true };
}

/** Persist one setting for the admin page. */
export async function saveAdminSetting(key: string, value: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    writeStoredSettings({ ...readStoredSettings(), [key]: value });
    return;
  }
  await api("/api/admin/settings", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ key, value }),
  });
}
