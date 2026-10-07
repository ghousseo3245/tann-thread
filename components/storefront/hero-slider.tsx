"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";
import type { HeroSlide } from "@/lib/site-settings";

const AUTOPLAY_MS = 4000;

const HERO_STATS = [
  { value: "Full-grain", label: "leather only" },
  { value: "40+", label: "hand-finishing steps" },
  { value: "Lifetime", label: "repairs, free" },
];

/**
 * HeroSlider — premium auto-playing carousel for the homepage hero.
 * Autoplay every 4s, pause on hover/focus, dots + arrows, keyboard
 * accessible (arrow keys), crossfade transition.
 */
export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    timer.current = window.setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [index, paused, count, go]);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") go(index + 1);
    else if (event.key === "ArrowLeft") go(index - 1);
  }

  return (
    <section
      className="relative flex min-h-[92vh] items-stretch overflow-hidden bg-espresso-deep"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKeyDown}
    >
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={`${slide.image}-${i}`}
          className={clsx(
            "absolute inset-0 transition-opacity duration-[1200ms] ease-out",
            i === index ? "z-[1] opacity-100" : "z-0 opacity-0"
          )}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={i === 0}
            loading={i === 0 ? "eager" : "lazy"}
            sizes="100vw"
            className={clsx(
              "object-cover",
              i === index && "animate-hero-drift"
            )}
          />
        </div>
      ))}
      <div
        className="absolute inset-0 z-[2] bg-gradient-to-r from-espresso-deep/90 via-espresso-deep/45 to-espresso-deep/10"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 z-[2] h-40 bg-gradient-to-t from-espresso-deep/70 to-transparent"
        aria-hidden="true"
      />

      {/* Copy */}
      <div className="relative z-10 container-x flex w-full flex-col justify-end pb-24 pt-28 text-ivory sm:pb-28">
        <div className="max-w-2xl" aria-live="polite">
          {slides.map((slide, i) =>
            i === index ? (
              <div key={`copy-${i}`} className="animate-backdrop-in">
                {slide.eyebrow ? (
                  <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                    <span className="inline-block h-px w-10 bg-gold" aria-hidden="true" />
                    {slide.eyebrow}
                  </p>
                ) : null}
                <h1 className="font-display mt-5 text-balance text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                  {slide.headline}
                </h1>
                {slide.subtext ? (
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-ivory/80 sm:text-lg">
                    {slide.subtext}
                  </p>
                ) : null}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button size="lg" onClick={() => router.push(slide.ctaLink || "/shop")}>
                    {slide.ctaLabel || "Shop Now"}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => router.push("/our-story")}
                    className="border-ivory/40 text-ivory hover:border-ivory hover:bg-ivory/10"
                  >
                    Our Story
                  </Button>
                </div>
              </div>
            ) : null
          )}
          <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-6 border-t border-ivory/15 pt-6 sm:gap-10">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <dt className="order-2 mt-1 text-xs uppercase tracking-[0.18em] text-ivory/60">
                  {stat.label}
                </dt>
                <dd className="font-display order-1 text-xl text-ivory sm:text-2xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Arrows */}
      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-ivory/25 p-2.5 text-ivory/70 backdrop-blur-sm transition-colors hover:border-ivory/60 hover:text-ivory md:block"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-ivory/25 p-2.5 text-ivory/70 backdrop-blur-sm transition-colors hover:border-ivory/60 hover:text-ivory md:block"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </>
      ) : null}

      {/* Dots */}
      {count > 1 ? (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5">
          {slides.map((slide, i) => (
            <button
              key={`dot-${i}`}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}: ${slide.headline}`}
              aria-current={i === index}
              className={clsx(
                "h-2 rounded-full transition-all duration-500",
                i === index ? "w-8 bg-gold" : "w-2 bg-ivory/40 hover:bg-ivory/70"
              )}
            />
          ))}
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Scroll to the collection"
        onClick={() =>
          document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" })
        }
        className="absolute bottom-6 right-6 z-20 hidden rounded-full border border-ivory/25 p-2.5 text-ivory/70 transition-colors hover:border-ivory/60 hover:text-ivory md:block"
      >
        <ChevronDown className="h-5 w-5 animate-bounce" aria-hidden="true" />
      </button>
    </section>
  );
}
