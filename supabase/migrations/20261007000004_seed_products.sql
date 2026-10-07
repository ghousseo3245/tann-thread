-- Tann & Thread: seed the demo catalog into Supabase.
--
-- Inserts the 15 demo products (and their variants) from lib/products.ts
-- into the products / product_variants tables created by migration
-- 20261007000001. Run this in the Supabase SQL editor AFTER
-- 20261007000001_init.sql, 20261007000002_admin.sql and
-- 20261007000003_product_image.sql.
--
-- Fully IDEMPOTENT: products use ON CONFLICT (slug) DO NOTHING and
-- variants use ON CONFLICT (sku) DO NOTHING, so it is safe to run more
-- than once. Variant rows resolve their product_id with a subselect on
-- the product slug, so generated UUIDs are handled.

INSERT INTO products
  (slug, category_id, name, tagline, description, materials, care,
   price, compare_at_price, rating, review_count,
   featured, best_seller, is_new, active, image_url, created_at)
VALUES (
  'lahore-weekender',
  (SELECT id FROM categories WHERE slug = 'bags'),
  'Lahore Weekender',
  'The bag that boards before you do.',
  'Cut from full-grain cowhide that only improves with every trip, the Lahore Weekender swallows a long weekend in style: two changes of clothes, a pair of shoes, a dopp kit and everything in between, all riding on a reinforced base that shrugs off airport floors.

Rolled leather handles, solid brass zippers and a detachable shoulder strap make it as comfortable on the shoulder as it looks sliding off the baggage carousel. Built in the spirit of old-world luggage, made for the modern traveller.',
  'Full-grain cowhide, solid brass zippers, cotton canvas lining, reinforced leather base.',
  'Condition every three to four months with a neutral leather balm, and during monsoon season store the piece in a breathable cotton dust bag with silica gel so trapped humidity never reaches the leather.',
  24500,
  28900,
  4.9,
  212,
  TRUE,
  TRUE,
  FALSE,
  TRUE,
  '/images/products/lahore-weekender.jpg',
  '2025-11-14T09:30:00.000Z'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'lahore-weekender'),
  'Cognac',
  '#C17A3D',
  NULL,
  'TT-WKD-COG',
  24500,
  3
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'lahore-weekender'),
  'Espresso',
  '#2A1D11',
  NULL,
  'TT-WKD-ESP',
  24500,
  8
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'lahore-weekender'),
  'Black',
  '#1C1A17',
  NULL,
  'TT-WKD-BLK',
  24500,
  12
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products
  (slug, category_id, name, tagline, description, materials, care,
   price, compare_at_price, rating, review_count,
   featured, best_seller, is_new, active, image_url, created_at)
VALUES (
  'empress-tote',
  (SELECT id FROM categories WHERE slug = 'bags'),
  'Empress Tote',
  'Structure, softened.',
  'The Empress Tote holds its shape without holding you back. A structured silhouette in full-grain leather carries a 14 inch laptop, a makeup pouch and a shawl, while the reinforced base lets it stand upright on any surface.

Double-rolled shoulder straps are saddle-stitched to take daily weight without stretching, and the interior slip pockets keep small essentials from vanishing. Equally at home in a boardroom and at a weekend bazaar.',
  'Full-grain cowhide, solid brass hardware, cotton twill lining, reinforced leather base.',
  'Condition every three to four months with a neutral leather balm, and during monsoon season store the piece in a breathable cotton dust bag with silica gel so trapped humidity never reaches the leather.',
  18900,
  NULL,
  4.8,
  164,
  FALSE,
  TRUE,
  FALSE,
  TRUE,
  '/images/products/empress-tote.jpg',
  '2025-12-02T11:00:00.000Z'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'empress-tote'),
  'Cognac',
  '#C17A3D',
  NULL,
  'TT-TTE-COG',
  18900,
  15
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'empress-tote'),
  'Espresso',
  '#2A1D11',
  NULL,
  'TT-TTE-ESP',
  18900,
  10
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'empress-tote'),
  'Tan',
  '#D9A45B',
  NULL,
  'TT-TTE-TAN',
  18900,
  6
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products
  (slug, category_id, name, tagline, description, materials, care,
   price, compare_at_price, rating, review_count,
   featured, best_seller, is_new, active, image_url, created_at)
