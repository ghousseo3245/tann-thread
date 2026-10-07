import { NextRequest, NextResponse } from "next/server";
import { isAdminResultError, requireAdmin } from "../_auth";
import { SETTING_KEYS } from "@/lib/site-settings";

const MAX_VALUE_LENGTH = 20000;

/** GET /api/admin/settings — every setting as { key: value }. */
export async function GET() {
  const ctx = await requireAdmin();
  if (isAdminResultError(ctx)) return ctx.error;
  const { data, error } = await ctx.db.from("settings").select("key, value");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const out: Record<string, string> = {};
  for (const row of (data ?? []) as {
    key: string;
    value: string | null;
  }[]) {
    if (row.value !== null) out[row.key] = row.value;
  }
  return NextResponse.json(out);
}

/** PUT /api/admin/settings — { key, value } upserts one whitelisted setting.
 *  The whatsapp_owner_number value is normalized to digits only. */
export async function PUT(req: NextRequest) {
  const ctx = await requireAdmin();
  if (isAdminResultError(ctx)) return ctx.error;
  const body = (await req.json().catch(() => ({}))) as {
    key?: unknown;
    value?: unknown;
  };
  const key = typeof body.key === "string" ? body.key : "";
  if (!(SETTING_KEYS as readonly string[]).includes(key)) {
    return NextResponse.json(
      { error: `Unknown setting key. Use one of: ${SETTING_KEYS.join(", ")}` },
      { status: 400 }
    );
  }
  if (typeof body.value !== "string" || body.value.length > MAX_VALUE_LENGTH) {
    return NextResponse.json(
      { error: "Value must be a string under 20000 characters." },
      { status: 400 }
    );
  }
  let value = body.value.trim();
  if (key === "whatsapp_owner_number") {
    value = value.replace(/\D/g, "");
  }
  const { error } = await ctx.db
    .from("settings")
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, key, value });
}
