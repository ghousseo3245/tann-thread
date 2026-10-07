"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
    } catch {
      // Even if the request fails, leave the admin area.
    } finally {
      router.push("/admin/login");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={busy}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ivory/70 transition-colors hover:bg-ivory/10 hover:text-ivory disabled:opacity-50"
    >
      <LogOut className="h-5 w-5" aria-hidden="true" />
      {busy ? "Signing out..." : "Logout"}
    </button>
  );
}
