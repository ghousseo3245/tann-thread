"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Heart, Menu, Search, ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

const CATEGORY_LINKS = [
  { label: "Bags", slug: "bags" },
  { label: "Wallets", slug: "wallets" },
  { label: "Jackets", slug: "jackets" },
  { label: "Belts", slug: "belts" },
  { label: "Shoes", slug: "shoes" },
];

const NAV_LINKS = [
  { label: "Shop All", href: "/shop" },
  ...CATEGORY_LINKS.map((c) => ({ label: c.label, href: `/shop?category=${c.slug}` })),
  { label: "Our Story", href: "/our-story" },
  { label: "Track Order", href: "/track-order" },
  { label: "Contact", href: "/contact" },
];

function CountBadge({ count, label }: { count: number; label: string }) {
  if (count <= 0) return null;
  return (
    <span
      aria-label={label}
      className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-cognac text-[10px] font-semibold leading-none text-white"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function SearchForm({ onNavigate, autoFocus }: { onNavigate?: () => void; autoFocus?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  return (
    <form
      className="flex items-center"
      onSubmit={(event) => {
        event.preventDefault();
        const q = query.trim();
        router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
        onNavigate?.();
      }}
      role="search"
    >
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onBlur={() => {
          if (!query) setExpanded(false);
        }}
        onFocus={() => setExpanded(true)}
        autoFocus={autoFocus}
        placeholder="Search leather goods"
        aria-label="Search products"
        className={clsx(
          "h-10 rounded-full border border-espresso/20 bg-ivory px-4 text-sm text-espresso placeholder:text-espresso/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cognac",
          expanded || query ? "w-44 opacity-100 sm:w-56" : "w-0 border-transparent px-0 opacity-0"
        )}
      />
      <button
        type="button"
        aria-label={expanded ? "Collapse search" : "Search"}
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
        className="-ml-1 rounded-full p-2.5 text-espresso transition-colors hover:bg-espresso/5"
      >
        <Search className="h-5 w-5" aria-hidden="true" />
      </button>
    </form>
  );
}

const NAV_LINK_CLASS =
  "relative whitespace-nowrap text-[13px] font-semibold uppercase tracking-[0.12em] text-espresso/70 transition-colors hover:text-espresso after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-cognac after:transition-all after:duration-300 hover:after:w-full";

export function Header() {
  const router = useRouter();
  const cartCount = useStore((s) => s.cartCount);
  const wishlist = useStore((s) => s.wishlist);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-espresso/10 bg-ivory/90 backdrop-blur-md">
        <div className="container-x flex h-16 items-center justify-between gap-2 lg:h-[4.5rem]">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="rounded-full p-2.5 text-espresso transition-colors hover:bg-espresso/5 lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <Link href="/" aria-label="Tann and Thread home" className="shrink-0">
            <span className="font-display text-[1.4rem] font-semibold tracking-tight text-espresso">
              Tann <span className="text-cognac">&</span> Thread
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={NAV_LINK_CLASS}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5">
            <div className="hidden sm:block">
              <SearchForm />
            </div>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative rounded-full p-2.5 text-espresso transition-colors hover:bg-espresso/5"
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
              <CountBadge count={wishlist.length} label={`${wishlist.length} items in wishlist`} />
            </Link>
            <button
              type="button"
              aria-label="Open cart"
              onClick={() => setCartOpen(true)}
              className="relative rounded-full p-2.5 text-espresso transition-colors hover:bg-espresso/5"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              <CountBadge count={cartCount} label={`${cartCount} items in cart`} />
            </button>
          </div>
        </div>
      </header>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" side="left">
        <form
          className="mb-6"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const input = form.querySelector("input");
            const q = input?.value.trim() ?? "";
            router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
            setMenuOpen(false);
          }}
        >
          <input
            name="q"
            placeholder="Search leather goods"
            aria-label="Search products"
            className="h-11 w-full rounded-full border border-espresso/20 bg-ivory px-4 text-sm text-espresso placeholder:text-espresso/40 focus:outline-none focus:ring-2 focus:ring-cognac"
          />
        </form>
        <nav aria-label="Mobile" className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-espresso/80 transition-colors hover:bg-espresso/5 hover:text-espresso"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6">
          <Button variant="outline" size="md" className="w-full" onClick={() => setMenuOpen(false)}>
            Close
          </Button>
        </div>
      </Drawer>
    </>
  );
}
