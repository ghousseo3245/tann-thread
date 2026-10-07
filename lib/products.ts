// DEMO SEED DATA - replace with real catalog (Supabase) before launch.

import type { Category, JournalPost, Product, ProductVariant, Review } from "./types";

/* ------------------------------------------------------------------ */
/* Colors                                                              */
/* ------------------------------------------------------------------ */

const COLORS = {
  cognac: { name: "Cognac", hex: "#C17A3D", slug: "cognac", code: "COG" },
  espresso: { name: "Espresso", hex: "#2A1D11", slug: "espresso", code: "ESP" },
  black: { name: "Black", hex: "#1C1A17", slug: "black", code: "BLK" },
  tan: { name: "Tan", hex: "#D9A45B", slug: "tan", code: "TAN" },
  sand: { name: "Sand", hex: "#C9A24B", slug: "sand", code: "SND" },
} as const;

type ColorKey = keyof typeof COLORS;

/** Build the variant matrix for one product. `stocks` is one entry per
 *  color (no sizes) or per color x size combination when `sizes` is set.
 *  `xlUpcharge` adds a surcharge to XL variants (jackets). */
function buildVariants(
  slug: string,
  abbr: string,
  basePrice: number,
  colors: ColorKey[],
  sizes: string[] | undefined,
  stocks: number[],
  xlUpcharge = 0
): ProductVariant[] {
  const out: ProductVariant[] = [];
  colors.forEach((ck, ci) => {
    const c = COLORS[ck];
    const list: Array<string | undefined> = sizes ?? [undefined];
    list.forEach((s, si) => {
      const idx = sizes ? ci * sizes.length + si : ci;
      const sizeSlug = s ? s.replace(/\s+/g, "").toLowerCase() : undefined;
      out.push({
        id: sizeSlug ? `${slug}-${c.slug}-${sizeSlug}` : `${slug}-${c.slug}`,
        color: c.name,
        colorHex: c.hex,
        size: s,
        sku: sizeSlug
          ? `TT-${abbr}-${c.code}-${sizeSlug.toUpperCase()}`
          : `TT-${abbr}-${c.code}`,
        price: basePrice + (s === "XL" ? xlUpcharge : 0),
        stock: stocks[idx] ?? 8,
      });
    });
  });
  return out;
}

const JACKET_SIZES = ["S", "M", "L", "XL"];
const BELT_SIZES = ["30", "32", "34", "36", "38"];
const SHOE_SIZES = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];

const MONSOON_CARE =
  "Condition every three to four months with a neutral leather balm, and during monsoon season store the piece in a breathable cotton dust bag with silica gel so trapped humidity never reaches the leather.";

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export const categories: Category[] = [
  {
    slug: "bags",
    name: "Bags",
    tagline: "Carry It Well",
    image: "/images/products/lahore-weekender.jpg",
  },
  {
    slug: "wallets",
    name: "Wallets",
    tagline: "Small Goods, Big Character",
    image: "/images/products/heritage-bifold.jpg",
  },
  {
    slug: "jackets",
    name: "Jackets",
    tagline: "Built for the Road",
    image: "/images/products/highway-jacket.jpg",
  },
  {
    slug: "belts",
    name: "Belts",
    tagline: "The Finishing Touch",
    image: "/images/products/dress-belt.jpg",
  },
  {
    slug: "shoes",
    name: "Shoes",
    tagline: "Sole and Soul",
    image: "/images/products/oxford-captoe.jpg",
  },
];

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