VALUES (
  'saddler-messenger',
  (SELECT id FROM categories WHERE slug = 'bags'),
  'Saddler Messenger',
  'Your daily carry, perfected.',
  'A messenger that means business. The flap closes with two solid brass buckles, the shoulder strap adjusts with a single pull, and a padded sleeve keeps a laptop safe through Karachi traffic.

The espresso full-grain leather develops a rich sheen where your hands touch it most, so after a year of commutes it looks unmistakably yours. Understated on the outside, ruthlessly organized inside.',
  'Full-grain cowhide, solid brass buckles, padded laptop sleeve, cotton twill lining.',
  'Condition every three to four months with a neutral leather balm, and during monsoon season store the piece in a breathable cotton dust bag with silica gel so trapped humidity never reaches the leather.',
  16400,
  NULL,
  4.6,
  87,
  FALSE,
  FALSE,
  FALSE,
  TRUE,
  '/images/products/saddler-messenger.jpg',
  '2026-01-20T10:00:00.000Z'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'saddler-messenger'),
  'Espresso',
  '#2A1D11',
  NULL,
  'TT-MSG-ESP',
  16400,
  9
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'saddler-messenger'),
  'Black',
  '#1C1A17',
  NULL,
  'TT-MSG-BLK',
  16400,
  14
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'saddler-messenger'),
  'Cognac',
  '#C17A3D',
  NULL,
  'TT-MSG-COG',
  16400,
  7
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products
  (slug, category_id, name, tagline, description, materials, care,
   price, compare_at_price, rating, review_count,
   featured, best_seller, is_new, active, image_url, created_at)
VALUES (
  'heritage-bifold',
  (SELECT id FROM categories WHERE slug = 'wallets'),
  'Heritage Bifold',
  'Slim where it counts.',
  'Eight card slots, two currency compartments and nothing you do not need. The Heritage Bifold is cut from a single hide of full-grain leather so the grain flows uninterrupted from panel to panel, and the edges are burnished by hand until they shine.

Card slots start snug and break in to a perfect grip within two weeks. It sits flat in a trouser pocket and ages into a deep, personal patina that no synthetic wallet can imitate.',
  'Full-grain cowhide, hand-burnished edges, waxed linen thread stitching.',
  'Wipe with a dry cloth and condition lightly twice a year. During monsoon months, keep the wallet in a dry drawer rather than a damp pocket or bag.',
  6200,
  NULL,
  4.9,
  240,
  FALSE,
  TRUE,
  FALSE,
  TRUE,
  '/images/products/heritage-bifold.jpg',
  '2025-10-05T08:00:00.000Z'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'heritage-bifold'),
  'Cognac',
  '#C17A3D',
  NULL,
  'TT-BIF-COG',
  6200,
  18
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'heritage-bifold'),
  'Espresso',
  '#2A1D11',
  NULL,
  'TT-BIF-ESP',
  6200,
  11
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'heritage-bifold'),
  'Black',
  '#1C1A17',
  NULL,
  'TT-BIF-BLK',
  6200,
  0
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products
  (slug, category_id, name, tagline, description, materials, care,
   price, compare_at_price, rating, review_count,
   featured, best_seller, is_new, active, image_url, created_at)
VALUES (
  'slim-card-holder',
  (SELECT id FROM categories WHERE slug = 'wallets'),
  'Slim Card Holder',
  'Six cards, zero bulk.',
  'For those who have left the bulky wallet behind. The Slim Card Holder carries six cards and a few folded notes in a profile thinner than your phone.

Cut from vegetable-tanned full-grain leather with a single center pocket, it slips into a shirt pocket or the front pocket of jeans and disappears. The tan finish darkens beautifully with handling.',
  'Vegetable-tanned full-grain cowhide, waxed linen thread stitching.',
  'Condition lightly once or twice a year. In humid months, let it air out overnight rather than leaving it in a closed pocket.',
  3800,
  NULL,
  4.5,
  96,
  FALSE,
  FALSE,
  FALSE,
  TRUE,
  '/images/products/slim-card-holder.jpg',
  '2026-02-11T09:00:00.000Z'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'slim-card-holder'),
  'Tan',
  '#D9A45B',
  NULL,
  'TT-SLM-TAN',
  3800,
  6
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'slim-card-holder'),
  'Cognac',
  '#C17A3D',
  NULL,
  'TT-SLM-COG',
  3800,
  2
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'slim-card-holder'),
  'Espresso',
  '#2A1D11',
  NULL,
  'TT-SLM-ESP',
  3800,
  10
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products
  (slug, category_id, name, tagline, description, materials, care,
   price, compare_at_price, rating, review_count,
   featured, best_seller, is_new, active, image_url, created_at)
