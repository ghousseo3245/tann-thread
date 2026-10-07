// Signed admin sessions for the Phase 2a admin dashboard.
//
// Edge-safe: Web Crypto only (works in middleware, route handlers, and the
// edge runtime). No node:crypto import. The secret comes from ADMIN_SECRET,
// falling back to a dev-only placeholder when unset.

const COOKIE_NAME = "tt_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export { COOKIE_NAME };

function getSecret(): string {
  return process.env.ADMIN_SECRET || "dev-secret-change-me";
}

/** True when no ADMIN_PASSWORD is configured (dev/demo password mode). */
export function isDemoPasswordMode(): boolean {
  return !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === "";
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

async function hmacSha256(keyMaterial: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(keyMaterial),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

/** Mint a new signed admin session token (valid for 12 hours). */
export async function createAdminSession(): Promise<string> {
  const payload = toBase64Url(
    new TextEncoder().encode(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS }))
  );
  const sig = toBase64Url(await hmacSha256(getSecret(), payload));
  return `${payload}.${sig}`;
}

/** Verify a session token's format, signature, and expiry. */
export async function verifyAdminSession(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expected = toBase64Url(await hmacSha256(getSecret(), payload));
  if (sig.length !== expected.length) return false;
  // Constant-time comparison over the encoded signature.
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return false;
  try {
    const parsed = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payload))
    ) as { exp?: unknown };
    return typeof parsed.exp === "number" && parsed.exp > Date.now();
  } catch {
    return false;
  }
}
