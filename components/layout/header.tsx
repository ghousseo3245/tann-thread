"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { ChevronDown, Heart, Menu, Search, ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

const SHOP_MENU = [
  { label: "Bags", href: "/shop?category=bags", tagline: "Carry it all, in full-grain leather" },
  { label: "Wallets", href: "/shop?category=wallets", tagline: "Slim profiles that age beautifully" },
  { label: "Jackets", href: "/shop?category=jackets", tagline: "Timeless silhouettes, broken-in comfort" },
  { label: "Belts", href: "/shop?category=belts", tagline: "The finishing touch, built to last" },
  { label: "Shoes", href: "/shop?category=shoes", tagline: "Welted construction, made for decades" },
];

const NAV_LINKS = [
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
  "relative whitespace-nowrap text-[13px] font-semibold uppercase tracking-[0.14em] text-espresso/70 transition-colors hover:text-espresso after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-cognac after:transition-all after:duration-300 hover:after:w-full";

function ShopDropdown() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const openMenu = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <Link
        href="/shop"
        aria-haspopup="true"
        aria-expanded={open}
        onFocus={openMenu}
        className={clsx(NAV_LINK_CLASS, "inline-flex items-center gap-1.5")}
      >
        Shop
        <ChevronDown
          className={clsx("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")}
          aria-hidden="true"
        />
      </Link>
      <div
        className={clsx(
          "absolute left-1/2 top-full z-50 -translate-x-1/2 pt-5 transition-all duration-200",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
        )}
      >
        <div className="w-80 overflow-hidden rounded-2xl border border-espresso/10 bg-ivory shadow-2xl shadow-espresso/15">
          <div className="border-b border-espresso/10 px-5 pb-3 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso/45">
              Shop by category
            </p>
          </div>
          <ul className="p-2">
            {SHOP_MENU.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  tabIndex={open ? 0 : -1}
                  className="group flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-espresso/[0.04]"
                >
                  <span>
                    <span className="block text-sm font-semibold tracking-wide text-espresso">
                      {item.label}
                    </span>
                    <span className="block text-xs text-espresso/50">{item.tagline}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-cognac opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const router = useRouter();
  const cartCount = useStore((s) => s.cartCount);
  const wishlist = useStore((s) => s.wishlist);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={clsx(
          "sticky top-0 z-40 border-b border-espresso/10 bg-ivory/95 backdrop-blur-md transition-shadow duration-300",
          scrolled && "shadow-[0_8px_30px_-12px_rgba(46,29,18,0.25)]"
        )}
      >
        <div className="container-x flex h-[4.25rem] items-center justify-between gap-2 lg:h-20">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="rounded-full p-2.5 text-espresso transition-colors hover:bg-espresso/5 lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <Link href="/" aria-label="Tann and Thread home" className="shrink-0">
            <span className="font-display text-2xl font-semibold tracking-tight text-espresso">
              Tann <span className="text-cognac">&</span> Thread
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
            <ShopDropdown />
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
        <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso/45">
          Shop
        </p>
        <nav aria-label="Mobile shop" className="flex flex-col gap-1">
          {SHOP_MENU.map((link) => (
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
        <p className="px-4 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso/45">
          Explore
        </p>
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