VALUES (
  'traveller-long-wallet',
  (SELECT id FROM categories WHERE slug = 'wallets'),
  'Traveller Long Wallet',
  'Room for the journey.',
  'Passports, boarding passes, two currencies and twelve cards, all in one zip-around home. The Traveller Long Wallet is the document wallet for people who cross borders often.

A full-length zip keeps everything secure, while the espresso full-grain leather shrugs off the scuffs of overhead bins and security trays. Opens flat for easy access at check-in counters.',
  'Full-grain cowhide, solid brass zipper, cotton twill lining.',
  'Condition every four months and keep the zipper teeth clean with a dry brush. Store away from damp luggage during monsoon travel.',
  8500,
  NULL,
  4.6,
  73,
  FALSE,
  FALSE,
  FALSE,
  TRUE,
  '/images/products/traveller-long-wallet.jpg',
  '2026-03-04T10:30:00.000Z'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'traveller-long-wallet'),
  'Espresso',
  '#2A1D11',
  NULL,
  'TT-TRW-ESP',
  8500,
  8
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'traveller-long-wallet'),
  'Cognac',
  '#C17A3D',
  NULL,
  'TT-TRW-COG',
  8500,
  13
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'traveller-long-wallet'),
  'Black',
  '#1C1A17',
  NULL,
  'TT-TRW-BLK',
  8500,
  5
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products
  (slug, category_id, name, tagline, description, materials, care,
   price, compare_at_price, rating, review_count,
   featured, best_seller, is_new, active, image_url, created_at)
VALUES (
  'highway-jacket',
  (SELECT id FROM categories WHERE slug = 'jackets'),
  'Highway Jacket',
  'Asphalt-ready attitude.',
  'An asymmetric-zip biker cut from thick full-grain leather with quilted shoulder panels and a snap lapel that stays put at speed. The Highway Jacket is built for the ride, whether that means the Motorway or Main Boulevard.

A quilted satin lining slides over shirts easily, and the cut is roomy through the shoulders without billowing. It breaks in within a few weeks of wear and then fits like it was cut for you.',
  'Full-grain cowhide, quilted satin lining, YKK zippers, snap fasteners.',
  'Wipe down after rain and hang on a wide hanger to dry at room temperature, never near a heater. Condition once a year; in monsoon season, air it out weekly to prevent mustiness.',
  34000,
  39000,
  4.8,
  118,
  TRUE,
  FALSE,
  FALSE,
  TRUE,
  '/images/products/highway-jacket.jpg',
  '2025-09-18T08:00:00.000Z'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'highway-jacket'),
  'Espresso',
  '#2A1D11',
  'S',
  'TT-HWY-ESP-S',
  34000,
  7
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'highway-jacket'),
  'Espresso',
  '#2A1D11',
  'M',
  'TT-HWY-ESP-M',
  34000,
  10
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'highway-jacket'),
  'Espresso',
  '#2A1D11',
  'L',
  'TT-HWY-ESP-L',
  34000,
  12
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'highway-jacket'),
  'Espresso',
  '#2A1D11',
  'XL',
  'TT-HWY-ESP-XL',
  35500,
  5
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'highway-jacket'),
  'Black',
  '#1C1A17',
  'S',
  'TT-HWY-BLK-S',
  34000,
  6
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'highway-jacket'),
  'Black',
  '#1C1A17',
  'M',
  'TT-HWY-BLK-M',
  34000,
  9
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'highway-jacket'),
  'Black',
  '#1C1A17',
  'L',
  'TT-HWY-BLK-L',
  34000,
  11
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'highway-jacket'),
  'Black',
  '#1C1A17',
  'XL',
  'TT-HWY-BLK-XL',
  35500,
  4
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products
  (slug, category_id, name, tagline, description, materials, care,
   price, compare_at_price, rating, review_count,
   featured, best_seller, is_new, active, image_url, created_at)
