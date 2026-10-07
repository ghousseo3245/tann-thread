"use client";

import { useEffect, useState } from "react";
import { getSiteSetting, SETTINGS_DEFAULTS } from "./site-settings";
import type { SettingKey } from "./site-settings";

/** React hook for a single site setting. Returns the default until loaded. */
export function useSiteSetting(key: SettingKey): string {
  const [value, setValue] = useState<string>(SETTINGS_DEFAULTS[key] ?? "");
  useEffect(() => {
    let cancelled = false;
    getSiteSetting(key).then((v) => {
      if (!cancelled) setValue(v);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);
  return value;
}
