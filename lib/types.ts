export type Category = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
};

export type ProductVariant = {
  id: string;
  color: string;
  colorHex: string;
  size?: string;
  sku: string;
  price: number;
  stock: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  materials: string;
  care: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  featured?: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
  createdAt: string;
};

export type CartItem = {
  variantId: string;
  productSlug: string;
  name: string;
  image: string;
  color: string;
  size?: string;
  price: number;
  qty: number;
};

export type OrderItem = {
  name: string;
  variantLabel: string;
  image: string;
  price: number;
  qty: number;
};

export type OrderStatus = "Placed" | "Confirmed" | "Shipped" | "Out for delivery" | "Delivered";

export type Order = {
  orderNumber: string;
  phone: string;
  name: string;
  email?: string;
  city: string;
  address: string;
  paymentMethod: "COD" | "CARD";
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  placedAt: string;
  timeline: { label: string; at: string }[];
};

export type Review = {
  id: string;
  productSlug: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
};

export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  readMinutes: number;
  body: string[];
  relatedSlugs: string[];
};