VALUES (
  'aviator-bomber',
  (SELECT id FROM categories WHERE slug = 'jackets'),
  'Aviator Bomber',
  'A classic, re-cut.',
  'The bomber, done properly. Full-grain cognac leather with ribbed collar, cuffs and hem, a two-way front zip and two flap pockets. The silhouette is clean and slightly cropped, the way the original was meant to be.

Soft from the first wear thanks to a lighter-weight hide, it layers over a sweater in winter and works open over a tee in spring. A jacket you will reach for daily.',
  'Full-grain cowhide, ribbed knit collar and cuffs, satin lining, YKK zipper.',
  'Brush off dust with a soft cloth and condition once a year. During monsoon, store on a wide hanger in a ventilated wardrobe with space around it.',
  29500,
  NULL,
  4.7,
  84,
  FALSE,
  FALSE,
  FALSE,
  TRUE,
  '/images/products/aviator-bomber.jpg',
  '2026-01-08T09:00:00.000Z'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'aviator-bomber'),
  'Cognac',
  '#C17A3D',
  'S',
  'TT-AVB-COG-S',
  29500,
  8
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'aviator-bomber'),
  'Cognac',
  '#C17A3D',
  'M',
  'TT-AVB-COG-M',
  29500,
  6
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'aviator-bomber'),
  'Cognac',
  '#C17A3D',
  'L',
  'TT-AVB-COG-L',
  29500,
  10
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'aviator-bomber'),
  'Cognac',
  '#C17A3D',
  'XL',
  'TT-AVB-COG-XL',
  31000,
  4
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'aviator-bomber'),
  'Espresso',
  '#2A1D11',
  'S',
  'TT-AVB-ESP-S',
  29500,
  5
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'aviator-bomber'),
  'Espresso',
  '#2A1D11',
  'M',
  'TT-AVB-ESP-M',
  29500,
  7
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'aviator-bomber'),
  'Espresso',
  '#2A1D11',
  'L',
  'TT-AVB-ESP-L',
  29500,
  2
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'aviator-bomber'),
  'Espresso',
  '#2A1D11',
  'XL',
  'TT-AVB-ESP-XL',
  31000,
  6
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products
  (slug, category_id, name, tagline, description, materials, care,
   price, compare_at_price, rating, review_count,
   featured, best_seller, is_new, active, image_url, created_at)
VALUES (
  'cafe-racer',
  (SELECT id FROM categories WHERE slug = 'jackets'),
  'Cafe Racer',
  'Minimal lines, maximum presence.',
  'No lapels, no fuss. The Cafe Racer strips the leather jacket to its essence: a snap-button stand collar, a clean front zip and a tailored body in jet-black full-grain leather.

It is the sharpest jacket we make, cut close through the torso with enough room to move. Wear it over a white shirt and dark denim and you are done for the evening.',
  'Full-grain cowhide, satin lining, snap-button collar, YKK zipper.',
  'Wipe clean and condition once a year. Black leather shows salt marks after rain, so dry it promptly and keep it aired during humid months.',
  32000,
  NULL,
  4.4,
  31,
  FALSE,
  FALSE,
  TRUE,
  TRUE,
  '/images/products/cafe-racer.jpg',
  '2026-06-22T10:00:00.000Z'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'cafe-racer'),
  'Black',
  '#1C1A17',
  'S',
  'TT-CFR-BLK-S',
  32000,
  4
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'cafe-racer'),
  'Black',
  '#1C1A17',
  'M',
  'TT-CFR-BLK-M',
  32000,
  7
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'cafe-racer'),
  'Black',
  '#1C1A17',
  'L',
  'TT-CFR-BLK-L',
  32000,
  6
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'cafe-racer'),
  'Black',
  '#1C1A17',
  'XL',
  'TT-CFR-BLK-XL',
  33500,
  9
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'cafe-racer'),
  'Espresso',
  '#2A1D11',
  'S',
  'TT-CFR-ESP-S',
  32000,
  5
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'cafe-racer'),
  'Espresso',
  '#2A1D11',
  'M',
  'TT-CFR-ESP-M',
  32000,
  8
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'cafe-racer'),
  'Espresso',
  '#2A1D11',
  'L',
  'TT-CFR-ESP-L',
  32000,
  3
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'cafe-racer'),
  'Espresso',
  '#2A1D11',
  'XL',
  'TT-CFR-ESP-XL',
  33500,
  6
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products
  (slug, category_id, name, tagline, description, materials, care,
   price, compare_at_price, rating, review_count,
   featured, best_seller, is_new, active, image_url, created_at)
