// Shared auth + config helpers for the Phase 2a admin API routes.
// Server-side only (route handlers). All routes below use these.

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { COOKIE_NAME, verifyAdminSession } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/db-admin";

export type AdminResult =
  | { db: SupabaseClient }
  | { error: NextResponse };

/** Verify the admin session cookie, then return the service-role client.
 *  Returns a 401 response when the session is missing/invalid and a 501
 *  when Supabase is not configured (the UI falls back to demo mode). */
export async function requireAdmin(): Promise<AdminResult> {
  const value = cookies().get(COOKIE_NAME)?.value;
  if (!(await verifyAdminSession(value))) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const db = getSupabaseAdmin();
  if (!db) {
    return {
      error: NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 501 }
      ),
    };
  }
  return { db };
}

export function isAdminResultError(
  result: AdminResult
): result is { error: NextResponse } {
  return "error" in result;
}
