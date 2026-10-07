"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Gem, Hand, Quote, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ProductCard } from "@/components/ui/product-card";
import { StarRating } from "@/components/ui/star-rating";
import { useToast } from "@/components/ui/toast";
import { useStore } from "@/lib/store";
import { categories, journalPosts, queryProducts } from "@/lib/products";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const TESTIMONIALS = [
  {
    quote:
      "The weekender has survived two years of Lahore to Karachi trips and looks better than the day it arrived. The leather just keeps getting richer.",
    name: "Ahmed Raza",
    city: "Lahore",
  },
  {
    quote:
      "You can feel the quality the moment you pick it up. My bifold has molded to my pocket perfectly, and the stitching is flawless.",
    name: "Fatima Khan",
    city: "Karachi",
  },
  {
    quote:
      "Ordered the bomber in cognac. The fit, the stitching, the smell of the leather, everything is a level above what I expected.",
    name: "Bilal Ahmed",
    city: "Islamabad",
  },
];

function NewsletterForm() {
  const toast = useToast();
  const subscribeNewsletter = useStore((s) => s.subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    const ok = subscribeNewsletter(value);
    if (!ok) {
      setError("That email is already subscribed or does not look valid.");
      return;
    }
    setDone(true);
    toast("Welcome to the list. Watch your inbox for 10 percent off.");
  };

  if (done) {
    return (
      <div className="rounded-2xl bg-ivory/10 px-6 py-5 text-center">
        <p className="font-display text-xl text-ivory">You are on the list.</p>
        <p className="mt-1 text-sm text-ivory/70">
          Leather care guides, new arrivals and subscriber offers, straight to your inbox.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="flex-1 rounded-full border border-ivory/25 bg-ivory/10 px-5 py-3.5 text-sm text-ivory placeholder:text-ivory/50 focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <Button type="submit" size="lg" className="shrink-0">
          Subscribe
        </Button>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-gold">
          {error}
        </p>
      ) : null}
    </form>
  );
}