VALUES (
  'dress-belt',
  (SELECT id FROM categories WHERE slug = 'belts'),
  'Dress Belt',
  'The quiet closer.',
  'A slim, polished dress belt that finishes a suit without shouting. Full-grain leather with a clean edge finish and a classic polished buckle.

Cut from the same hides as our wallets, it holds its shape at the waist and develops a subtle shine along the edges with wear. The finishing touch your formal wardrobe was missing.',
  'Full-grain cowhide, polished brass buckle, hand-finished edges.',
  'Hang or roll loosely when not in use and condition once a year. Keep away from damp wardrobes during monsoon season.',
  4200,
  NULL,
  4.7,
  145,
  FALSE,
  FALSE,
  FALSE,
  TRUE,
  '/images/products/dress-belt.jpg',
  '2025-11-30T09:00:00.000Z'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'dress-belt'),
  'Espresso',
  '#2A1D11',
  '30',
  'TT-DRS-ESP-30',
  4200,
  12
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'dress-belt'),
  'Espresso',
  '#2A1D11',
  '32',
  'TT-DRS-ESP-32',
  4200,
  15
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'dress-belt'),
  'Espresso',
  '#2A1D11',
  '34',
  'TT-DRS-ESP-34',
  4200,
  18
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'dress-belt'),
  'Espresso',
  '#2A1D11',
  '36',
  'TT-DRS-ESP-36',
  4200,
  14
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'dress-belt'),
  'Espresso',
  '#2A1D11',
  '38',
  'TT-DRS-ESP-38',
  4200,
  10
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'dress-belt'),
  'Black',
  '#1C1A17',
  '30',
  'TT-DRS-BLK-30',
  4200,
  9
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'dress-belt'),
  'Black',
  '#1C1A17',
  '32',
  'TT-DRS-BLK-32',
  4200,
  13
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'dress-belt'),
  'Black',
  '#1C1A17',
  '34',
  'TT-DRS-BLK-34',
  4200,
  16
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'dress-belt'),
  'Black',
  '#1C1A17',
  '36',
  'TT-DRS-BLK-36',
  4200,
  11
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'dress-belt'),
  'Black',
  '#1C1A17',
  '38',
  'TT-DRS-BLK-38',
  4200,
  8
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products
  (slug, category_id, name, tagline, description, materials, care,
   price, compare_at_price, rating, review_count,
   featured, best_seller, is_new, active, image_url, created_at)
