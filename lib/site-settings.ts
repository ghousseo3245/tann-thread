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
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export const SETTINGS_DEFAULTS: Record<SettingKey, string> = {
  announcement_text: "",
  whatsapp_owner_number: DEFAULT_WHATSAPP_OWNER_NUMBER,
  support_phone: "",
  support_email: "",
};

const LS_KEY = "tt-admin-settings";

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
