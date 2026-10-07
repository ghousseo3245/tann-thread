"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import {
  Bell,
  Check,
  Expand,
  Heart,
  RotateCcw,
  Ruler,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion } from "@/components/ui/accordion";
import { Modal } from "@/components/ui/modal";
import { ProductCard } from "@/components/ui/product-card";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { StarRating } from "@/components/ui/star-rating";
import { useToast } from "@/components/ui/toast";
import { useStore } from "@/lib/store";
import { getProductBySlug, getRelatedProducts, formatPKR } from "@/lib/products";
import { getCatalog, getCatalogProduct } from "@/lib/catalog";
import type { Product } from "@/lib/types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const SIZE_GUIDES: Record<string, { note: string; headers: string[]; rows: string[][] }> = {
  jackets: {
    note: "Measured in inches. Our jackets are cut for layering, so your usual size should fit comfortably.",
    headers: ["Size", "Chest", "Shoulder", "Length"],
    rows: [
      ["S", "38", "17.5", "26"],
      ["M", "40", "18", "27"],
      ["L", "42", "18.5", "28"],
      ["XL", "44", "19", "29"],
    ],
  },
  shoes: {
    note: "Full-grain leather shoes stretch slightly with wear. If you are between sizes, take the smaller one.",
    headers: ["UK", "US", "EU", "Foot length (in)"],
    rows: [
      ["6", "7", "40", "9.6"],
      ["7", "8", "41", "10"],
      ["8", "9", "42", "10.4"],
      ["9", "10", "43", "10.8"],
      ["10", "11", "44", "11.2"],
      ["11", "12", "45", "11.6"],
    ],
  },
  belts: {
    note: "Measure around your waist where you wear your trousers, then pick the range that contains it.",
    headers: ["Size", "Waist (in)", "Belt length (in)"],
    rows: [
      ["S", "30 - 32", "36"],
      ["M", "33 - 35", "38"],
      ["L", "36 - 38", "40"],
      ["XL", "39 - 41", "42"],
    ],
  },
};

function ReviewForm({ productSlug }: { productSlug: string }) {  const toast = useToast();
  const addReview = useStore((s) => s.addReview);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Please enter your name.";
    if (title.trim().length < 3) next.title = "Give your review a short title.";
    if (body.trim().length < 10) next.body = "Tell us a little more (at least 10 characters).";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    addReview({
      productSlug,
      author: name.trim(),
      rating,
      title: title.trim(),
      body: body.trim(),
    });
    setName("");
    setRating(5);
    setTitle("");
    setBody("");
    toast("Thank you. Your review has been submitted.");
  };

  const inputClass = (hasError: boolean) =>
    clsx(
      "w-full rounded-xl border bg-ivory px-4 py-3 text-sm text-espresso placeholder:text-espresso/40 focus:outline-none focus:ring-2 focus:ring-cognac",
      hasError ? "border-red-700" : "border-espresso/20"
    );

  return (
    <form onSubmit={submit} noValidate className="mt-8 rounded-2xl border border-espresso/10 p-5 sm:p-6">
      <h3 className="font-display text-xl text-espresso">Write a review</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="review-name" className="mb-1.5 block text-sm font-medium text-espresso">
            Your name
          </label>
          <input
            id="review-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ayesha R."
            className={inputClass(!!errors.name)}
          />
          {errors.name ? <p role="alert" className="mt-1 text-xs text-red-700">{errors.name}</p> : null}
        </div>
        <div>
          <label htmlFor="review-rating" className="mb-1.5 block text-sm font-medium text-espresso">
            Rating
          </label>
          <select
            id="review-rating"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className={inputClass(false)}
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} star{r === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="review-title" className="mb-1.5 block text-sm font-medium text-espresso">
          Review title
        </label>
        <input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum it up in a few words"
          className={inputClass(!!errors.title)}
        />
        {errors.title ? <p role="alert" className="mt-1 text-xs text-red-700">{errors.title}</p> : null}
      </div>
      <div className="mt-4">
        <label htmlFor="review-body" className="mb-1.5 block text-sm font-medium text-espresso">
          Your review
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="How is the fit, the leather, the ageing?"
          className={inputClass(!!errors.body)}
        />
        {errors.body ? <p role="alert" className="mt-1 text-xs text-red-700">{errors.body}</p> : null}
      </div>
      <Button type="submit" className="mt-5">
        Submit review
      </Button>
    </form>
  );
}

