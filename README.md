# Tann & Thread

A modern luxury ecommerce storefront for handcrafted leather goods (bags, wallets, jackets, belts, shoes), built with Next.js 14 and Supabase, with cash-on-delivery checkout for Pakistan.

Phase 1 ships the storefront, cart, and COD checkout against demo data, plus a production-ready Supabase schema. Phase 2 adds accounts, live payments, and email (see "What Phase 2 adds" below).

## Prerequisites

- Node.js 18 or newer
- npm (ships with Node.js)

## Quickstart

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Scripts

| Script          | Command     | What it does                              |
|-----------------|-------------|-------------------------------------------|
| `npm run dev`   | `next dev`  | Start the dev server at localhost:3000    |
| `npm run build` | `next build`| Production build (also runs type checks)  |
| `npm run start` | `next start`| Serve the production build                |
| `npm run lint`  | `next lint` | Run ESLint over the project               |

## Environment setup

1. Copy the example file:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in the Phase 1 Supabase values (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and ideally `SUPABASE_SERVICE_ROLE_KEY`). Each variable in `.env.example` is commented with where to get it and which phase uses it.
3. Restart `npm run dev` after changing env values.

Stripe and Resend variables are Phase 2 only. Leaving the Stripe keys empty keeps card checkout in a clearly-labeled test scaffold mode; COD checkout works without them.

## Project structure

```
tann-thread/
├── app/                    # Next.js 14 App Router pages, layouts, API routes
│   ├── layout.tsx          # Root layout (fonts, metadata)
│   ├── page.tsx            # Homepage
│   └── globals.css         # Tailwind directives and global styles
├── components/             # Reusable UI components (header, cards, cart, ...)
├── lib/                    # Shared code
│   ├── types.ts            # TypeScript types for products, orders, etc.
│   └── products.ts         # DEMO seed data (replace with Supabase queries)
├── public/images/products/ # Product imagery (placeholder assets in Phase 1)
├── site.config.ts          # Brand, contact details, shipping fees, promo codes
├── supabase/migrations/    # Database schema, applied in the Supabase SQL editor
├── .env.example            # Documented environment variables
└── README.md
```

## Supabase setup

1. Create a free project at https://supabase.com/dashboard.
2. Open the project's SQL editor, paste the full contents of `supabase/migrations/20261007000001_init.sql`, and run it. The script creates all tables, indexes, RLS policies, and seed data, and is safe to re-run.
3. In Project Settings > API, copy the Project URL and anon key into your `.env.local` (see "Environment setup").

About Row Level Security: RLS is enabled on every table. The catalog (`categories`, `products`, `product_variants`), active coupons, and `settings` are publicly readable; anyone can submit reviews and newsletter signups. Customer, order, and order-item rows are owner-scoped via Supabase Auth, so COD orders must be created from a server route using `SUPABASE_SERVICE_ROLE_KEY`, never directly from the browser.

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, choose "Add New Project" and import the repository (the Next.js framework preset is detected automatically).
3. In Project Settings > Environment Variables, add at minimum `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (plus `SUPABASE_SERVICE_ROLE_KEY` for order creation).
4. Deploy. Every push to the main branch redeploys automatically.

## Replacing demo data

Before launch, swap out the Phase 1 placeholders:

- **`lib/products.ts` is DEMO seed data.** Replace its exports with real Supabase queries using the tables created by the migration (`categories`, `products`, `product_variants`, `reviews`, `coupons`). The migration's seed categories (bags, wallets, jackets, belts, shoes) and the `WELCOME10` coupon already match the demo content, so the queries can slot in directly.
- **`public/images/products/`** holds placeholder product images. Replace them with real product photography, keeping the same filenames (or updating the references in the data layer).
- **`site.config.ts` contact placeholders.** Four values still start with `TODO:` and must be replaced with real business details before launch (the UI hides them until they are set):
  1. `contact.phone` ("TODO: store phone number")
  2. `contact.email` ("TODO: store email address")
  3. `contact.address` ("TODO: store street address")
  4. `contact.whatsapp` ("TODO: WhatsApp number, country code without +")

## What Phase 2 adds

- Supabase Auth with customer accounts (sign in, order history, saved addresses)
- Admin dashboard (orders, inventory, reviews moderation, coupons, settings)
- Resend transactional emails (order confirmations, shipping updates)
- Stripe live payments (card checkout; the test scaffold becomes real checkout)
- Loyalty program
- AI product search and chatbot
