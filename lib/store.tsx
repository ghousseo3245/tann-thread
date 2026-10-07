"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Order, OrderItem, Review } from "./types";
import { seedReviews } from "./products";
import { siteConfig } from "@/site.config";

/* ------------------------------------------------------------------ */
/* Local storage helpers                                               */
/* ------------------------------------------------------------------ */

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable: keep the app running on memory state
  }
}

/* ------------------------------------------------------------------ */
/* DEMO orders: clearly marked placeholders so order tracking can be   */
/* tried without placing a real order. Not real customer data.        */
/* ------------------------------------------------------------------ */

export const DEMO_ORDERS: Order[] = [
  {
    orderNumber: "TT-2026-1042",
    phone: "03001234567",
    name: "Demo Customer",
    city: "Lahore",
    address: "14-B Model Town, Lahore",
    paymentMethod: "COD",
    items: [
      {
        name: "Lahore Weekender",
        variantLabel: "Cognac",
        image: "/images/products/lahore-weekender.jpg",
        price: 24500,
        qty: 1,
      } as OrderItem,
      {
        name: "Heritage Bifold",
        variantLabel: "Cognac",
        image: "/images/products/heritage-bifold.jpg",
        price: 6200,
        qty: 2,
      } as OrderItem,
    ],
    subtotal: 36900,
    discount: 0,
    deliveryFee: 0,
    total: 36900,
    status: "Shipped",
    placedAt: "2026-09-28T10:15:00.000Z",
    timeline: [
      { label: "Order placed", at: "2026-09-28T10:15:00.000Z" },
      { label: "Order confirmed", at: "2026-09-29T09:00:00.000Z" },
      { label: "Order shipped", at: "2026-09-30T16:20:00.000Z" },
    ],
  },
  {
    orderNumber: "TT-2026-1057",
    phone: "03219876543",
    name: "Demo Customer",
    city: "Karachi",
    address: "Demo address, DHA Phase 6, Karachi",
    paymentMethod: "COD",
    items: [
      {
        name: "Oxford Cap Toe",
        variantLabel: "Espresso, UK 9",
        image: "/images/products/oxford-captoe.jpg",
        price: 21000,
        qty: 1,
      } as OrderItem,
    ],
    subtotal: 21000,
    discount: 0,
    deliveryFee: 0,
    total: 21000,
    status: "Out for delivery",
    placedAt: "2026-10-02T14:40:00.000Z",
    timeline: [
      { label: "Order placed", at: "2026-10-02T14:40:00.000Z" },
      { label: "Order confirmed", at: "2026-10-02T18:10:00.000Z" },
      { label: "Order shipped", at: "2026-10-04T11:00:00.000Z" },
      { label: "Out for delivery", at: "2026-10-06T09:30:00.000Z" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

type NewOrderInput = Omit<
  Order,
  "orderNumber" | "placedAt" | "timeline" | "status"
>;

type StoreValue = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => void;
  updateQty: (variantId: string, qty: number) => void;
  removeFromCart: (variantId: string) => void;
  undoRemove: () => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (b: boolean) => void;
  cartCount: number;
  promo: string | null;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
  promoDiscount: number;
  subtotal: number;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  placeOrder: (input: NewOrderInput) => Order;
  recordServerOrder: (order: Order) => void;
  orders: Order[];
  getOrder: (orderNumber: string, phone: string) => Order | undefined;
  getReviews: (productSlug: string) => Review[];
  addReview: (r: Omit<Review, "id" | "date" | "verified">) => void;
  subscribeNewsletter: (email: string) => boolean;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  // Lazy init from localStorage (first load only). Demo orders merge in once,
  // deduplicated against anything already stored under tt-orders.
  const [cart, setCart] = useState<CartItem[]>(() => readLS("tt-cart", []));
  const [wishlist, setWishlist] = useState<string[]>(() =>
    readLS("tt-wishlist", [])
  );
  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = readLS<Order[]>("tt-orders", []);
    const storedNumbers = new Set(stored.map((o) => o.orderNumber));
    return [...DEMO_ORDERS.filter((d) => !storedNumbers.has(d.orderNumber)), ...stored];
  });
  const [localReviews, setLocalReviews] = useState<Review[]>(() =>
    readLS("tt-reviews", [])
  );
  const [newsletter, setNewsletter] = useState<string[]>(() =>
    readLS("tt-newsletter", [])
  );
  const [promo, setPromo] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [lastRemoved, setLastRemoved] = useState<CartItem | null>(null);

  useEffect(() => writeLS("tt-cart", cart), [cart]);
  useEffect(() => writeLS("tt-wishlist", wishlist), [wishlist]);
  useEffect(() => writeLS("tt-orders", orders), [orders]);
  useEffect(() => writeLS("tt-reviews", localReviews), [localReviews]);
  useEffect(() => writeLS("tt-newsletter", newsletter), [newsletter]);

  const subtotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.qty, 0),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((count, i) => count + i.qty, 0),
    [cart]
  );

  const promoDiscount = useMemo(() => {
    if (!promo) return 0;
    const percent = siteConfig.promoCodes[promo] ?? 0;
    return Math.round((subtotal * percent) / 100);
  }, [promo, subtotal]);

  const addToCart = (item: Omit<CartItem, "qty">, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...item, qty }];
    });
    setLastRemoved(null);
  };

  const updateQty = (variantId: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => i.variantId !== variantId)
        : prev.map((i) => (i.variantId === variantId ? { ...i, qty } : i))
    );
  };

  const removeFromCart = (variantId: string) => {
    setCart((prev) => {
      const found = prev.find((i) => i.variantId === variantId) ?? null;
      setLastRemoved(found);
      return prev.filter((i) => i.variantId !== variantId);
    });
  };

  const undoRemove = () => {
    if (!lastRemoved) return;
    const item = lastRemoved;
    setCart((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId ? { ...i, qty: i.qty + item.qty } : i
        );
      }
      return [...prev, item];
    });
    setLastRemoved(null);
  };

  const clearCart = () => {
    setCart([]);
    setLastRemoved(null);
  };

  const applyPromo = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (siteConfig.promoCodes[clean] !== undefined) {
      setPromo(clean);
      return true;
    }
    return false;
  };

  const removePromo = (): void => {
    setPromo(null);
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const placeOrder = (input: NewOrderInput): Order => {
    const now = new Date().toISOString();
    const order: Order = {
      ...input,
      orderNumber: `TT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      placedAt: now,
      status: "Placed",
      timeline: [{ label: "Order placed", at: now }],
    };
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setPromo(null);
    setLastRemoved(null);
    return order;
  };

  /**
   * Record an order that was placed through the server API route
   * (POST /api/orders). The server persists it to Supabase and sends the
   * WhatsApp owner notification; here we mirror it into the local order
   * history so the success page and track-order lookup can find it, and
   * clear the cart/promo like placeOrder does.
   */
  const recordServerOrder = (order: Order) => {
    setOrders((prev) =>
      prev.some((o) => o.orderNumber === order.orderNumber)
        ? prev
        : [order, ...prev]
    );
    setCart([]);
    setPromo(null);
    setLastRemoved(null);
  };

  const getOrder = (
    orderNumber: string,
    phone: string
  ): Order | undefined => {
    const num = orderNumber.trim().toLowerCase();
    const ph = phone.trim().toLowerCase();
    return orders.find(
      (o) =>
        o.orderNumber.trim().toLowerCase() === num &&
        o.phone.trim().toLowerCase() === ph
    );
  };

  const getReviews = (productSlug: string): Review[] => {
    return [...localReviews, ...seedReviews]
      .filter((r) => r.productSlug === productSlug)
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  const addReview = (r: Omit<Review, "id" | "date" | "verified">): void => {
    const review: Review = {
      ...r,
      id: `local-${Date.now()}`,
      date: new Date().toISOString(),
      verified: false,
    };
    setLocalReviews((prev) => [review, ...prev]);
  };

  const subscribeNewsletter = (email: string): boolean => {
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return false;
    if (newsletter.includes(clean)) return false;
    setNewsletter((prev) => [...prev, clean]);
    return true;
  };

  const value: StoreValue = {
    cart,
    addToCart,
    updateQty,
    removeFromCart,
    undoRemove,
    clearCart,
    cartOpen,
    setCartOpen,
    cartCount,
    promo,
    applyPromo,
    removePromo,
    promoDiscount,
    subtotal,
    wishlist,
    toggleWishlist,
    placeOrder,
    recordServerOrder,
    orders,
    getOrder,
    getReviews,
    addReview,
    subscribeNewsletter,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreValue;
export function useStore<T>(selector: (s: StoreValue) => T): T;
export function useStore<T>(
  selector?: (s: StoreValue) => T
): StoreValue | T {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return selector ? selector(ctx) : ctx;
}