export const products: Product[] = [
  {
    id: "lahore-weekender",
    slug: "lahore-weekender",
    name: "Lahore Weekender",
    category: "bags",
    tagline: "The bag that boards before you do.",
    description:
      "Cut from full-grain cowhide that only improves with every trip, the Lahore Weekender swallows a long weekend in style: two changes of clothes, a pair of shoes, a dopp kit and everything in between, all riding on a reinforced base that shrugs off airport floors.\n\nRolled leather handles, solid brass zippers and a detachable shoulder strap make it as comfortable on the shoulder as it looks sliding off the baggage carousel. Built in the spirit of old-world luggage, made for the modern traveller.",
    materials:
      "Full-grain cowhide, solid brass zippers, cotton canvas lining, reinforced leather base.",
    care: MONSOON_CARE,
    price: 24500,
    compareAtPrice: 28900,
    images: ["/images/products/lahore-weekender.jpg"],
    variants: buildVariants(
      "lahore-weekender",
      "WKD",
      24500,
      ["cognac", "espresso", "black"],
      undefined,
      [3, 8, 12]
    ),
    rating: 4.9,
    reviewCount: 212,
    featured: true,
    bestSeller: true,
    createdAt: "2025-11-14T09:30:00.000Z",
  },
  {
    id: "empress-tote",
    slug: "empress-tote",
    name: "Empress Tote",
    category: "bags",
    tagline: "Structure, softened.",
    description:
      "The Empress Tote holds its shape without holding you back. A structured silhouette in full-grain leather carries a 14 inch laptop, a makeup pouch and a shawl, while the reinforced base lets it stand upright on any surface.\n\nDouble-rolled shoulder straps are saddle-stitched to take daily weight without stretching, and the interior slip pockets keep small essentials from vanishing. Equally at home in a boardroom and at a weekend bazaar.",
    materials:
      "Full-grain cowhide, solid brass hardware, cotton twill lining, reinforced leather base.",
    care: MONSOON_CARE,
    price: 18900,
    images: ["/images/products/empress-tote.jpg"],
    variants: buildVariants(
      "empress-tote",
      "TTE",
      18900,
      ["cognac", "espresso", "tan"],
      undefined,
      [15, 10, 6]
    ),
    rating: 4.8,
    reviewCount: 164,
    bestSeller: true,
    createdAt: "2025-12-02T11:00:00.000Z",
  },
  {
    id: "saddler-messenger",
    slug: "saddler-messenger",
    name: "Saddler Messenger",
    category: "bags",
    tagline: "Your daily carry, perfected.",
    description:
      "A messenger that means business. The flap closes with two solid brass buckles, the shoulder strap adjusts with a single pull, and a padded sleeve keeps a laptop safe through Karachi traffic.\n\nThe espresso full-grain leather develops a rich sheen where your hands touch it most, so after a year of commutes it looks unmistakably yours. Understated on the outside, ruthlessly organized inside.",
    materials:
      "Full-grain cowhide, solid brass buckles, padded laptop sleeve, cotton twill lining.",
    care: MONSOON_CARE,
    price: 16400,
    images: ["/images/products/saddler-messenger.jpg"],
    variants: buildVariants(
      "saddler-messenger",
      "MSG",
      16400,
      ["espresso", "black", "cognac"],
      undefined,
      [9, 14, 7]
    ),
    rating: 4.6,
    reviewCount: 87,
    createdAt: "2026-01-20T10:00:00.000Z",
  },
  {
    id: "heritage-bifold",
    slug: "heritage-bifold",
    name: "Heritage Bifold",
    category: "wallets",
    tagline: "Slim where it counts.",
    description:
      "Eight card slots, two currency compartments and nothing you do not need. The Heritage Bifold is cut from a single hide of full-grain leather so the grain flows uninterrupted from panel to panel, and the edges are burnished by hand until they shine.\n\nCard slots start snug and break in to a perfect grip within two weeks. It sits flat in a trouser pocket and ages into a deep, personal patina that no synthetic wallet can imitate.",
    materials:
      "Full-grain cowhide, hand-burnished edges, waxed linen thread stitching.",
    care:
      "Wipe with a dry cloth and condition lightly twice a year. During monsoon months, keep the wallet in a dry drawer rather than a damp pocket or bag.",
    price: 6200,
    images: ["/images/products/heritage-bifold.jpg"],
    variants: buildVariants(
      "heritage-bifold",
      "BIF",
      6200,
      ["cognac", "espresso", "black"],
      undefined,
      [18, 11, 0]
    ),
    rating: 4.9,
    reviewCount: 240,
    bestSeller: true,
    createdAt: "2025-10-05T08:00:00.000Z",
  },
  {
    id: "slim-card-holder",
    slug: "slim-card-holder",
    name: "Slim Card Holder",
    category: "wallets",
    tagline: "Six cards, zero bulk.",
    description:
      "For those who have left the bulky wallet behind. The Slim Card Holder carries six cards and a few folded notes in a profile thinner than your phone.\n\nCut from vegetable-tanned full-grain leather with a single center pocket, it slips into a shirt pocket or the front pocket of jeans and disappears. The tan finish darkens beautifully with handling.",
    materials:
      "Vegetable-tanned full-grain cowhide, waxed linen thread stitching.",
    care:
      "Condition lightly once or twice a year. In humid months, let it air out overnight rather than leaving it in a closed pocket.",
    price: 3800,
    images: ["/images/products/slim-card-holder.jpg"],
    variants: buildVariants(
      "slim-card-holder",
      "SLM",
      3800,
      ["tan", "cognac", "espresso"],
      undefined,
      [6, 2, 10]
    ),
    rating: 4.5,
    reviewCount: 96,
    createdAt: "2026-02-11T09:00:00.000Z",
  },
  {
    id: "traveller-long-wallet",
    slug: "traveller-long-wallet",
    name: "Traveller Long Wallet",
    category: "wallets",
    tagline: "Room for the journey.",
    description:
      "Passports, boarding passes, two currencies and twelve cards, all in one zip-around home. The Traveller Long Wallet is the document wallet for people who cross borders often.\n\nA full-length zip keeps everything secure, while the espresso full-grain leather shrugs off the scuffs of overhead bins and security trays. Opens flat for easy access at check-in counters.",
    materials:
      "Full-grain cowhide, solid brass zipper, cotton twill lining.",
    care:
      "Condition every four months and keep the zipper teeth clean with a dry brush. Store away from damp luggage during monsoon travel.",
    price: 8500,
    images: ["/images/products/traveller-long-wallet.jpg"],
    variants: buildVariants(
      "traveller-long-wallet",
      "TRW",
      8500,
      ["espresso", "cognac", "black"],
      undefined,
      [8, 13, 5]
    ),
    rating: 4.6,
    reviewCount: 73,
    createdAt: "2026-03-04T10:30:00.000Z",
  },
  {
    id: "highway-jacket",
    slug: "highway-jacket",
    name: "Highway Jacket",
    category: "jackets",
    tagline: "Asphalt-ready attitude.",
    description:
      "An asymmetric-zip biker cut from thick full-grain leather with quilted shoulder panels and a snap lapel that stays put at speed. The Highway Jacket is built for the ride, whether that means the Motorway or Main Boulevard.\n\nA quilted satin lining slides over shirts easily, and the cut is roomy through the shoulders without billowing. It breaks in within a few weeks of wear and then fits like it was cut for you.",
    materials:
      "Full-grain cowhide, quilted satin lining, YKK zippers, snap fasteners.",
    care:
      "Wipe down after rain and hang on a wide hanger to dry at room temperature, never near a heater. Condition once a year; in monsoon season, air it out weekly to prevent mustiness.",
    price: 34000,
    compareAtPrice: 39000,
    images: ["/images/products/highway-jacket.jpg"],
    variants: buildVariants(
      "highway-jacket",
      "HWY",
      34000,
      ["espresso", "black"],
      JACKET_SIZES,
      [7, 10, 12, 5, 6, 9, 11, 4],
      1500
    ),
    rating: 4.8,
    reviewCount: 118,
    featured: true,
    createdAt: "2025-09-18T08:00:00.000Z",
  },
  {
    id: "aviator-bomber",
    slug: "aviator-bomber",
    name: "Aviator Bomber",
    category: "jackets",
    tagline: "A classic, re-cut.",
    description:
      "The bomber, done properly. Full-grain cognac leather with ribbed collar, cuffs and hem, a two-way front zip and two flap pockets. The silhouette is clean and slightly cropped, the way the original was meant to be.\n\nSoft from the first wear thanks to a lighter-weight hide, it layers over a sweater in winter and works open over a tee in spring. A jacket you will reach for daily.",
    materials:
      "Full-grain cowhide, ribbed knit collar and cuffs, satin lining, YKK zipper.",
    care:
      "Brush off dust with a soft cloth and condition once a year. During monsoon, store on a wide hanger in a ventilated wardrobe with space around it.",
    price: 29500,
    images: ["/images/products/aviator-bomber.jpg"],
    variants: buildVariants(
      "aviator-bomber",
      "AVB",
      29500,
      ["cognac", "espresso"],
      JACKET_SIZES,
      [8, 6, 10, 4, 5, 7, 2, 6],
      1500
    ),
    rating: 4.7,
    reviewCount: 84,
    createdAt: "2026-01-08T09:00:00.000Z",
  },
  {
    id: "cafe-racer",
    slug: "cafe-racer",
    name: "Cafe Racer",
    category: "jackets",
    tagline: "Minimal lines, maximum presence.",
    description:
      "No lapels, no fuss. The Cafe Racer strips the leather jacket to its essence: a snap-button stand collar, a clean front zip and a tailored body in jet-black full-grain leather.\n\nIt is the sharpest jacket we make, cut close through the torso with enough room to move. Wear it over a white shirt and dark denim and you are done for the evening.",
    materials:
      "Full-grain cowhide, satin lining, snap-button collar, YKK zipper.",
    care:
      "Wipe clean and condition once a year. Black leather shows salt marks after rain, so dry it promptly and keep it aired during humid months.",
    price: 32000,
    images: ["/images/products/cafe-racer.jpg"],
    variants: buildVariants(
      "cafe-racer",
      "CFR",
      32000,
      ["black", "espresso"],
      JACKET_SIZES,
      [4, 7, 6, 9, 5, 8, 3, 6],
      1500
    ),
    rating: 4.4,
    reviewCount: 31,
    isNew: true,
    createdAt: "2026-06-22T10:00:00.000Z",
  },
  {
    id: "dress-belt",
    slug: "dress-belt",
    name: "Dress Belt",
    category: "belts",
    tagline: "The quiet closer.",
    description:
      "A slim, polished dress belt that finishes a suit without shouting. Full-grain leather with a clean edge finish and a classic polished buckle.\n\nCut from the same hides as our wallets, it holds its shape at the waist and develops a subtle shine along the edges with wear. The finishing touch your formal wardrobe was missing.",
    materials:
      "Full-grain cowhide, polished brass buckle, hand-finished edges.",
    care:
      "Hang or roll loosely when not in use and condition once a year. Keep away from damp wardrobes during monsoon season.",
    price: 4200,
    images: ["/images/products/dress-belt.jpg"],
    variants: buildVariants(
      "dress-belt",
      "DRS",
      4200,
      ["espresso", "black"],
      BELT_SIZES,
      [12, 15, 18, 14, 10, 9, 13, 16, 11, 8]
    ),
    rating: 4.7,
    reviewCount: 145,
    createdAt: "2025-11-30T09:00:00.000Z",
  },
  {
    id: "harness-belt",
    slug: "harness-belt",
    name: "Harness Belt",
    category: "belts",
    tagline: "Everyday, elevated.",
    description:
      "A rugged casual belt with a brass roller buckle, made to live in denim. The cognac full-grain leather is left with a natural finish that scars, darkens and tells your story.\n\nOne solid strap, no lining to peel, no coating to crack. It will outlast the jeans you wear it with.",
    materials:
      "Full-grain cowhide, solid brass roller buckle.",
    care:
      "Wipe clean and condition occasionally. A little rain only adds character, but let it dry naturally away from direct heat.",
    price: 3600,
    images: ["/images/products/harness-belt.jpg"],
    variants: buildVariants(
      "harness-belt",
      "HRN",
      3600,
      ["cognac", "tan"],
      BELT_SIZES,
      [8, 11, 9, 7, 5, 6, 9, 8, 6, 4]
    ),
    rating: 4.5,
    reviewCount: 68,
    createdAt: "2026-02-25T10:00:00.000Z",
  },
  {
    id: "braided-belt",
    slug: "braided-belt",
    name: "Braided Belt",
    category: "belts",
    tagline: "Woven to flex.",
    description:
      "Hand-braided from strips of cognac full-grain leather, this belt stretches to fit any waist between sizes and breathes in summer heat. No holes, no fuss: the buckle prong slips through the weave anywhere.\n\nEach belt is braided by hand, so no two are exactly alike. A casual classic with real craft behind it.",
    materials:
      "Hand-braided full-grain cowhide strips, solid brass buckle.",
    care:
      "Lay flat to store and condition lightly once a year. Keep dry during monsoon months so the weave does not trap moisture.",
    price: 4800,
    images: ["/images/products/braided-belt.jpg"],
    variants: buildVariants(
      "braided-belt",
      "BRD",
      4800,
      ["cognac", "espresso"],
      BELT_SIZES,
      [5, 8, 7, 6, 4, 9, 11, 8, 7, 5]
    ),
    rating: 4.6,
    reviewCount: 29,
    isNew: true,
    createdAt: "2026-07-15T09:00:00.000Z",
  },
  {
    id: "oxford-captoe",
    slug: "oxford-captoe",
    name: "Oxford Cap Toe",
    category: "shoes",
    tagline: "Boardroom armor.",
    description:
      "A proper cap-toe oxford in espresso full-grain leather, Goodyear-welted for resoling and burnished by hand at the toe. The last is cut for Pakistani feet: a touch more room across the forefoot without looking bulky.\n\nIt takes a mirror shine at the cap, creases elegantly at the vamp and only gets more comfortable with wear. The shoe you wear when it matters.",
    materials:
      "Full-grain calfskin upper, leather sole, Goodyear welt, stacked leather heel.",
    care:
      "Use cedar shoe trees, polish regularly and rotate with another pair. In monsoon season, dry wet shoes at room temperature and never wear them two days running.",
    price: 21000,
    images: ["/images/products/oxford-captoe.jpg"],
    variants: buildVariants(
      "oxford-captoe",
      "OXF",
      21000,
      ["espresso", "black"],
      SHOE_SIZES,
      [6, 8, 10, 3, 9, 7, 8, 6, 9, 11, 7, 5]
    ),
    rating: 4.9,
    reviewCount: 176,
    bestSeller: true,
    createdAt: "2025-10-28T08:00:00.000Z",
  },
  {
    id: "desert-chukka",
    slug: "desert-chukka",
    name: "Desert Chukka",
    category: "shoes",
    tagline: "From dunes to dinners.",
    description:
      "The chukka boot is the most versatile shoe a man can own, and ours is cut from soft cognac full-grain leather with a cushioned crepe sole. Two eyelets, a clean round toe, nothing extra.\n\nDress it up with chinos, dress it down with jeans. The crepe sole stays quiet on marble floors and grips well on wet pavement.",
    materials:
      "Full-grain cowhide upper, natural crepe sole, leather insole.",
    care:
      "Brush after each wear and use shoe trees. Crepe soles and monsoon puddles do not mix, so save these for dry days in the rainy season.",
    price: 19500,
    images: ["/images/products/desert-chukka.jpg"],
    variants: buildVariants(
      "desert-chukka",
      "CHK",
      19500,
      ["cognac", "sand"],
      SHOE_SIZES,
      [7, 2, 9, 11, 8, 6, 9, 8, 6, 10, 7, 5]
    ),
    rating: 4.7,
    reviewCount: 92,
    featured: true,
    createdAt: "2026-04-12T09:00:00.000Z",
  },
  {
    id: "penny-loafer",
    slug: "penny-loafer",
    name: "Penny Loafer",
    category: "shoes",
    tagline: "Slip on, stand out.",
    description:
      "A classic penny loafer with a hand-sewn saddle strap and apron toe, cut from supple cognac full-grain leather. No laces, no buckles, just slip on and go.\n\nThe unlined construction molds to your foot within days, and the leather sole breaks in to your stride. Equally sharp with a suit or rolled chinos.",
    materials:
      "Full-grain cowhide upper, leather sole, hand-sewn apron toe.",
    care:
      "Use shoe trees and polish lightly to protect the finish. Avoid wearing in heavy rain, and let them rest a day between wears.",
    price: 17800,
    compareAtPrice: 20500,
    images: ["/images/products/penny-loafer.jpg"],
    variants: buildVariants(
      "penny-loafer",
      "LOF",
      17800,
      ["cognac", "espresso"],
      SHOE_SIZES,
      [10, 8, 12, 9, 7, 6, 8, 9, 7, 11, 6, 5]
    ),
    rating: 4.6,
    reviewCount: 58,
    createdAt: "2026-05-19T10:00:00.000Z",
  },
];

