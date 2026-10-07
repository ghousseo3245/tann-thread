"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inputClass } from "../_shared";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [demoPasswordMode, setDemoPasswordMode] = useState(false);

  useEffect(() => {
    fetch("/api/admin/login")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        if (
          data &&
          typeof data === "object" &&
          "demoPasswordMode" in data &&
          typeof (data as { demoPasswordMode: unknown }).demoPasswordMode === "boolean"
        ) {
          setDemoPasswordMode((data as { demoPasswordMode: boolean }).demoPasswordMode);
        }
      })
      .catch(() => {
        // The banner is informational only; a failed check just hides it.
      });
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin");
      } else {
        setError("Wrong password, try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-espresso-deep px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-ivory p-8 shadow-xl">
        <p className="font-display text-3xl text-espresso">Tann &amp; Thread</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-cognac">
          Admin
        </p>

        {demoPasswordMode ? (
          <div className="mt-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <TriangleAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p>
              Demo password &ldquo;admin123&rdquo; is active. Set ADMIN_PASSWORD in your
              environment to change it.
            </p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="admin-password"
              className="mb-1.5 block text-sm font-medium text-espresso"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className={inputClass}
            />
          </div>

          {error ? <p className="text-sm font-medium text-[#8C2F2F]">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={busy || password.length === 0}>
            {busy ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
