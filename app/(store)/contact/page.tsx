"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { siteConfig, isContactPlaceholder } from "@/site.config";
import { useSiteSetting } from "@/lib/use-site-setting";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Please enter your name.";
    if (!EMAIL_RE.test(email.trim())) next.email = "Please enter a valid email address.";
    if (message.trim().length < 10)
      next.message = "Tell us a little more (at least 10 characters).";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // Phase 2: send via Resend. For now the message is kept locally so nothing is lost.
    try {
      const raw = localStorage.getItem("tt-messages");
      const existing = raw ? (JSON.parse(raw) as unknown[]) : [];
      existing.push({ name: name.trim(), email: email.trim(), message: message.trim(), at: new Date().toISOString() });
      localStorage.setItem("tt-messages", JSON.stringify(existing));
    } catch {
      // storage unavailable; the success state still confirms receipt
    }
    setSent(true);
  };

  const inputClass = (hasError: boolean) =>
    clsx(
      "w-full rounded-xl border bg-ivory px-4 py-3 text-sm text-espresso placeholder:text-espresso/40 focus:outline-none focus:ring-2 focus:ring-cognac",
      hasError ? "border-red-700" : "border-espresso/20"
    );

  // Admin-editable support contact details take precedence over the
  // site.config placeholders; unfilled values keep the old behaviour.
  const supportPhone = useSiteSetting("support_phone").trim();
  const supportEmail = useSiteSetting("support_email").trim();
  const contactPhone = supportPhone || siteConfig.contact.phone;
  const contactEmail = supportEmail || siteConfig.contact.email;

  const infoCards = [
    {
      icon: Phone,
      label: "Phone",
      value: contactPhone,
      href: `tel:${contactPhone}`,
    },
    {
      icon: Mail,
      label: "Email",
      value: contactEmail,
      href: `mailto:${contactEmail}`,
    },
    {
      icon: MapPin,
      label: "Workshop",
      value: siteConfig.contact.address,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: siteConfig.contact.whatsapp,
      href: `https://wa.me/${siteConfig.contact.whatsapp}`,
    },
  ].filter((card) => !isContactPlaceholder(card.value));

  return (
    <div className="container-x py-10 sm:py-14">
      <SectionHeader
        eyebrow="Get in touch"
        title="Contact us"
        copy="Questions about sizing, leather care, an order or a repair? Write to us, we reply within one working day."
      />

      <div className="mx-auto mt-10 grid max-w-4xl gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          {sent ? (
            <div className="rounded-2xl border border-espresso/10 p-8 text-center sm:p-12">
              <span className="mx-auto inline-flex rounded-full bg-cognac/15 p-4">
                <CheckCircle2 className="h-8 w-8 text-cognac-dark" aria-hidden="true" />
              </span>
              <h2 className="font-display mt-5 text-2xl text-espresso">Message received</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-espresso/65">
                Thank you, {name.split(" ")[0] || "friend"}. We will get back to you at{" "}
                {email} within one working day.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setSent(false);
                  setName("");
                  setEmail("");
                  setMessage("");
                }}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form
              onSubmit={submit}
              noValidate
              className="rounded-2xl border border-espresso/10 p-5 sm:p-7"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-espresso">
                    Your name
                  </label>
                  <input
                    id="contact-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ahmed Raza"
                    autoComplete="name"
                    className={inputClass(!!errors.name)}
                  />
                  {errors.name ? (
                    <p role="alert" className="mt-1 text-xs text-red-700">{errors.name}</p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-espresso">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={inputClass(!!errors.email)}
                  />
                  {errors.email ? (
                    <p role="alert" className="mt-1 text-xs text-red-700">{errors.email}</p>
                  ) : null}
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-espresso">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="How can we help?"
                  className={inputClass(!!errors.message)}
                />
                {errors.message ? (
                  <p role="alert" className="mt-1 text-xs text-red-700">{errors.message}</p>
                ) : null}
              </div>
              <Button type="submit" size="lg" className="mt-5 w-full sm:w-auto">
                Send message
              </Button>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          {infoCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-espresso/10 p-5"
            >
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-espresso/55">
                <card.icon className="h-4 w-4 text-cognac-dark" aria-hidden="true" />
                {card.label}
              </p>
              {card.href ? (
                <a
                  href={card.href}
                  className="mt-2 block break-words font-medium text-espresso hover:text-cognac-dark"
                >
                  {card.value}
                </a>
              ) : (
                <p className="mt-2 break-words font-medium text-espresso">{card.value}</p>
              )}
            </div>
          ))}
          <div className="rounded-2xl bg-espresso p-5 text-ivory">
            <p className="font-display text-lg">Quick answers</p>
            <p className="mt-1 text-sm text-ivory/70">
              Shipping, exchanges and repairs, answered in one place.
            </p>
            <Link
              href="/faq"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold"
            >
              Visit the FAQ
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