/* ------------------------------------------------------------------ */
/* Seed reviews                                                        */
/* ------------------------------------------------------------------ */

export const seedReviews: Review[] = [
  {
    id: "r1",
    productSlug: "lahore-weekender",
    author: "Ahmed Raza",
    rating: 5,
    title: "Worth every rupee",
    body: "Flew Karachi to Lahore with it packed full and it still looks sharp. The zippers feel like they belong on luggage costing three times more. You can smell the leather the moment you open the box.",
    date: "2026-01-19T14:20:00.000Z",
    verified: true,
  },
  {
    id: "r2",
    productSlug: "lahore-weekender",
    author: "Sana Iqbal",
    rating: 5,
    title: "Gifted to my husband",
    body: "Bought this for my husband's birthday and he has used it on every trip since. The stitching is immaculate and the cognac color has deepened beautifully after two months.",
    date: "2025-12-08T11:05:00.000Z",
    verified: true,
  },
  {
    id: "r3",
    productSlug: "lahore-weekender",
    author: "Bilal Sheikh",
    rating: 4,
    title: "Great bag, heavy when full",
    body: "Excellent craftsmanship and it turns heads at the airport. Only note: it is real leather, so packed full it has some weight to it. Use the shoulder strap and you are fine.",
    date: "2026-03-27T16:45:00.000Z",
    verified: true,
  },
  {
    id: "r4",
    productSlug: "heritage-bifold",
    author: "Fatima Khan",
    rating: 5,
    title: "Bought a second one",
    body: "My first bifold survived a full year of daily use and looks better than day one. Bought another in espresso for my father. The card slots were tight at first and broke in perfectly.",
    date: "2026-02-14T09:30:00.000Z",
    verified: true,
  },
  {
    id: "r5",
    productSlug: "heritage-bifold",
    author: "Usman Tariq",
    rating: 5,
    title: "The smell says it all",
    body: "Opened the box in my office in Islamabad and three colleagues asked where I got it. Genuine full-grain smell, clean edges, and it sits slim in the pocket.",
    date: "2025-11-30T13:15:00.000Z",
    verified: true,
  },
  {
    id: "r6",
    productSlug: "heritage-bifold",
    author: "Ayesha Malik",
    rating: 3,
    title: "Good, but size up your expectations",
    body: "Quality leather and solid stitching, no doubt. Just know it is a classic bifold, so if you carry lots of receipts it gets thick. Delivery to Karachi took five days instead of three.",
    date: "2026-04-02T17:00:00.000Z",
    verified: true,
  },
  {
    id: "r7",
    productSlug: "oxford-captoe",
    author: "Hamza Farooq",
    rating: 5,
    title: "Best shoes I have owned",
    body: "Wore them to a wedding in Lahore and stood for six hours without pain. The leather creases elegantly and the polish takes a shine like nothing I have bought locally.",
    date: "2026-01-05T19:25:00.000Z",
    verified: true,
  },
  {
    id: "r8",
    productSlug: "oxford-captoe",
    author: "Omar Qureshi",
    rating: 5,
    title: "Office essential",
    body: "Three months of daily office wear and the soles are holding up well. The espresso shade works with navy and charcoal. Sizing runs true.",
    date: "2025-12-19T08:40:00.000Z",
    verified: true,
  },
  {
    id: "r9",
    productSlug: "highway-jacket",
    author: "Danish Ali",
    rating: 5,
    title: "Built like armor",
    body: "Rode from Islamabad to Murree in it and the wind barely got through. The leather is thick but breaks in fast. Zippers are heavy duty and the fit is spot on for a medium.",
    date: "2026-03-11T15:10:00.000Z",
    verified: true,
  },
  {
    id: "r10",
    productSlug: "highway-jacket",
    author: "Mahnoor Butt",
    rating: 4,
    title: "Bought for my brother",
    body: "He loves the look and the weight of it. Only wish there were more color options in his size. Delivery was quick and the packaging felt premium.",
    date: "2026-02-02T12:00:00.000Z",
    verified: true,
  },
  {
    id: "r11",
    productSlug: "empress-tote",
    author: "Zainab Ahmed",
    rating: 5,
    title: "Carries my whole life",
    body: "Fits my laptop, makeup pouch, and a shawl with room to spare. The straps have not stretched after four months of daily use, and the tote keeps its shape.",
    date: "2026-05-06T10:20:00.000Z",
    verified: true,
  },
  {
    id: "r12",
    productSlug: "empress-tote",
    author: "Hira Shahid",
    rating: 5,
    title: "Elegant and sturdy",
    body: "Took it on a trip to Karachi and it handled everything. The cognac color gets compliments everywhere. The base is reinforced so it stands on its own.",
    date: "2026-06-18T18:35:00.000Z",
    verified: true,
  },
  {
    id: "r13",
    productSlug: "desert-chukka",
    author: "Ali Hassan",
    rating: 4,
    title: "Comfortable from day one",
    body: "Wore them out of the box for a full day in Peshawar and had zero blisters. The finish picks up dust but brushes clean easily.",
    date: "2026-05-29T11:50:00.000Z",
    verified: true,
  },
  {
    id: "r14",
    productSlug: "desert-chukka",
    author: "Ahmed Raza",
    rating: 5,
    title: "Second pair",
    body: "Liked my first pair so much I got another in sand. The crepe sole is quiet on marble floors and grips well. True to size.",
    date: "2026-07-09T14:05:00.000Z",
    verified: true,
  },
];

