import { clsx } from "clsx";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  copy?: string;
  align?: "center" | "left";
};

export function SectionHeader({ eyebrow, title, copy, align = "center" }: SectionHeaderProps) {
  return (
    <div className={clsx("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left")}>
      {eyebrow ? (
        <p className="text-cognac text-xs font-semibold uppercase tracking-[0.2em]">{eyebrow}</p>
      ) : null}
      <h2 className="font-display text-3xl sm:text-4xl text-espresso mt-3">{title}</h2>
      {copy ? <p className="text-espresso/70 mt-4 leading-relaxed">{copy}</p> : null}
    </div>
  );
}