VALUES (
  'harness-belt',
  (SELECT id FROM categories WHERE slug = 'belts'),
  'Harness Belt',
  'Everyday, elevated.',
  'A rugged casual belt with a brass roller buckle, made to live in denim. The cognac full-grain leather is left with a natural finish that scars, darkens and tells your story.

One solid strap, no lining to peel, no coating to crack. It will outlast the jeans you wear it with.',
  'Full-grain cowhide, solid brass roller buckle.',
  'Wipe clean and condition occasionally. A little rain only adds character, but let it dry naturally away from direct heat.',
  3600,
  NULL,
  4.5,
  68,
  FALSE,
  FALSE,
  FALSE,
  TRUE,
  '/images/products/harness-belt.jpg',
  '2026-02-25T10:00:00.000Z'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'harness-belt'),
  'Cognac',
  '#C17A3D',
  '30',
  'TT-HRN-COG-30',
  3600,
  8
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'harness-belt'),
  'Cognac',
  '#C17A3D',
  '32',
  'TT-HRN-COG-32',
  3600,
  11
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'harness-belt'),
  'Cognac',
  '#C17A3D',
  '34',
  'TT-HRN-COG-34',
  3600,
  9
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'harness-belt'),
  'Cognac',
  '#C17A3D',
  '36',
  'TT-HRN-COG-36',
  3600,
  7
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'harness-belt'),
  'Cognac',
  '#C17A3D',
  '38',
  'TT-HRN-COG-38',
  3600,
  5
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'harness-belt'),
  'Tan',
  '#D9A45B',
  '30',
  'TT-HRN-TAN-30',
  3600,
  6
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'harness-belt'),
  'Tan',
  '#D9A45B',
  '32',
  'TT-HRN-TAN-32',
  3600,
  9
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'harness-belt'),
  'Tan',
  '#D9A45B',
  '34',
  'TT-HRN-TAN-34',
  3600,
  8
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'harness-belt'),
  'Tan',
  '#D9A45B',
  '36',
  'TT-HRN-TAN-36',
  3600,
  6
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'harness-belt'),
  'Tan',
  '#D9A45B',
  '38',
  'TT-HRN-TAN-38',
  3600,
  4
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products
  (slug, category_id, name, tagline, description, materials, care,
   price, compare_at_price, rating, review_count,
   featured, best_seller, is_new, active, image_url, created_at)
VALUES (
  'braided-belt',
  (SELECT id FROM categories WHERE slug = 'belts'),
  'Braided Belt',
  'Woven to flex.',
  'Hand-braided from strips of cognac full-grain leather, this belt stretches to fit any waist between sizes and breathes in summer heat. No holes, no fuss: the buckle prong slips through the weave anywhere.

Each belt is braided by hand, so no two are exactly alike. A casual classic with real craft behind it.',
  'Hand-braided full-grain cowhide strips, solid brass buckle.',
  'Lay flat to store and condition lightly once a year. Keep dry during monsoon months so the weave does not trap moisture.',
  4800,
  NULL,
  4.6,
  29,
  FALSE,
  FALSE,
  TRUE,
  TRUE,
  '/images/products/braided-belt.jpg',
  '2026-07-15T09:00:00.000Z'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'braided-belt'),
  'Cognac',
  '#C17A3D',
  '30',
  'TT-BRD-COG-30',
  4800,
  5
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'braided-belt'),
  'Cognac',
  '#C17A3D',
  '32',
  'TT-BRD-COG-32',
  4800,
  8
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'braided-belt'),
  'Cognac',
  '#C17A3D',
  '34',
  'TT-BRD-COG-34',
  4800,
  7
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'braided-belt'),
  'Cognac',
  '#C17A3D',
  '36',
  'TT-BRD-COG-36',
  4800,
  6
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'braided-belt'),
  'Cognac',
  '#C17A3D',
  '38',
  'TT-BRD-COG-38',
  4800,
  4
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'braided-belt'),
  'Espresso',
  '#2A1D11',
  '30',
  'TT-BRD-ESP-30',
  4800,
  9
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'braided-belt'),
  'Espresso',
  '#2A1D11',
  '32',
  'TT-BRD-ESP-32',
  4800,
  11
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'braided-belt'),
  'Espresso',
  '#2A1D11',
  '34',
  'TT-BRD-ESP-34',
  4800,
  8
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'braided-belt'),
  'Espresso',
  '#2A1D11',
  '36',
  'TT-BRD-ESP-36',
  4800,
  7
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'braided-belt'),
  'Espresso',
  '#2A1D11',
  '38',
  'TT-BRD-ESP-38',
  4800,
  5
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products
  (slug, category_id, name, tagline, description, materials, care,
   price, compare_at_price, rating, review_count,
   featured, best_seller, is_new, active, image_url, created_at)
