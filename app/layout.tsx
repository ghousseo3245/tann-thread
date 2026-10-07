import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { ToastProvider, Toaster } from "@/components/ui/toast";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700"] });
const body = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Tann & Thread | Premium Leather Goods",
  description: "Full-grain leather bags, wallets, jackets, belts and shoes, handcrafted for a lifetime of carry. Crafted for those who appreciate quality.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} font-sans bg-ivory text-espresso antialiased`}>
        <ToastProvider>
          <StoreProvider>
            {children}
            <Toaster />
          </StoreProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
