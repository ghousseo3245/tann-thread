"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { siteConfig, isContactPlaceholder } from "@/site.config";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

const SHOP_LINKS = [
  { label: "Shop All", href: "/shop" },
  { label: "Bags", href: "/shop?category=bags" },
  { label: "Wallets", href: "/shop?category=wallets" },
  { label: "Jackets", href: "/shop?category=jackets" },
  { label: "Belts", href: "/shop?category=belts" },
  { label: "Shoes", href: "/shop?category=shoes" },
];

const HELP_LINKS = [
  { label: "FAQ", href: "/faq" },
  { label: "Track Order", href: "/track-order" },
  { label: "Contact", href: "/contact" },
  { label: "Shipping & Returns", href: "/faq" },
];

function NewsletterForm() {
  const subscribeNewsletter = useStore((s) => s.subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  if (subscribed) {
    return (
      <p className="flex items-center gap-2 text-ivory">
        <CheckCircle className="h-5 w-5 text-gold" aria-hidden="true" />
        <span className="text-sm font-medium">You are on the list.</span>
      </p>
    );
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        const value = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          setError("Please enter a valid email address.");
          return;
        }
        await subscribeNewsletter(value);
        setSubscribed(true);
      }}
      className="flex flex-col sm:flex-row gap-3 max-w-md"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Your email address"
        className="h-12 flex-1 rounded-full border border-ivory/20 bg-ivory/10 px-5 text-sm text-ivory placeholder:text-ivory/50 focus:outline-none focus:ring-2 focus:ring-cognac"
      />
      <Button type="submit" variant="primary" size="md">
        Subscribe
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-gold">
          {error}
        </p>
      ) : null}
    </form>
  );
}

export function Footer() {
  const { phone, email, address, whatsapp } = siteConfig.contact;

  const contactRows = [
    !isContactPlaceholder(phone) && { icon: Phone, label: "Phone", value: phone, href: `tel:${phone}` },
    !isContactPlaceholder(email) && { icon: Mail, label: "Email", value: email, href: `mailto:${email}` },
    !isContactPlaceholder(address) && { icon: MapPin, label: "Address", value: address, href: undefined },
    !isContactPlaceholder(whatsapp) && {
      icon: MessageCircle,
      label: "WhatsApp",
      value: whatsapp,
      href: `https://wa.me/${whatsapp}`,
    },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  return (
    <footer className="bg-espresso-deep text-ivory">
      <div className="container-x py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 pb-12 border-b border-ivory/10">
          <div>
            <h2 className="font-display text-2xl">Join the workshop list</h2>
            <p className="text-ivory/70 text-sm mt-2 mb-5 leading-relaxed">
              New arrivals, workshop stories, and subscriber-only offers. One email a month, never more.
            </p>
            <NewsletterForm />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <Link href="/" className="font-display text-xl font-semibold">
                Tann <span className="text-cognac">&</span> Thread
              </Link>
              <p className="text-ivory/60 text-sm mt-3 leading-relaxed">{siteConfig.tagline}.</p>
              <p className="text-ivory/50 text-sm mt-2 leading-relaxed">
                Full-grain leather goods cut, stitched, and finished by hand in Pakistan.
              </p>
            </div>
            <nav aria-label="Shop">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ivory/50 mb-4">Shop</h3>
              <ul className="space-y-2.5 text-sm">
                {SHOP_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-ivory/70 hover:text-cognac transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="col-span-2 sm:col-span-1">
              <nav aria-label="Help" className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ivory/50 mb-4">Help</h3>
                <ul className="space-y-2.5 text-sm">
                  {HELP_LINKS.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-ivory/70 hover:text-cognac transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              {contactRows.length > 0 ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ivory/50 mb-4">Contact</h3>
                  <ul className="space-y-2.5 text-sm">
                    {contactRows.map((row) => (
                      <li key={row.label} className="flex items-start gap-2.5 text-ivory/70">
                        <row.icon className="h-4 w-4 mt-0.5 shrink-0 text-cognac" aria-hidden="true" />
                        {row.href ? (
                          <a href={row.href} className="hover:text-cognac transition-colors break-words">
                            {row.value}
                          </a>
                        ) : (
                          <span className="break-words">{row.value}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ivory/50">
          <p>&copy; {new Date().getFullYear()} Tann &amp; Thread. All rights reserved.</p>
          <p>Prices in Pakistani Rupees (PKR)</p>
          <p>Cash on Delivery available nationwide</p>
        </div>
      </div>
    </footer>
  );
}
