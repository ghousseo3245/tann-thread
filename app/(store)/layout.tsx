import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart-drawer";

/** Storefront chrome: announcement bar, header, footer and cart drawer.
 *  Only applies to the public store routes. Admin (/admin) and API routes
 *  intentionally render without it. */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="min-h-[70vh]">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
