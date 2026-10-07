"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info } from "lucide-react";
import { clsx } from "clsx";
import { inputClass } from "../_shared";
import {
  DEFAULT_HERO_SLIDES,
  SETTINGS_DEFAULTS,
  loadAdminSettings,
  parseHeroSlides,
  saveAdminSetting,
  type HeroSlide,
} from "@/lib/site-settings";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Skeleton } from "@/components/ui/skeleton";

function Section({
  title,
  copy,
  children,
}: {
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-espresso/10 bg-white p-5 sm:p-6">
      <h2 className="font-display text-xl text-espresso">{title}</h2>
      <p className="mt-1 text-sm text-espresso/60">{copy}</p>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function SaveButton({
  busy,
  dirty,
  onSave,
}: {
  busy: boolean;
  dirty: boolean;
  onSave: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSave}
      disabled={busy || !dirty}
      className="inline-flex items-center justify-center rounded-full bg-espresso px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-espresso-deep disabled:cursor-not-allowed disabled:opacity-40"
    >
      {busy ? "Saving..." : "Save changes"}
    </button>
  );
}

function SaveState({ saved, error }: { saved: boolean; error: string }) {
  return (
    <>
      {saved ? (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Saved
        </span>
      ) : null}
      {error ? (
        <span className="text-sm font-medium text-[#8C2F2F]">{error}</span>
      ) : null}
    </>
  );
}

const EMPTY_SLIDE: HeroSlide = {
  eyebrow: "",
  headline: "",
  subtext: "",
  ctaLabel: "Shop Now",
  ctaLink: "/shop",
  image: "",
};

function blankSlides(): HeroSlide[] {
  return [0, 1, 2].map(() => ({ ...EMPTY_SLIDE }));
}

/** datetime-local value (YYYY-MM-DDTHH:MM) from an ISO string. */
function toLocalInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function ContentPage() {
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Announcement
  const [announcement, setAnnouncement] = useState("");
  const [announcementSaved, setAnnouncementSaved] = useState<
    Record<string, string>
  >({});

  // Hero slides
  const [slides, setSlides] = useState<HeroSlide[]>(blankSlides());

  // Sale
  const [saleTitle, setSaleTitle] = useState(SETTINGS_DEFAULTS.sale_title);
  const [saleSubtitle, setSaleSubtitle] = useState(SETTINGS_DEFAULTS.sale_subtitle);
  const [saleEndsAt, setSaleEndsAt] = useState("");

  // Contact
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [busy, setBusy] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadAdminSettings()
      .then(({ values }) => {
        setAnnouncement(values["announcement_text"] ?? "");
        setAnnouncementSaved({ announcement_text: values["announcement_text"] ?? "" });

        const parsed = parseHeroSlides(values["hero_slides"]);
        const filled = [0, 1, 2].map((i) => ({ ...EMPTY_SLIDE, ...(parsed[i] ?? {}) }));
        setSlides(filled);

        setSaleTitle(values["sale_title"] || SETTINGS_DEFAULTS.sale_title);
        setSaleSubtitle(values["sale_subtitle"] || SETTINGS_DEFAULTS.sale_subtitle);
        const endsAt = values["sale_ends_at"] ?? "";
        setSaleEndsAt(
          toLocalInput(endsAt) ||
            toLocalInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        );

        setWhatsapp(values["whatsapp_owner_number"] ?? "");
        setPhone(values["support_phone"] ?? "");
        setEmail(values["support_email"] ?? "");
        setLoaded(true);
      })
      .catch(() => {
        setLoadError("Could not load content. Please refresh the page.");
      });
  }, []);

  async function save(key: string, value: string, section: string) {
    setBusy(section);
    setSavedKey(null);
    setErrorKey(null);
    setErrorMsg("");
    try {
      await saveAdminSetting(key, value);
      setSavedKey(section);
      if (key === "announcement_text") {
        setAnnouncementSaved({ announcement_text: value });
      }
    } catch {
      setErrorKey(section);
      setErrorMsg("Could not save. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function saveSlides() {
    const cleaned = slides.filter((s) => s.headline.trim() && s.image.trim());
    await save("hero_slides", JSON.stringify(cleaned), "hero");
  }

  async function saveSale() {
    const iso = saleEndsAt ? new Date(saleEndsAt).toISOString() : "";
    await save("sale_title", saleTitle.trim(), "sale");
    await save("sale_subtitle", saleSubtitle.trim(), "sale");
    await save("sale_ends_at", iso, "sale");
  }

  function updateSlide(index: number, patch: Partial<HeroSlide>) {
    setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  if (!loaded && !loadError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl text-espresso">Site content</h1>
          <p className="mt-1 text-sm text-espresso/60">Loading...</p>
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-espresso">Site content</h1>
        <p className="mt-1 text-sm text-espresso/60">
          Edit the homepage and store-wide text without touching code. Changes go
          live within a few minutes.
        </p>
      </div>

      {loadError ? (
        <p className="rounded-xl border border-[#8C2F2F]/20 bg-[#8C2F2F]/5 px-4 py-3 text-sm font-medium text-[#8C2F2F]">
          {loadError}
        </p>
      ) : null}

      {/* Announcement bar */}
      <Section
        title="Announcement bar"
        copy="The strip at the very top of every store page. Leave empty to keep the default rotating messages."
      >
        <div>
          <label
            htmlFor="content-announcement"
            className="mb-1.5 block text-sm font-medium text-espresso"
          >
            Announcement text
          </label>
          <textarea
            id="content-announcement"
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            rows={2}
            placeholder="e.g. Complimentary shipping on orders over Rs 15,000"
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-3">
          <SaveButton
            busy={busy === "announcement"}
            dirty={announcement !== (announcementSaved["announcement_text"] ?? "")}
            onSave={() => save("announcement_text", announcement.trim(), "announcement")}
          />
          <SaveState saved={savedKey === "announcement"} error={errorKey === "announcement" ? errorMsg : ""} />
        </div>
      </Section>

      {/* Hero slides */}
      <Section
        title="Homepage hero slides"
        copy="The rotating banners at the top of the homepage. Each slide needs a headline and an image; empty slides are skipped."
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className="rounded-2xl border border-espresso/10 bg-ivory-dark/40 p-4 sm:p-5"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-espresso/50">
              Slide {i + 1}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`slide-${i}-eyebrow`}
                  className="mb-1.5 block text-sm font-medium text-espresso"
                >
                  Eyebrow (small label)
                </label>
                <input
                  id={`slide-${i}-eyebrow`}
                  value={slide.eyebrow}
                  onChange={(e) => updateSlide(i, { eyebrow: e.target.value })}
                  className={inputClass}
                  placeholder={DEFAULT_HERO_SLIDES[i]?.eyebrow ?? ""}
                />
              </div>
              <div>
                <label
                  htmlFor={`slide-${i}-cta-label`}
                  className="mb-1.5 block text-sm font-medium text-espresso"
                >
                  Button label
                </label>
                <input
                  id={`slide-${i}-cta-label`}
                  value={slide.ctaLabel}
                  onChange={(e) => updateSlide(i, { ctaLabel: e.target.value })}
                  className={inputClass}
                  placeholder="Shop Now"
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor={`slide-${i}-headline`}
                  className="mb-1.5 block text-sm font-medium text-espresso"
                >
                  Headline
                </label>
                <input
                  id={`slide-${i}-headline`}
                  value={slide.headline}
                  onChange={(e) => updateSlide(i, { headline: e.target.value })}
                  className={inputClass}
                  placeholder={DEFAULT_HERO_SLIDES[i]?.headline ?? ""}
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor={`slide-${i}-subtext`}
                  className="mb-1.5 block text-sm font-medium text-espresso"
                >
                  Subtext
                </label>
                <textarea
                  id={`slide-${i}-subtext`}
                  value={slide.subtext}
                  onChange={(e) => updateSlide(i, { subtext: e.target.value })}
                  rows={2}
                  className={inputClass}
                  placeholder={DEFAULT_HERO_SLIDES[i]?.subtext ?? ""}
                />
              </div>
              <div>
                <label
                  htmlFor={`slide-${i}-cta-link`}
                  className="mb-1.5 block text-sm font-medium text-espresso"
                >
                  Button link
                </label>
                <input
                  id={`slide-${i}-cta-link`}
                  value={slide.ctaLink}
                  onChange={(e) => updateSlide(i, { ctaLink: e.target.value })}
                  className={inputClass}
                  placeholder="/shop"
                />
              </div>
              <div className="sm:col-span-2">
                <ImageUploadField
                  label="Slide image"
                  help="Landscape images work best (at least 1600 px wide)."
                  value={slide.image}
                  onChange={(url) => updateSlide(i, { image: url })}
                />
                <label
                  htmlFor={`slide-${i}-image-url`}
                  className="mb-1.5 mt-3 block text-sm font-medium text-espresso"
                >
                  Or paste an image URL
                </label>
                <input
                  id={`slide-${i}-image-url`}
                  type="url"
                  value={slide.image}
                  onChange={(e) => updateSlide(i, { image: e.target.value })}
                  className={inputClass}
                  placeholder="/images/hero.jpg or https://..."
                />
              </div>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <SaveButton busy={busy === "hero"} dirty onSave={saveSlides} />
          <SaveState saved={savedKey === "hero"} error={errorKey === "hero" ? errorMsg : ""} />
        </div>
        <p className="flex gap-2 text-xs text-espresso/50">
          <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
          Tip: if you leave all three slides empty, the homepage falls back to the
          built-in premium slides.
        </p>
      </Section>

      {/* Sale */}
      <Section
        title="Sale section"
        copy="The limited-time sale band on the homepage. It appears automatically when products have a discounted price."
      >
        <div>
          <label
            htmlFor="content-sale-title"
            className="mb-1.5 block text-sm font-medium text-espresso"
          >
            Sale title
          </label>
          <input
            id="content-sale-title"
            value={saleTitle}
            onChange={(e) => setSaleTitle(e.target.value)}
            className={inputClass}
            placeholder="Private Sale"
          />
        </div>
        <div>
          <label
            htmlFor="content-sale-subtitle"
            className="mb-1.5 block text-sm font-medium text-espresso"
          >
            Sale subtitle
          </label>
          <textarea
            id="content-sale-subtitle"
            value={saleSubtitle}
            onChange={(e) => setSaleSubtitle(e.target.value)}
            rows={2}
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="content-sale-ends"
            className="mb-1.5 block text-sm font-medium text-espresso"
          >
            Sale ends (countdown target)
          </label>
          <input
            id="content-sale-ends"
            type="datetime-local"
            value={saleEndsAt}
            onChange={(e) => setSaleEndsAt(e.target.value)}
            className={clsx(inputClass, "max-w-xs")}
          />
          <p className="mt-1.5 text-xs text-espresso/50">
            The homepage countdown ticks down to this date and time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SaveButton busy={busy === "sale"} dirty onSave={saveSale} />
          <SaveState saved={savedKey === "sale"} error={errorKey === "sale" ? errorMsg : ""} />
        </div>
      </Section>

      {/* Contact */}
      <Section
        title="Contact details"
        copy="Shown in the store footer and on the contact page. The WhatsApp number also powers order alerts and the WhatsApp order buttons."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="content-whatsapp"
              className="mb-1.5 block text-sm font-medium text-espresso"
            >
              WhatsApp owner number
            </label>
            <input
              id="content-whatsapp"
              inputMode="numeric"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
              className={inputClass}
              placeholder="923001234567"
            />
          </div>
          <div>
            <label
              htmlFor="content-phone"
              className="mb-1.5 block text-sm font-medium text-espresso"
            >
              Support phone
            </label>
            <input
              id="content-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              placeholder="0300 1234567"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="content-email"
              className="mb-1.5 block text-sm font-medium text-espresso"
            >
              Support email
            </label>
            <input
              id="content-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="support@tannandthread.pk"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SaveButton
            busy={busy === "contact"}
            dirty
            onSave={async () => {
              await save("whatsapp_owner_number", whatsapp.trim(), "contact");
              await save("support_phone", phone.trim(), "contact");
              await save("support_email", email.trim(), "contact");
            }}
          />
          <SaveState saved={savedKey === "contact"} error={errorKey === "contact" ? errorMsg : ""} />
        </div>
      </Section>
    </div>
  );
}
