"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Menu,
  Package,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import { LogoutButton } from "./logout-button";
import { ModeBadge } from "./mode-badge";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
];

function SidebarBrand() {
  return (
    <div className="px-6 py-6">
      <p className="font-display text-xl text-ivory">Tann &amp; Thread</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-cognac-light">
        Admin
      </p>
    </div>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-4" aria-label="Admin">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
              active
                ? "bg-cognac text-white"
                : "text-ivory/70 hover:bg-ivory/10 hover:text-ivory"
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </Link>
        );
      })}

      <div className="my-3 border-t border-ivory/10" aria-hidden="true" />

      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ivory/70 transition-colors hover:bg-ivory/10 hover:text-ivory"
      >
        <Store className="h-5 w-5" aria-hidden="true" />
        View store
      </a>
      <LogoutButton />
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // The login page gets a bare centered card, without the sidebar or top bar.
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-ivory-dark/50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-espresso-deep lg:flex">
        <SidebarBrand />
        <SidebarNav />
        <p className="mt-auto px-6 py-6 text-xs leading-relaxed text-ivory/40">
          Crafted for those who appreciate quality.
        </p>
      </aside>

      {/* Mobile sidebar as a drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div
            className="absolute inset-0 bg-espresso-deep/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-espresso-deep shadow-xl">
            <div className="flex items-start justify-between">
              <SidebarBrand />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="mr-4 mt-6 rounded-full p-2 text-ivory/70 transition-colors hover:bg-ivory/10 hover:text-ivory"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-espresso/10 bg-ivory/90 px-4 py-3 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="rounded-full p-2 text-espresso transition-colors hover:bg-espresso/5 lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <span className="font-display text-lg text-espresso lg:hidden">
            Tann &amp; Thread Admin
          </span>
          <div className="ml-auto">
            <ModeBadge />
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto w-full max-w-6xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
