import { Gem, RotateCcw, Truck, Wrench } from "lucide-react";

const PILLARS = [
  {
    icon: Gem,
    title: "Premium Full-Grain Leather",
    copy: "Only the top layer of the hide, never sanded or corrected. It scars less, shines more and ages better than anything else.",
  },
  {
    icon: Wrench,
    title: "Lifetime Repairs",
    copy: "Loose stitching or worn edges years from now? Send it back. We repair our pieces for life, free of charge.",
  },
  {
    icon: Truck,
    title: "Nationwide Delivery",
    copy: "Carefully packed and shipped across Pakistan in 3 to 5 working days, with tracking on every order.",
  },
  {
    icon: RotateCcw,
    title: "7-Day Easy Exchange",
    copy: "Changed your mind? Exchange any unused piece within 7 days, no questions asked and no hassle.",
  },
];

/**
 * WhyChooseUs — four brand pillars in a premium card grid.
 */
export function WhyChooseUs() {
  return (
    <section aria-label="Why choose Tann and Thread" className="container-x py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-cognac">
          <span className="inline-block h-px w-8 bg-cognac" aria-hidden="true" />
          Why Tann and Thread
          <span className="inline-block h-px w-8 bg-cognac" aria-hidden="true" />
        </p>
        <h2 className="font-display mt-4 text-balance text-3xl tracking-tight text-espresso sm:text-4xl">
          Made to be kept, backed for life
        </h2>
        <p className="mt-4 text-base leading-relaxed text-espresso/65">
          We make fewer things, better. Every piece carries the same promise.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {PILLARS.map((pillar) => (
          <div
            key={pillar.title}
            className="group rounded-3xl border border-espresso/10 bg-ivory p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-espresso/10"
          >
            <span className="inline-flex rounded-2xl bg-cognac/15 p-4 ring-1 ring-cognac/25 transition-transform duration-300 group-hover:scale-110">
              <pillar.icon className="h-7 w-7 text-cognac-dark" aria-hidden="true" />
            </span>
            <h3 className="font-display mt-5 text-xl leading-snug text-espresso">
              {pillar.title}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-espresso/65">{pillar.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