export default function HomePage() {
  const router = useRouter();
  const bestSellers = queryProducts({ sort: "featured" }).slice(0, 8);
  const teasers = journalPosts.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden bg-espresso-deep">
        <Image
          src="/images/hero.jpg"
          alt="Full-grain leather bag crafted by Tann and Thread"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-espresso-deep/55" aria-hidden="true" />
        <div className="relative z-10 container-x px-4 text-center text-ivory">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
            Full-grain leather goods
          </p>
          <h1 className="font-display mt-4 text-5xl leading-tight sm:text-6xl lg:text-7xl">
            Carry it for life.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-ivory/80 sm:text-lg">
            Bags, wallets, jackets, belts and shoes, cut and stitched by hand in Lahore from
            full-grain leather. Built to age beautifully, guaranteed for a lifetime.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={() => router.push("/shop")}>
              Shop Best Sellers
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/our-story")}
              className="border-ivory/50 text-ivory hover:border-ivory hover:bg-ivory/10"
            >
              Our Story
            </Button>
          </div>
        </div>
      </section>

      {/* Category showcase */}
      <section className="container-x py-16 sm:py-20">
        <SectionHeader
          eyebrow="The collection"
          title="Shop by category"
          copy="Five essentials, one standard: full-grain leather, solid brass hardware and stitching that outlives trends."
        />
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-5">
          {categories.map((category, index) => (
            <Link
              key={category.slug}
              href={`/shop?category=${category.slug}`}
              className={
                "group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-espresso/5 " +
                (index === categories.length - 1 ? "col-span-2 lg:col-span-1" : "")
              }
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-espresso-deep/85 via-espresso-deep/10 to-transparent"
                aria-hidden="true"
              />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <h3 className="font-display text-xl text-ivory sm:text-2xl">{category.name}</h3>
                <p className="mt-1 text-xs text-ivory/70 sm:text-sm">{category.tagline}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gold">
                  Shop now
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best sellers */}
      <section className="bg-ivory-dark/60 py-16 sm:py-20">
        <div className="container-x">
          <SectionHeader
            eyebrow="Customer favourites"
            title="Best sellers"
            copy="The pieces our customers reach for every day, rated and reviewed across Pakistan."
          />
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="outline" size="lg" onClick={() => router.push("/shop")}>
              View all products
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      {/* Brand banner */}
      <section className="container-x py-16 sm:py-24">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-espresso/5">
            <Image
              src="/images/craft.jpg"
              alt="Leather craftsman hand-finishing a Tann and Thread piece"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cognac">
              The craft
            </p>
            <h2 className="font-display mt-3 text-3xl text-espresso sm:text-4xl">
              Cut by hand. Built for decades.
            </h2>
            <p className="mt-4 leading-relaxed text-espresso/70">
              Every Tann and Thread piece starts as a full-grain hide, the strongest part of the
              leather, and passes through more than forty hand-finishing steps in our Lahore
              workshop. We burnish every edge, set solid brass hardware and stand behind each
              stitch with lifetime repairs.
            </p>
            <p className="mt-3 leading-relaxed text-espresso/70">
              No bonded leather, no shortcuts. Just honest materials that grow more beautiful
              with every year you carry them.
            </p>
            <Button className="mt-6" variant="secondary" onClick={() => router.push("/our-story")}>
              Read our story
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-y border-espresso/10 bg-ivory">
        <div className="container-x grid gap-8 py-12 sm:grid-cols-3 sm:py-14">
          {[
            {
              icon: Gem,
              title: "Full-grain only",
              copy: "The top layer of the hide, never sanded or corrected. It scars less and ages better than anything else.",
            },
            {
              icon: Hand,
              title: "Hand-finished",
              copy: "Cut, skived, stitched and burnished by craftspeople in Lahore, in small batches we can stand behind.",
            },
            {
              icon: Wrench,
              title: "Lifetime repairs",
              copy: "Loose stitching or worn edges years from now? Send it back. We repair our pieces for life, free of charge.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <span className="shrink-0 rounded-full bg-cognac/15 p-3">
                <item.icon className="h-6 w-6 text-cognac-dark" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-display text-xl text-espresso">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-espresso/65">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-x py-16 sm:py-20">
        <SectionHeader
          eyebrow="Word of mouth"
          title="Loved across Pakistan"
          copy="From daily commutes in Karachi to weekend escapes in the north, our leather goes where you go."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-espresso/10 bg-ivory p-6"
            >
              <Quote className="h-6 w-6 text-cognac" aria-hidden="true" />
              <blockquote className="mt-4 flex-1 leading-relaxed text-espresso/75">
                {t.quote}
              </blockquote>
              <figcaption className="mt-5">
                <StarRating value={5} size={14} />
                <p className="mt-2 text-sm font-semibold text-espresso">{t.name}</p>
                <p className="text-xs text-espresso/55">{t.city}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Journal teasers */}
      <section className="bg-ivory-dark/60 py-16 sm:py-20">
        <div className="container-x">
          <SectionHeader
            eyebrow="The journal"
            title="Notes on leather and craft"
            copy="Care guides, workshop stories and buying advice from the people who make your pieces."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {teasers.map((post) => (
              <Link
                key={post.slug}
                href={`/journal/${post.slug}`}
                className="group overflow-hidden rounded-2xl border border-espresso/10 bg-ivory"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-espresso/5">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-wide text-espresso/50">
                    {formatDate(post.date)} · {post.readMinutes} min read
                  </p>
                  <h3 className="font-display mt-2 text-xl leading-snug text-espresso group-hover:text-cognac-dark">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-espresso/65">{post.excerpt}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cognac-dark">
                    Read more
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter band */}
      <section className="container-x py-16 sm:py-20">
        <div className="overflow-hidden rounded-3xl bg-espresso px-6 py-12 sm:px-12 sm:py-16">
          <div className="mx-auto max-w-xl text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-gold" aria-hidden="true" />
            <h2 className="font-display mt-4 text-3xl text-ivory sm:text-4xl">
              Get 10 percent off your first order
            </h2>
            <p className="mt-3 text-sm text-ivory/70 sm:text-base">
              Join the list for leather care guides, early access to new pieces and subscriber
              offers. One email a month, worth opening.
            </p>
            <div className="mt-6">
              <NewsletterForm />
            </div>
            <p className="mt-4 text-xs text-ivory/50">
              By subscribing you agree to receive marketing emails. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

    </>
  );
}