VALUES (
  'oxford-captoe',
  (SELECT id FROM categories WHERE slug = 'shoes'),
  'Oxford Cap Toe',
  'Boardroom armor.',
  'A proper cap-toe oxford in espresso full-grain leather, Goodyear-welted for resoling and burnished by hand at the toe. The last is cut for Pakistani feet: a touch more room across the forefoot without looking bulky.

It takes a mirror shine at the cap, creases elegantly at the vamp and only gets more comfortable with wear. The shoe you wear when it matters.',
  'Full-grain calfskin upper, leather sole, Goodyear welt, stacked leather heel.',
  'Use cedar shoe trees, polish regularly and rotate with another pair. In monsoon season, dry wet shoes at room temperature and never wear them two days running.',
  21000,
  NULL,
  4.9,
  176,
  FALSE,
  TRUE,
  FALSE,
  TRUE,
  '/images/products/oxford-captoe.jpg',
  '2025-10-28T08:00:00.000Z'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'oxford-captoe'),
  'Espresso',
  '#2A1D11',
  'UK 6',
  'TT-OXF-ESP-UK6',
  21000,
  6
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'oxford-captoe'),
  'Espresso',
  '#2A1D11',
  'UK 7',
  'TT-OXF-ESP-UK7',
  21000,
  8
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'oxford-captoe'),
  'Espresso',
  '#2A1D11',
  'UK 8',
  'TT-OXF-ESP-UK8',
  21000,
  10
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'oxford-captoe'),
  'Espresso',
  '#2A1D11',
  'UK 9',
  'TT-OXF-ESP-UK9',
  21000,
  3
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'oxford-captoe'),
  'Espresso',
  '#2A1D11',
  'UK 10',
  'TT-OXF-ESP-UK10',
  21000,
  9
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'oxford-captoe'),
  'Espresso',
  '#2A1D11',
  'UK 11',
  'TT-OXF-ESP-UK11',
  21000,
  7
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'oxford-captoe'),
  'Black',
  '#1C1A17',
  'UK 6',
  'TT-OXF-BLK-UK6',
  21000,
  8
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'oxford-captoe'),
  'Black',
  '#1C1A17',
  'UK 7',
  'TT-OXF-BLK-UK7',
  21000,
  6
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'oxford-captoe'),
  'Black',
  '#1C1A17',
  'UK 8',
  'TT-OXF-BLK-UK8',
  21000,
  9
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'oxford-captoe'),
  'Black',
  '#1C1A17',
  'UK 9',
  'TT-OXF-BLK-UK9',
  21000,
  11
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'oxford-captoe'),
  'Black',
  '#1C1A17',
  'UK 10',
  'TT-OXF-BLK-UK10',
  21000,
  7
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'oxford-captoe'),
  'Black',
  '#1C1A17',
  'UK 11',
  'TT-OXF-BLK-UK11',
  21000,
  5
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products
  (slug, category_id, name, tagline, description, materials, care,
   price, compare_at_price, rating, review_count,
   featured, best_seller, is_new, active, image_url, created_at)
VALUES (
  'desert-chukka',
  (SELECT id FROM categories WHERE slug = 'shoes'),
  'Desert Chukka',
  'From dunes to dinners.',
  'The chukka boot is the most versatile shoe a man can own, and ours is cut from soft cognac full-grain leather with a cushioned crepe sole. Two eyelets, a clean round toe, nothing extra.

Dress it up with chinos, dress it down with jeans. The crepe sole stays quiet on marble floors and grips well on wet pavement.',
  'Full-grain cowhide upper, natural crepe sole, leather insole.',
  'Brush after each wear and use shoe trees. Crepe soles and monsoon puddles do not mix, so save these for dry days in the rainy season.',
  19500,
  NULL,
  4.7,
  92,
  TRUE,
  FALSE,
  FALSE,
  TRUE,
  '/images/products/desert-chukka.jpg',
  '2026-04-12T09:00:00.000Z'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'desert-chukka'),
  'Cognac',
  '#C17A3D',
  'UK 6',
  'TT-CHK-COG-UK6',
  19500,
  7
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'desert-chukka'),
  'Cognac',
  '#C17A3D',
  'UK 7',
  'TT-CHK-COG-UK7',
  19500,
  2
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'desert-chukka'),
  'Cognac',
  '#C17A3D',
  'UK 8',
  'TT-CHK-COG-UK8',
  19500,
  9
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'desert-chukka'),
  'Cognac',
  '#C17A3D',
  'UK 9',
  'TT-CHK-COG-UK9',
  19500,
  11
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'desert-chukka'),
  'Cognac',
  '#C17A3D',
  'UK 10',
  'TT-CHK-COG-UK10',
  19500,
  8
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'desert-chukka'),
  'Cognac',
  '#C17A3D',
  'UK 11',
  'TT-CHK-COG-UK11',
  19500,
  6
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'desert-chukka'),
  'Sand',
  '#C9A24B',
  'UK 6',
  'TT-CHK-SND-UK6',
  19500,
  9
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'desert-chukka'),
  'Sand',
  '#C9A24B',
  'UK 7',
  'TT-CHK-SND-UK7',
  19500,
  8
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'desert-chukka'),
  'Sand',
  '#C9A24B',
  'UK 8',
  'TT-CHK-SND-UK8',
  19500,
  6
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'desert-chukka'),
  'Sand',
  '#C9A24B',
  'UK 9',
  'TT-CHK-SND-UK9',
  19500,
  10
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'desert-chukka'),
  'Sand',
  '#C9A24B',
  'UK 10',
  'TT-CHK-SND-UK10',
  19500,
  7
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'desert-chukka'),
  'Sand',
  '#C9A24B',
  'UK 11',
  'TT-CHK-SND-UK11',
  19500,
  5
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products
  (slug, category_id, name, tagline, description, materials, care,
   price, compare_at_price, rating, review_count,
   featured, best_seller, is_new, active, image_url, created_at)
