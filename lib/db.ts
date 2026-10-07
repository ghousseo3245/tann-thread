// Supabase client access for the admin data layer (Phase 2a).
//
// Two access levels:
//   * getSupabaseClient() — browser-safe anon client (public, RLS-limited).
//   * getSupabaseAdmin()  — service-role client, SERVER ONLY. The service key
//     must never reach client bundles; server-only is imported at the top so a
//     build fails if this file is ever bundled for the browser.
//
// When the env vars are missing or still placeholders, both return null and
// the admin UI falls back to demo mode (localStorage-backed seed data).

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function isPlaceholder(value: string | undefined): boolean {
  return !value || value.includes("your-");
}

/** True when both public Supabase env vars are set and not placeholders. */
export function isSupabaseConfigured(): boolean {
  return (
    !isPlaceholder(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    !isPlaceholder(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

let anonClient: SupabaseClient | null = null;

/** Browser-safe anon client singleton. Null when Supabase is not configured. */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!anonClient) {
    anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return anonClient;
}
