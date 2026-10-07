import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createAdminSession,
  isDemoPasswordMode,
} from "@/lib/admin-auth";

const SESSION_MAX_AGE = 12 * 60 * 60; // 12 hours

/** GET /api/admin/login — no auth required. Reports dev/demo password mode. */
export async function GET() {
  return NextResponse.json({ demoPasswordMode: isDemoPasswordMode() });
}

/** POST /api/admin/login — { password }; sets the signed session cookie. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    password?: unknown;
  };
  const expected = process.env.ADMIN_PASSWORD || "admin123";
  if (typeof body.password !== "string" || body.password !== expected) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  const token = await createAdminSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

/** DELETE /api/admin/login — clears the session cookie. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