VALUES (
  'penny-loafer',
  (SELECT id FROM categories WHERE slug = 'shoes'),
  'Penny Loafer',
  'Slip on, stand out.',
  'A classic penny loafer with a hand-sewn saddle strap and apron toe, cut from supple cognac full-grain leather. No laces, no buckles, just slip on and go.

The unlined construction molds to your foot within days, and the leather sole breaks in to your stride. Equally sharp with a suit or rolled chinos.',
  'Full-grain cowhide upper, leather sole, hand-sewn apron toe.',
  'Use shoe trees and polish lightly to protect the finish. Avoid wearing in heavy rain, and let them rest a day between wears.',
  17800,
  20500,
  4.6,
  58,
  FALSE,
  FALSE,
  FALSE,
  TRUE,
  '/images/products/penny-loafer.jpg',
  '2026-05-19T10:00:00.000Z'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'penny-loafer'),
  'Cognac',
  '#C17A3D',
  'UK 6',
  'TT-LOF-COG-UK6',
  17800,
  10
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'penny-loafer'),
  'Cognac',
  '#C17A3D',
  'UK 7',
  'TT-LOF-COG-UK7',
  17800,
  8
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'penny-loafer'),
  'Cognac',
  '#C17A3D',
  'UK 8',
  'TT-LOF-COG-UK8',
  17800,
  12
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'penny-loafer'),
  'Cognac',
  '#C17A3D',
  'UK 9',
  'TT-LOF-COG-UK9',
  17800,
  9
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'penny-loafer'),
  'Cognac',
  '#C17A3D',
  'UK 10',
  'TT-LOF-COG-UK10',
  17800,
  7
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'penny-loafer'),
  'Cognac',
  '#C17A3D',
  'UK 11',
  'TT-LOF-COG-UK11',
  17800,
  6
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'penny-loafer'),
  'Espresso',
  '#2A1D11',
  'UK 6',
  'TT-LOF-ESP-UK6',
  17800,
  8
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'penny-loafer'),
  'Espresso',
  '#2A1D11',
  'UK 7',
  'TT-LOF-ESP-UK7',
  17800,
  9
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'penny-loafer'),
  'Espresso',
  '#2A1D11',
  'UK 8',
  'TT-LOF-ESP-UK8',
  17800,
  7
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'penny-loafer'),
  'Espresso',
  '#2A1D11',
  'UK 9',
  'TT-LOF-ESP-UK9',
  17800,
  11
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'penny-loafer'),
  'Espresso',
  '#2A1D11',
  'UK 10',
  'TT-LOF-ESP-UK10',
  17800,
  6
)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO product_variants
  (product_id, color, color_hex, size, sku, price, stock)
VALUES (
  (SELECT id FROM products WHERE slug = 'penny-loafer'),
  'Espresso',
  '#2A1D11',
  'UK 11',
  'TT-LOF-ESP-UK11',
  17800,
  5
)
ON CONFLICT (sku) DO NOTHING;
