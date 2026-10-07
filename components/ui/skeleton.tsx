import { clsx } from "clsx";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={clsx("animate-pulse bg-espresso/10 rounded", className)} aria-hidden="true" />;
}
