// Central site configuration for Tann & Thread.
// Contact details are not yet known. Any value starting with "TODO:" must be
// replaced with real business details before launch. UI components hide
// TODO values automatically, so the storefront never shows a placeholder.

export const siteConfig = {
  brandName: "Tann & Thread",
  tagline: "Crafted for Those Who Appreciate Quality",
  currency: "PKR",
  currencySymbol: "Rs",
  contact: {
    // TODO: replace with the real store phone number before launch
    phone: "TODO: store phone number",
    // TODO: replace with the real store email address before launch
    email: "TODO: store email address",
    // TODO: replace with the real store street address before launch
    address: "TODO: store street address",
    // TODO: replace with the real WhatsApp number (country code, no +) before launch
    whatsapp: "TODO: WhatsApp number, country code without +",
  },
  freeShippingThreshold: 15000,
  // Admin dashboard: a variant with stock at or below this is flagged low-stock.
  lowStockThreshold: 5,
  promoCodes: {
    // promo code -> percent off
    WELCOME10: 10,
  } as Record<string, number>,
  cities: [
    { name: "Karachi", fee: 250 },
    { name: "Lahore", fee: 250 },
    { name: "Islamabad", fee: 300 },
    { name: "Rawalpindi", fee: 300 },
    { name: "Faisalabad", fee: 350 },
    { name: "Multan", fee: 350 },
    { name: "Peshawar", fee: 400 },
    { name: "Quetta", fee: 450 },
    { name: "Hyderabad", fee: 350 },
    { name: "Sialkot", fee: 350 },
    { name: "Other", fee: 500 },
  ],
  announcementMessages: [
    "Complimentary shipping across Pakistan on orders over Rs 15,000",
    "Use code WELCOME10 for 10 percent off your first order",
    "Handcrafted from full-grain leather, built to age beautifully",
  ],
};

export type SiteConfig = typeof siteConfig;

/** True while a contact value is still an unfilled placeholder. */
export function isContactPlaceholder(value: string): boolean {
  return value.trim().startsWith("TODO:");
}
