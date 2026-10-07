import { clsx } from "clsx";
import type { ReactNode } from "react";

type BadgeTone = "default" | "sale" | "new" | "low";

const tones: Record<BadgeTone, string> = {
  default: "bg-espresso/10 text-espresso",
  sale: "bg-[#8C2F2F] text-white",
  new: "bg-cognac text-white",
  low: "bg-gold/25 text-[#7A5A1E]",
};

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
