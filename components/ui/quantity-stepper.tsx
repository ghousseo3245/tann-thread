"use client";

import { clsx } from "clsx";
import { Minus, Plus } from "lucide-react";

type QuantityStepperProps = {
  qty: number;
  onChange: (q: number) => void;
  small?: boolean;
};

export function QuantityStepper({ qty, onChange, small }: QuantityStepperProps) {
  const iconSize = small ? "h-3.5 w-3.5" : "h-4 w-4";
  const buttonPadding = small ? "p-1.5" : "p-2";

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-espresso/20 bg-ivory px-1 py-1">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={qty <= 1}
        onClick={() => onChange(Math.max(1, qty - 1))}
        className={clsx(
          "rounded-full text-espresso hover:bg-espresso/5 transition-colors disabled:opacity-30 disabled:pointer-events-none",
          buttonPadding
        )}
      >
        <Minus className={iconSize} aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        className={clsx("min-w-8 text-center font-medium text-espresso", small ? "text-sm" : "text-base")}
      >
        {qty}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(qty + 1)}
        className={clsx(
          "rounded-full text-espresso hover:bg-espresso/5 transition-colors",
          buttonPadding
        )}
      >
        <Plus className={iconSize} aria-hidden="true" />
      </button>
    </div>
  );
}