function ProductDetail({ product, catalog }: { product: Product; catalog: Product[] }) {
  const router = useRouter();
  const toast = useToast();
  const addToCart = useStore((s) => s.addToCart);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const getReviews = useStore((s) => s.getReviews);

  const wishlisted = wishlist.includes(product.id);

  const colorOptions = useMemo(() => {
    const seen = new Map<string, string>();
    product.variants.forEach((v) => {
      if (!seen.has(v.color)) seen.set(v.color, v.colorHex);
    });
    return Array.from(seen.entries()).map(([color, colorHex]) => ({ color, colorHex }));
  }, [product]);

  const firstAvailable = useMemo(
    () => product.variants.find((v) => v.stock > 0) ?? product.variants[0],
    [product]
  );

  const [color, setColor] = useState(firstAvailable?.color ?? "");
  const [size, setSize] = useState<string | undefined>(firstAvailable?.size);
  const [imageIndex, setImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [fly, setFly] = useState<{ x: number; y: number; key: number } | null>(null);
  const addButtonRef = useRef<HTMLDivElement>(null);

  const sizes = useMemo(
    () =>
      Array.from(
        new Set(
          product.variants.filter((v) => v.color === color && v.size).map((v) => v.size as string)
        )
      ),
    [product, color]
  );

  const selectedVariant = useMemo(() => {
    if (sizes.length > 0) return product.variants.find((v) => v.color === color && v.size === size);
    return product.variants.find((v) => v.color === color && !v.size);
  }, [product, color, size, sizes]);

  const handleColorChange = (next: string) => {
    setColor(next);
    const firstForColor =
      product.variants.find((v) => v.color === next && v.stock > 0) ??
      product.variants.find((v) => v.color === next);
    setSize(firstForColor?.size);
    setQty(1);
    setImageIndex(0);
  };

  const soldOut = !selectedVariant || selectedVariant.stock === 0;
  const lowStock = !!selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 3;

  const buildCartItem = () => ({
    variantId: selectedVariant!.id,
    productSlug: product.slug,
    name: product.name,
    image: product.images[0],
    color: selectedVariant!.color,
    size: selectedVariant!.size,
    price: selectedVariant!.price,
    sku: selectedVariant!.sku,
  });

  const handleAddToBag = () => {
    if (!selectedVariant || soldOut) return;
    const rect = addButtonRef.current?.getBoundingClientRect();
    if (rect) {
      setFly({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, key: Date.now() });
    }
    addToCart(buildCartItem(), Math.min(qty, selectedVariant.stock));
    toast(`${product.name} added to your bag.`);
    setCartOpen(true);
  };

  const handleBuyNow = () => {
    if (!selectedVariant || soldOut) return;
    addToCart(buildCartItem(), Math.min(qty, selectedVariant.stock));
    router.push("/checkout");
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: product.tagline, url });
        return;
      }
      throw new Error("share-unavailable");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        toast("Link copied.");
      } catch {
        toast("Copy this page URL to share it.");
      }
    }
  };

  const handleNotify = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyEmail.trim())) {
      toast("Please enter a valid email address.");
      return;
    }
    setNotifyEmail("");
    toast("We will email you when it is back.");
  };

  const reviews = getReviews(product.slug);
  const reviewTotal = reviews.length;
  const reviewAvg = reviewTotal > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviewTotal : product.rating;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const related = getRelatedProducts(product, 4, catalog);

  // Recently viewed, stored locally.
  const [recent, setRecent] = useState<Product[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tt-recent");
      const slugs: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      const next = [product.slug, ...slugs.filter((s) => s !== product.slug)].slice(0, 8);
      localStorage.setItem("tt-recent", JSON.stringify(next));
      setRecent(
        next
          .filter((s) => s !== product.slug)
          .map((s) => getProductBySlug(s, catalog))
          .filter((p): p is Product => p !== undefined)
          .slice(0, 4)
      );
    } catch {
      // private browsing or disabled storage; recently viewed is optional
    }
  }, [product.slug, catalog]);

  const sizeGuide = SIZE_GUIDES[product.category];

  return (
    <div className="container-x py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-espresso/55">
        <Link href="/" className="hover:text-cognac-dark">Home</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-cognac-dark">
          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
        </Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span className="text-espresso" aria-current="page">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <div>
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label={`Open ${product.name} image in full view`}
            className="relative block aspect-[4/5] w-full overflow-hidden rounded-3xl bg-espresso/5 ring-1 ring-espresso/10"
          >
            <Image
              src={product.images[imageIndex] ?? product.images[0]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-espresso-deep/75 px-3.5 py-2 text-xs font-semibold tracking-wide text-ivory backdrop-blur transition-colors group-hover:bg-espresso-deep/90">
              <Expand className="h-3.5 w-3.5" aria-hidden="true" />
              Tap to zoom
            </span>
          </button>
          {product.images.length > 1 ? (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {product.images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={imageIndex === i}
                  className={clsx(
                    "relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-espresso/5 ring-2 ring-offset-2 ring-offset-ivory transition-all",
                    imageIndex === i
                      ? "ring-cognac"
                      : "ring-transparent opacity-70 hover:opacity-100 hover:ring-espresso/30"
                  )}
                >
                  <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Details */}
        <div>
          <div className="flex flex-wrap gap-2">
            {product.compareAtPrice ? <Badge tone="sale">Sale</Badge> : null}
            {product.isNew ? <Badge tone="new">New</Badge> : null}
            {product.bestSeller ? <Badge tone="default">Bestseller</Badge> : null}
            {lowStock ? <Badge tone="low">Only {selectedVariant?.stock} left</Badge> : null}
          </div>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-cognac-dark">
            {product.category}
          </p>
          <h1 className="font-display mt-1.5 text-balance text-3xl tracking-tight text-espresso sm:text-[2.6rem] sm:leading-[1.1]">
            {product.name}
          </h1>
          <p className="mt-2 text-[15px] text-espresso/60">{product.tagline}</p>

          <a href="#reviews" className="mt-3 inline-flex items-center gap-2">
            <StarRating value={reviewAvg} size={16} />
            <span className="text-sm text-espresso/60 underline-offset-2 hover:underline">
              {reviewAvg.toFixed(1)} · {reviewTotal > 0 ? reviewTotal : product.reviewCount} reviews
            </span>
          </a>

          <div className="mt-5 flex items-baseline gap-3 border-y border-espresso/10 py-4">
            <span className="text-[1.7rem] font-semibold tracking-tight text-espresso tabular-nums">
              {formatPKR(selectedVariant?.price ?? product.price)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-base text-espresso/40 line-through tabular-nums">
                {formatPKR(product.compareAtPrice)}
              </span>
            ) : null}
            {product.compareAtPrice ? (
              <span className="rounded-full bg-[#8C2F2F]/10 px-2.5 py-1 text-xs font-semibold text-[#8C2F2F]">
                Save {formatPKR(product.compareAtPrice - (selectedVariant?.price ?? product.price))}
              </span>
            ) : null}
          </div>

          {/* Colour selector */}
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-espresso/55">
              Colour{" "}
              <span className="ml-1 font-medium normal-case tracking-normal text-espresso">
                {color}
              </span>
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {colorOptions.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  title={c.color}
                  aria-label={`Select colour ${c.color}`}
                  aria-pressed={color === c.color}
                  onClick={() => handleColorChange(c.color)}
                  className={clsx(
                    "h-10 w-10 rounded-full border transition-all",
                    color === c.color
                      ? "scale-105 border-cognac ring-2 ring-cognac ring-offset-2 ring-offset-ivory"
                      : "border-espresso/20 hover:scale-105 hover:border-espresso/50"
                  )}
                  style={{ backgroundColor: c.colorHex }}
                />
              ))}
            </div>
          </div>

          {/* Size selector */}
          {sizes.length > 0 ? (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-espresso/55">
                  Size{size ? `: ${size}` : ""}
                </p>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-cognac-dark underline-offset-2 hover:underline"
                >
                  <Ruler className="h-4 w-4" aria-hidden="true" />
                  Size guide
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {sizes.map((s) => {
                  const variant = product.variants.find((v) => v.color === color && v.size === s);
                  const out = !variant || variant.stock === 0;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={out}
                      aria-label={out ? `Size ${s}, sold out` : `Select size ${s}`}
                      aria-pressed={size === s}
                      onClick={() => {
                        setSize(s);
                        setQty(1);
                      }}
                      className={clsx(
                        "min-w-12 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all",
                        size === s
                          ? "border-espresso bg-espresso text-ivory shadow-sm"
                          : "border-espresso/25 text-espresso hover:border-espresso",
                        out && "cursor-not-allowed border-espresso/15 text-espresso/35 line-through"
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Stock / notify */}
          {soldOut ? (
            <div className="mt-6 rounded-2xl border border-espresso/15 bg-ivory-dark/60 p-5 ring-1 ring-espresso/5">
              <p className="flex items-center gap-2 text-sm font-semibold text-espresso">
                <Bell className="h-4 w-4 text-cognac-dark" aria-hidden="true" />
                Sold out in {color}
                {size ? ` / ${size}` : ""}
              </p>
              <p className="mt-1 text-sm text-espresso/60">
                Leave your email and we will let you know the moment it is back.
              </p>
              <div className="mt-3 flex gap-2">
                <label htmlFor="notify-email" className="sr-only">
                  Email for restock notification
                </label>
                <input
                  id="notify-email"
                  type="email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="Your email address"
                  className="h-11 flex-1 rounded-full border border-espresso/20 bg-ivory px-4 text-sm text-espresso placeholder:text-espresso/40 focus:outline-none focus:ring-2 focus:ring-cognac"
                />
                <Button onClick={handleNotify}>Notify me</Button>
              </div>
            </div>
          ) : null}

          {/* Qty + actions */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <QuantityStepper
              qty={qty}
              onChange={(q) => setQty(Math.min(q, selectedVariant?.stock ?? q))}
            />
            <div ref={addButtonRef} className="flex-1">
              <Button
                size="lg"
                onClick={handleAddToBag}
                disabled={soldOut}
                className="w-full shadow-md shadow-cognac/25 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-cognac/30"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                Add to Bag
              </Button>
            </div>
            <button
              type="button"
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={wishlisted}
              onClick={() => {
                toggleWishlist(product.id);
                toast(wishlisted ? "Removed from your wishlist." : "Saved to your wishlist.");
              }}
              className={clsx(
                "rounded-full border p-3.5 shadow-sm transition-all hover:-translate-y-px",
                wishlisted
                  ? "border-cognac bg-cognac/10"
                  : "border-espresso/25 hover:border-espresso/60"
              )}
            >
              <Heart
                className={clsx("h-5 w-5", wishlisted ? "fill-cognac text-cognac" : "text-espresso")}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              aria-label="Share this product"
              onClick={handleShare}
              className="rounded-full border border-espresso/25 p-3.5 shadow-sm transition-all hover:-translate-y-px hover:border-espresso/60"
            >
              <Share2 className="h-5 w-5 text-espresso" aria-hidden="true" />
            </button>
          </div>
          <Button
            size="lg"
            variant="secondary"
            onClick={handleBuyNow}
            disabled={soldOut}
            className="mt-3 w-full shadow-md shadow-espresso/20 transition-all hover:-translate-y-px"
          >
            Buy Now
          </Button>

          {/* Trust notes */}
          <ul className="mt-7 space-y-3 rounded-2xl bg-ivory-dark/60 p-5 text-sm text-espresso/70 ring-1 ring-espresso/10">
            <li className="flex items-center gap-3">
              <Truck className="h-4 w-4 shrink-0 text-cognac-dark" aria-hidden="true" />
              Nationwide delivery in 3 to 5 working days
            </li>
            <li className="flex items-center gap-3">
              <RotateCcw className="h-4 w-4 shrink-0 text-cognac-dark" aria-hidden="true" />
              7-day easy exchange, no questions asked
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 shrink-0 text-cognac-dark" aria-hidden="true" />
              Lifetime repairs on every stitch
            </li>
          </ul>

          {/* Accordions */}
          <div className="mt-8 border-t border-espresso/10">
            <Accordion
              items={[
                {
                  title: "Description",
                  content: <p className="whitespace-pre-line">{product.description}</p>,
                },
                {
                  title: "Materials and Care",
                  content: (
                    <div className="space-y-3">
                      <p className="whitespace-pre-line">{product.materials}</p>
                      <p className="whitespace-pre-line">{product.care}</p>
                    </div>
                  ),
                },
                {
                  title: "Shipping and Returns",
                  content: (
                    <div className="space-y-3">
                      <p>
                        We deliver nationwide across Pakistan in 3 to 5 working days. Shipping
                        is a flat Rs 250 to Rs 500 depending on your city, and complimentary on
                        orders over Rs 15,000.
                      </p>
                      <p>
                        Changed your mind? You have 7 days from delivery for an easy exchange.
                        The piece must be unused and in its original condition. Cash on delivery
                        is available on every order.
                      </p>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section id="reviews" className="mt-16 scroll-mt-24 border-t border-espresso/10 pt-12 sm:mt-20 sm:pt-14">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cognac">
          What owners say
        </p>
        <h2 className="font-display mt-2 text-3xl tracking-tight text-espresso">Reviews</h2>
        <div className="mt-6 grid gap-10 lg:grid-cols-[300px_1fr]">
          <div className="rounded-2xl border border-espresso/10 bg-ivory p-6 shadow-sm self-start">
            <p className="font-display text-5xl text-espresso">{reviewAvg.toFixed(1)}</p>
            <StarRating value={reviewAvg} size={18} />
            <p className="mt-1 text-sm text-espresso/60">
              Based on {reviewTotal > 0 ? reviewTotal : product.reviewCount} reviews
            </p>
            <div className="mt-4 space-y-2">
              {distribution.map((d) => (
                <div key={d.star} className="flex items-center gap-2 text-sm">
                  <span className="w-8 shrink-0 text-espresso/60">{d.star} ★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-espresso/10">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{
                        width: `${reviewTotal > 0 ? (d.count / reviewTotal) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-espresso/60">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            {reviews.length === 0 ? (
              <p className="rounded-2xl bg-ivory-dark/60 p-6 text-sm text-espresso/65">
                No written reviews yet. Bought this piece? Be the first to share how it is
                ageing.
              </p>
            ) : (
              <ul className="space-y-5">
                {reviews.map((review) => (
                  <li
                    key={review.id}
                    className="rounded-2xl border border-espresso/10 p-5 sm:p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <StarRating value={review.rating} size={14} />
                      <span className="text-xs text-espresso/50">{formatDate(review.date)}</span>
                    </div>
                    <h3 className="mt-2 font-semibold text-espresso">{review.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-espresso/70">{review.body}</p>
                    <p className="mt-3 flex items-center gap-2 text-sm text-espresso/60">
                      <span className="font-medium text-espresso">{review.author}</span>
                      {review.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-espresso/8 px-2.5 py-0.5 text-xs font-semibold text-espresso/70">
                          <Check className="h-3 w-3" aria-hidden="true" />
                          Verified buyer
                        </span>
                      ) : null}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <ReviewForm productSlug={product.slug} />
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 ? (
        <section className="mt-16 border-t border-espresso/10 pt-12 sm:mt-20 sm:pt-14">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cognac">
            Complete the carry
          </p>
          <h2 className="font-display mt-2 text-3xl tracking-tight text-espresso">
            You may also like
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Recently viewed */}
      {recent.length > 0 ? (
        <section className="mt-16 border-t border-espresso/10 pt-12 sm:mt-20 sm:pt-14">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cognac">
            Pick up where you left off
          </p>
          <h2 className="font-display mt-2 text-3xl tracking-tight text-espresso">
            Recently viewed
          </h2>
          <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:gap-6">
            {recent.map((p) => (
              <div key={p.id} className="w-40 shrink-0 snap-start sm:w-56">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Lightbox */}
      <Modal
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={product.name}
        wide
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-espresso/5 sm:aspect-[16/10]">
          <Image
            src={product.images[imageIndex] ?? product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
        {product.images.length > 1 ? (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {product.images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setImageIndex(i)}
                aria-label={`View image ${i + 1}`}
                className={clsx(
                  "relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-espresso/5 ring-2 ring-offset-2 ring-offset-ivory",
                  imageIndex === i ? "ring-cognac" : "ring-transparent"
                )}
              >
                <Image src={src} alt="" fill sizes="56px" className="object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </Modal>

      {/* Size guide */}
      {sizeGuide ? (
        <Modal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} title="Size guide">
          <p className="text-sm text-espresso/65">{sizeGuide.note}</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-espresso/15 text-left">
                  {sizeGuide.headers.map((h) => (
                    <th key={h} scope="col" className="px-3 py-2.5 font-semibold text-espresso">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizeGuide.rows.map((row) => (
                  <tr key={row[0]} className="border-b border-espresso/8 last:border-0">
                    {row.map((cell, i) => (
                      <td
                        key={i}
                        className={clsx(
                          "px-3 py-2.5",
                          i === 0 ? "font-semibold text-espresso" : "text-espresso/70"
                        )}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      ) : null}

      {/* Flying add-to-bag dot */}
      {fly ? (
        <motion.span
          key={fly.key}
          aria-hidden="true"
          className="pointer-events-none fixed z-[100] h-4 w-4 rounded-full bg-cognac"
          style={{ left: fly.x - 8, top: fly.y - 8 }}
          initial={{ scale: 1, opacity: 1, x: 0, y: 0 }}
          animate={{
            x: typeof window !== "undefined" ? window.innerWidth - 60 - fly.x : 0,
            y: 24 - fly.y,
            scale: 0.35,
            opacity: 0.7,
          }}
          transition={{ duration: 0.65, ease: "easeInOut" }}
          onAnimationComplete={() => setFly(null)}
        />
      ) : null}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="container-x py-8 sm:py-12" aria-hidden="true">
      <div className="h-5 w-40 animate-pulse rounded bg-espresso/10" />
      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-espresso/10" />
        <div>
          <div className="h-8 w-3/4 animate-pulse rounded bg-espresso/10" />
          <div className="mt-3 h-5 w-1/2 animate-pulse rounded bg-espresso/10" />
          <div className="mt-6 h-9 w-1/3 animate-pulse rounded bg-espresso/10" />
          <div className="mt-8 h-12 w-full animate-pulse rounded-full bg-espresso/10" />
          <div className="mt-3 h-12 w-full animate-pulse rounded-full bg-espresso/10" />
        </div>
      </div>
    </div>
  );
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  // null = loading, undefined = not found
  const [product, setProduct] = useState<Product | undefined | null>(null);
  const [catalog, setCatalog] = useState<Product[] | null>(null);

  useEffect(() => {
    getCatalog()
      .then((ps) => setCatalog(ps.filter((p) => p.active !== false)))
      .catch(() => setCatalog([]));
    getCatalogProduct(params.slug)
      .then((p) => setProduct(p ?? undefined))
      .catch(() => setProduct(undefined));
  }, [params.slug]);

  if (product === null || catalog === null) return <ProductSkeleton />;
  if (product === undefined) notFound();
  return <ProductDetail product={product} catalog={catalog} />;
}
