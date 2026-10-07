"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { isDemoMode } from "@/lib/inventory";

export function ModeBadge() {
  const [demo, setDemo] = useState<boolean | null>(null);

  useEffect(() => {
    setDemo(isDemoMode());
  }, []);

  if (demo === null) {
    return (
      <span className="inline-flex items-center rounded-full bg-espresso/10 px-3 py-1 text-xs font-semibold text-espresso/50">
        Checking...
      </span>
    );
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        demo ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
      )}
    >
      <span
        className={clsx("h-1.5 w-1.5 rounded-full", demo ? "bg-amber-500" : "bg-emerald-500")}
        aria-hidden="true"
      />
      {demo ? "Demo mode" : "Supabase connected"}
    </span>
  );
}
