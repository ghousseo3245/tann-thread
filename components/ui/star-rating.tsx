import { clsx } from "clsx";
import { Star } from "lucide-react";

export function StarRating({ value, size = 16 }: { value: number; size?: number }) {
  const filled = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          width={size}
          height={size}
          aria-hidden="true"
          className={clsx(i < filled ? "fill-gold text-gold" : "text-espresso/25")}
        />
      ))}
    </span>
  );
}
