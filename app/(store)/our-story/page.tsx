import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gem, Hand, Wrench } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";

const VALUES = [
  {
    icon: Gem,
    title: "Full-grain only",
    copy: "We buy only the top layer of the hide, the densest and most durable part. It is never sanded, corrected or split, so it resists scratches and develops a rich patina instead of wearing out.",
  },
  {
    icon: Hand,
    title: "Hand-finished",
    copy: "Each piece passes through more than forty hand-finishing steps in our Lahore workshop: cutting, skiving, saddle stitching, edge burnishing and conditioning. Machines assist, hands decide.",
  },
  {
    icon: Wrench,
    title: "Lifetime repairs",
    copy: "A loose stitch in year six or a worn edge in year ten is not the end of your piece, it is a repair ticket. Send any Tann and Thread product back and our craftspeople will fix it, free, for life.",
  },
];

const STATS = [
  { value: "2019", label: "Founded in Lahore" },
  { value: "100%", label: "Full-grain hides" },
  { value: "40+", label: "Hand-finishing steps" },
  { value: "Lifetime", label: "Repair promise" },
];

export default function OurStoryPage() {
  return (
    <>
      <section className="container-x py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cognac">
            Our story
          </p>
          <h1 className="font-display mt-4 text-4xl text-espresso sm:text-5xl">
            Honest leather, made to outlive us all.
          </h1>
        </div>

        <div className="relative mx-auto mt-10 aspect-[16/9] max-w-4xl overflow-hidden rounded-2xl bg-espresso/5">
          <Image
            src="/images/craft.jpg"
            alt="Leather craftsman hand-finishing a Tann and Thread piece in Lahore"
            fill
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
            priority
          />
        </div>

        <div className="mx-auto mt-10 max-w-3xl space-y-5 leading-relaxed text-espresso/75">
          <p>
            Tann and Thread began in 2019 in a two-room workshop in Lahore with a simple
            frustration: leather goods that looked good in the shop and fell apart in a year.
            Split leather, bonded leather, plastic-coated finishes, all sold as the real thing.
          </p>
          <p>
            We decided to make the opposite. Full-grain hides from tanneries we know by name,
            solid brass hardware that never flakes, and stitching done the slow way. Every bag,
            wallet, jacket, belt and pair of shoes is cut, stitched and burnished by hand, in
            small batches we can personally stand behind.
          </p>
          <p>
            Seven years on, the workshop is bigger but the rule has not changed: if it will not
            age beautifully for decades, we do not make it. And if anything we made ever lets
            you down, we repair it for life. That is what your grandfather meant by buying it
            for life, and it is what we mean by Tann and Thread.
          </p>
        </div>
      </section>

      <section className="bg-ivory-dark/60 py-14 sm:py-20">
        <div className="container-x">
          <SectionHeader
            eyebrow="What we stand for"
            title="Three promises, kept daily"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-espresso/10 bg-ivory p-6 sm:p-8"
              >
                <span className="inline-flex rounded-full bg-cognac/15 p-3">
                  <v.icon className="h-6 w-6 text-cognac-dark" aria-hidden="true" />
                </span>
                <h2 className="font-display mt-4 text-2xl text-espresso">{v.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-espresso/65">{v.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-14 sm:py-20">
        <div className="grid grid-cols-2 gap-6 rounded-3xl bg-espresso px-6 py-10 text-center sm:grid-cols-4 sm:py-14">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-display text-4xl text-gold sm:text-5xl">{s.value}</p>
              <p className="mt-2 text-sm text-ivory/70">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/shop">
            <Button size="lg">
              Shop the collection
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