/* ------------------------------------------------------------------ */
/* Journal                                                             */
/* ------------------------------------------------------------------ */

export const journalPosts: JournalPost[] = [
  {
    slug: "how-to-spot-full-grain-leather",
    title: "How to Spot Full-Grain Leather",
    excerpt:
      "Not all leather is created equal. Here is how to tell the real thing from the rest before you spend a rupee.",
    image: "/images/craft.jpg",
    date: "2026-04-20T09:00:00.000Z",
    readMinutes: 6,
    body: [
      "Walk into any market and you will find bags labeled genuine leather at prices that seem too good to be true. They usually are. Genuine leather is actually one of the lowest grades, made from the leftover layers of the hide. What you want is full-grain: the top layer, with the natural grain intact.",
      "Start with the surface. Full-grain leather shows natural variation: pores, tiny creases, the occasional healed mark. If the surface looks perfectly uniform, like plastic with a printed pattern, it has been sanded down and embossed. Real grain is imperfect, and that is the point.",
      "Next, trust your nose. Full-grain leather smells rich and organic, like a saddlery. Bonded or heavily coated leather smells of chemicals or nothing at all. No amount of marketing can fake that smell.",
      "Check the edges. On a well-made piece, the edges are burnished smooth and show the same color through the cross-section. On cheap leather, you will see a foam or fabric core sandwiched between thin coated layers. That sandwich is the first thing to peel.",
      "Press your thumbnail into an unseen corner. Full-grain leather wrinkles and then slowly relaxes back. Coated splits and synthetics either stay dented or spring back unnaturally. It is a small test that tells you a lot about how the piece will age.",
      "Finally, look at the price with clear eyes. A full hide costs real money before a single stitch is made. If a full-grain bag sells for less than the raw material costs, something in the story does not add up. Buy less often, buy better, and let the leather prove itself over years.",
    ],
    relatedSlugs: ["heritage-bifold", "lahore-weekender"],
  },
  {
    slug: "caring-for-leather-in-monsoon-season",
    title: "Caring for Leather in Monsoon Season",
    excerpt:
      "Humidity is leather's quiet enemy. A few simple habits will carry your jackets and shoes through the rains untouched.",
    image: "/images/hero.jpg",
    date: "2026-07-02T09:00:00.000Z",
    readMinutes: 5,
    body: [
      "Every July, the same thing happens: beautiful leather goods come out of storage smelling musty, spotted with mildew, or stiff from damp. Leather is skin, and it reacts to humidity the way skin does. The good news is that a little attention goes a long way.",
      "The first rule is airflow. Never store leather in plastic bags or sealed boxes during the monsoon. Use breathable cotton dust bags, leave wardrobe doors slightly ajar, and give jackets space on the rail instead of packing them shoulder to shoulder.",
      "Silica gel is your best friend. Toss a few sachets into your shoe cabinet, your bag shelf, and the pockets of stored jackets. They are cheap, rechargeable in the sun, and they quietly absorb the moisture that feeds mildew.",
      "If something does get wet, resist the urge to hurry it. Dry leather at room temperature, away from heaters and direct sunlight, stuffed with newspaper to hold its shape. Heat dries the surface fast and cracks it; patience dries it evenly.",
      "Condition before the season starts. A light coat of neutral leather balm in June gives the leather a moisture barrier that repels light rain and keeps the fibers supple. Think of it as sunscreen for your jacket.",
      "And rotate your shoes. Wearing the same pair two days running in humid weather never lets the lining dry out. Give each pair a full day of rest with cedar trees inside, and they will serve you for years instead of seasons.",
    ],
    relatedSlugs: ["highway-jacket", "desert-chukka"],
  },
  {
    slug: "anatomy-of-a-well-made-wallet",
    title: "The Anatomy of a Well-Made Wallet",
    excerpt:
      "Edges, stitching, lining, leather. What separates a wallet that lasts a decade from one that lasts a year.",
    image: "/images/products/heritage-bifold.jpg",
    date: "2026-08-15T09:00:00.000Z",
    readMinutes: 4,
    body: [
      "A wallet is the most handled object most of us own. It lives in a pocket, gets sat on, and is opened dozens of times a day. That kind of life exposes every shortcut, which is why wallet construction is the purest test of a leather maker.",
      "Start at the edges. A well-made wallet has edges that are beveled, dyed, and burnished until they are smooth and glossy. Raw or painted-over edges are the first thing to fray, and once they go, the whole wallet follows.",
      "Look at the stitching. You want a consistent stitch length, straight lines, and thread that sits in a groove rather than riding on the surface. Saddle stitching, done by hand with two needles, will not unravel if one stitch breaks. Machine lockstitch will.",
      "Feel the card slots. They should grip a card firmly when new and relax just enough with use. Slots cut from thin, loose leather stretch out and lose cards within months. Full-grain leather, cut to the right thickness, holds its shape for years.",
      "Finally, consider the leather itself. A wallet does not need thick, armor-grade hides. It needs the right weight in the right places: firm enough for structure, supple enough to fold without cracking at the spine. That balance is the quiet mark of a maker who knows the craft.",
    ],
    relatedSlugs: ["heritage-bifold", "slim-card-holder"],
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, n = 4): Product[] {
  const sameCategory = products.filter(
    (p) => p.category === product.category && p.slug !== product.slug
  );
  const others = products.filter((p) => p.category !== product.category);
  return [...sameCategory, ...others].slice(0, n);
}

export type ProductQuery = {
  q?: string;
  category?: string;
  maxPrice?: number;
  colors?: string[];
  inStock?: boolean;
  sort?: "featured" | "price-asc" | "price-desc" | "rating" | "newest";
};

export function queryProducts(opts: ProductQuery): Product[] {
  const { q, category, maxPrice, colors, inStock, sort } = opts;
  let list = [...products];
  if (q) {
    const needle = q.toLowerCase();
    list = list.filter((p) =>
      [p.name, p.tagline, p.description, p.category]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }
  if (category) {
    list = list.filter((p) => p.category === category);
  }
  if (maxPrice !== undefined) {
    list = list.filter((p) => p.price <= maxPrice);
  }
  if (colors && colors.length > 0) {
    list = list.filter((p) => p.variants.some((v) => colors.includes(v.color)));
  }
  if (inStock) {
    list = list.filter((p) => p.variants.some((v) => v.stock > 0));
  }
  switch (sort) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      list.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "featured":
    default:
      list.sort(
        (a, b) =>
          Number(b.featured ?? false) - Number(a.featured ?? false) ||
          Number(b.bestSeller ?? false) - Number(a.bestSeller ?? false)
      );
      break;
  }
  return list;
}

export function getJournalPost(slug: string): JournalPost | undefined {
  return journalPosts.find((p) => p.slug === slug);
}

export function formatPKR(n: number): string {
  return "Rs " + n.toLocaleString("en-PK");
}
