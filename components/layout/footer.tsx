"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { siteConfig, isContactPlaceholder } from "@/site.config";
import { useSiteSetting } from "@/lib/use-site-setting";
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
      className="flex max-w-md flex-col gap-3 sm:flex-row"
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
      <Button type="submit" variant="primary" size="md" className="shrink-0">
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

const COLUMN_HEADING_CLASS =
  "mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-ivory/45";
const FOOTER_LINK_CLASS =
  "text-ivory/70 transition-all hover:translate-x-0.5 hover:text-gold inline-block";

export function Footer() {
  // Admin-editable support contact details take precedence over the
  // site.config placeholders; unfilled values keep the old behaviour.
  const supportPhone = useSiteSetting("support_phone").trim();
  const supportEmail = useSiteSetting("support_email").trim();
  const { address, whatsapp } = siteConfig.contact;
  const phone = supportPhone || siteConfig.contact.phone;
  const email = supportEmail || siteConfig.contact.email;

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
      <div className="container-x py-16">
        <div className="grid gap-12 border-b border-ivory/10 pb-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="font-display text-balance text-3xl tracking-tight">
              Join the workshop list
            </h2>
            <p className="mb-6 mt-3 max-w-md text-sm leading-relaxed text-ivory/65">
              New arrivals, workshop stories, and subscriber-only offers. One email a month,
              never more.
            </p>
            <NewsletterForm />
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <Link href="/" className="font-display text-xl font-semibold tracking-tight">
                Tann <span className="text-cognac">&</span> Thread
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-ivory/60">{siteConfig.tagline}.</p>
              <p className="mt-3 text-sm leading-relaxed text-ivory/45">
                Full-grain leather goods cut, stitched, and finished by hand in Pakistan.
              </p>
            </div>
            <nav aria-label="Shop">
              <h3 className={COLUMN_HEADING_CLASS}>Shop</h3>
              <ul className="space-y-3 text-sm">
                {SHOP_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={FOOTER_LINK_CLASS}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="col-span-2 sm:col-span-1">
              <nav aria-label="Help" className="mb-8">
                <h3 className={COLUMN_HEADING_CLASS}>Help</h3>
                <ul className="space-y-3 text-sm">
                  {HELP_LINKS.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className={FOOTER_LINK_CLASS}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              {contactRows.length > 0 ? (
                <div>
                  <h3 className={COLUMN_HEADING_CLASS}>Contact</h3>
                  <ul className="space-y-3 text-sm">
                    {contactRows.map((row) => (
                      <li key={row.label} className="flex items-start gap-2.5 text-ivory/70">
                        <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-cognac" aria-hidden="true" />
                        {row.href ? (
                          <a
                            href={row.href}
                            className="break-words transition-colors hover:text-gold"
                          >
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
        <div className="flex flex-col items-center justify-between gap-3 pt-8 text-xs tracking-wide text-ivory/45 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Tann &amp; Thread. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Prices in Pakistani Rupees (PKR)</span>
            <span className="inline-block h-3 w-px bg-ivory/20" aria-hidden="true" />
            <span>Cash on Delivery available nationwide</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
