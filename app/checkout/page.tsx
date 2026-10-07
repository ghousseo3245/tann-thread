"use client";

import { Suspense } from "react";
import { useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import {
  Banknote,
  CreditCard,
  Lock,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useStore } from "@/lib/store";
import { formatPKR } from "@/lib/products";
import { siteConfig } from "@/site.config";

const PHONE_RE = /^0?3\d{2}[-\s]?\d{7}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type PaymentMethod = "COD" | "CARD";

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function expiryValid(value: string): boolean {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const now = new Date();
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

function CheckoutContent() {
  const router = useRouter();
  const toast = useToast();

  const cart = useStore((s) => s.cart);
  const subtotal = useStore((s) => s.subtotal);
  const promo = useStore((s) => s.promo);
  const promoDiscount = useStore((s) => s.promoDiscount);
  const placeOrder = useStore((s) => s.placeOrder);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);

  const cityFee = siteConfig.cities.find((c) => c.name === city)?.fee ?? 0;
  const effectiveSubtotal = Math.max(0, subtotal - promoDiscount);
  const deliveryFee = !city || effectiveSubtotal >= siteConfig.freeShippingThreshold ? 0 : cityFee;
  const total = effectiveSubtotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="container-x py-16 sm:py-24">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <span className="rounded-full bg-espresso/5 p-5">
            <ShoppingBag className="h-8 w-8 text-espresso/50" aria-hidden="true" />
          </span>
          <h1 className="font-display mt-6 text-3xl text-espresso">Your bag is empty</h1>
          <p className="mt-2 text-sm text-espresso/60">
            Add a few pieces before checking out. Your future favourite is waiting.
          </p>
          <Button className="mt-6" onClick={() => router.push("/shop")}>
            Continue shopping
          </Button>
        </div>
      </div>
    );
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (name.trim().length < 3) next.name = "Please enter your full name.";
    if (!PHONE_RE.test(phone.trim()))
      next.phone = "Enter a valid Pakistani mobile number, for example 03001234567.";
    if (email.trim() && !EMAIL_RE.test(email.trim()))
      next.email = "That email address does not look right.";
    if (address.trim().length < 10)
      next.address = "Please enter your complete street address with house number.";
    if (!city) next.city = "Please select your city.";
    if (paymentMethod === "CARD") {
      // NOTE: test-mode scaffold only. Real card processing will go through
      // Stripe (keys via env) in Phase 2; never store raw card numbers.
      if (cardNumber.replace(/\s/g, "").length !== 16)
        next.cardNumber = "Enter the 16-digit card number.";
      if (!expiryValid(cardExpiry)) next.cardExpiry = "Enter a valid future expiry (MM/YY).";
      if (!/^\d{3,4}$/.test(cardCvc)) next.cardCvc = "Enter the 3 or 4 digit security code.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePlaceOrder = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      toast("Please fix the highlighted fields.");
      return;
    }
    setPlacing(true);
    try {
      const order = placeOrder({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim(),
        city,
        paymentMethod,
        items: cart.map((item) => ({
          name: item.name,
          variantLabel: item.size ? `${item.color}, ${item.size}` : item.color,
          image: item.image,
          price: item.price,
          qty: item.qty,
        })),
        subtotal,
        discount: promoDiscount,
        deliveryFee,
        total,
      });
      // placeOrder clears the cart and promo itself.
      router.push(`/checkout/success?order=${encodeURIComponent(order.orderNumber)}`);
    } catch {
      setPlacing(false);
      toast("We could not place your order. Please try again.");
    }
  };

  const inputClass = (hasError: boolean) =>
    clsx(
      "w-full rounded-xl border bg-ivory px-4 py-3 text-sm text-espresso placeholder:text-espresso/40 focus:outline-none focus:ring-2 focus:ring-cognac",
      hasError ? "border-red-700" : "border-espresso/20"
    );

  const fieldError = (key: string) =>
    errors[key] ? (
      <p role="alert" className="mt-1 text-xs text-red-700">
        {errors[key]}
      </p>
    ) : null;

  return (
    <div className="container-x py-10 sm:py-14">
      <h1 className="font-display text-4xl text-espresso sm:text-5xl">Checkout</h1>
      <p className="mt-2 text-sm text-espresso/60">
        Cash on delivery available nationwide. No account needed.
      </p>

      <form onSubmit={handlePlaceOrder} noValidate className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* Contact */}
          <section className="rounded-2xl border border-espresso/10 p-5 sm:p-7">
            <h2 className="font-display text-2xl text-espresso">Contact</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="co-name" className="mb-1.5 block text-sm font-medium text-espresso">
                  Full name
                </label>
                <input
                  id="co-name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ahmed Raza"
                  className={inputClass(!!errors.name)}
                />
                {fieldError("name")}
              </div>
              <div>
                <label htmlFor="co-phone" className="mb-1.5 block text-sm font-medium text-espresso">
                  Mobile number
                </label>
                <input
                  id="co-phone"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03001234567"
                  className={inputClass(!!errors.phone)}
                />
                {fieldError("phone")}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-email" className="mb-1.5 block text-sm font-medium text-espresso">
                  Email <span className="font-normal text-espresso/50">(optional)</span>
                </label>
                <input
                  id="co-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass(!!errors.email)}
                />
                {fieldError("email")}
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section className="rounded-2xl border border-espresso/10 p-5 sm:p-7">
            <h2 className="font-display text-2xl text-espresso">Shipping</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="co-address" className="mb-1.5 block text-sm font-medium text-espresso">
                  Street address
                </label>
                <input
                  id="co-address"
                  autoComplete="street-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House 12, Street 4, Block C"
                  className={inputClass(!!errors.address)}
                />
                {fieldError("address")}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-city" className="mb-1.5 block text-sm font-medium text-espresso">
                  City
                </label>
                <select
                  id="co-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={clsx(inputClass(!!errors.city), !city && "text-espresso/40")}
                >
                  <option value="" disabled>
                    Select your city
                  </option>
                  {siteConfig.cities.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({formatPKR(c.fee)} delivery)
                    </option>
                  ))}
                </select>
                {fieldError("city")}
                <p className="mt-1.5 text-xs text-espresso/55">
                  Delivery is complimentary on orders over {formatPKR(siteConfig.freeShippingThreshold)}.
                </p>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-espresso/10 p-5 sm:p-7">
            <h2 className="font-display text-2xl text-espresso">Payment</h2>
            <div className="mt-5 space-y-3" role="radiogroup" aria-label="Payment method">
              <label
                className={clsx(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all",
                  paymentMethod === "COD"
                    ? "border-cognac bg-cognac/5 ring-1 ring-cognac"
                    : "border-espresso/20 hover:border-espresso/40"
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="mt-1 accent-cognac"
                />
                <span>
                  <span className="flex items-center gap-2 font-medium text-espresso">
                    <Banknote className="h-5 w-5 text-cognac-dark" aria-hidden="true" />
                    Cash on Delivery
                  </span>
                  <span className="mt-0.5 block text-sm text-espresso/60">
                    Pay in cash when your order arrives. No advance needed.
                  </span>
                </span>
              </label>
              <label
                className={clsx(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all",
                  paymentMethod === "CARD"
                    ? "border-cognac bg-cognac/5 ring-1 ring-cognac"
                    : "border-espresso/20 hover:border-espresso/40"
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  value="CARD"
                  checked={paymentMethod === "CARD"}
                  onChange={() => setPaymentMethod("CARD")}
                  className="mt-1 accent-cognac"
                />
                <span>
                  <span className="flex items-center gap-2 font-medium text-espresso">
                    <CreditCard className="h-5 w-5 text-cognac-dark" aria-hidden="true" />
                    Credit / Debit Card
                  </span>
                  <span className="mt-0.5 block text-sm text-espresso/60">
                    Processed securely in test mode.
                  </span>
                </span>
              </label>
            </div>

            {paymentMethod === "CARD" ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="co-card-number" className="mb-1.5 block text-sm font-medium text-espresso">
                    Card number
                  </label>
                  <input
                    id="co-card-number"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="4242 4242 4242 4242"
                    className={inputClass(!!errors.cardNumber)}
                  />
                  {fieldError("cardNumber")}
                </div>
                <div>
                  <label htmlFor="co-card-expiry" className="mb-1.5 block text-sm font-medium text-espresso">
                    Expiry
                  </label>
                  <input
                    id="co-card-expiry"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className={inputClass(!!errors.cardExpiry)}
                  />
                  {fieldError("cardExpiry")}
                </div>
                <div>
                  <label htmlFor="co-card-cvc" className="mb-1.5 block text-sm font-medium text-espresso">
                    CVC
                  </label>
                  <input
                    id="co-card-cvc"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="123"
                    className={inputClass(!!errors.cardCvc)}
                  />
                  {fieldError("cardCvc")}
                </div>
                <p className="flex items-center gap-1.5 text-xs text-espresso/55 sm:col-span-2">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  Test mode: use any future expiry and any CVC. Real payments arrive with Stripe
                  in Phase 2.
                </p>
              </div>
            ) : null}
          </section>

          <Button type="submit" size="lg" className="w-full" disabled={placing}>
            {placing ? "Placing your order..." : `Place Order · ${formatPKR(total)}`}
          </Button>
        </div>

        {/* Order summary */}
        <aside className="lg:sticky lg:top-24 self-start">
          <div className="rounded-2xl border border-espresso/10 bg-ivory-dark/50 p-5 sm:p-6">
            <h2 className="font-display text-xl text-espresso">Order summary</h2>
            <ul className="mt-4 space-y-4">
              {cart.map((item) => (
                <li key={item.variantId} className="flex gap-3">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-espresso/5">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                    <span className="absolute right-1 top-1 rounded-full bg-espresso-deep/75 px-1.5 py-0.5 text-[10px] font-semibold text-ivory">
                      {item.qty}
                    </span>
                  </div>
                  <div className="flex flex-1 items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium leading-snug text-espresso">{item.name}</p>
                      <p className="mt-0.5 text-xs text-espresso/55">
                        {item.color}
                        {item.size ? ` / ${item.size}` : ""}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-espresso">
                      {formatPKR(item.price * item.qty)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-espresso/10 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-espresso/65">Subtotal</dt>
                <dd className="font-medium text-espresso">{formatPKR(subtotal)}</dd>
              </div>
              {promoDiscount > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-espresso/65">
                    Discount{promo ? ` (${promo})` : ""}
                  </dt>
                  <dd className="font-medium text-cognac-dark">-{formatPKR(promoDiscount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-espresso/65">Delivery{city ? ` (${city})` : ""}</dt>
                <dd className="font-medium text-espresso">
                  {deliveryFee === 0 ? "Free" : formatPKR(deliveryFee)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-espresso/10 pt-3 text-base">
                <dt className="font-semibold text-espresso">Total</dt>
                <dd className="font-display text-xl font-semibold text-espresso">
                  {formatPKR(total)}
                </dd>
              </div>
            </dl>
          </div>

          <ul className="mt-5 space-y-3 text-sm text-espresso/70">
            <li className="flex items-center gap-2.5">
              <Truck className="h-4 w-4 shrink-0 text-cognac-dark" aria-hidden="true" />
              Nationwide delivery in 3 to 5 working days
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-cognac-dark" aria-hidden="true" />
              Secure checkout, cash on delivery available
            </li>
            <li className="flex items-center gap-2.5">
              <RotateCcw className="h-4 w-4 shrink-0 text-cognac-dark" aria-hidden="true" />
              7-day easy exchange on every order
            </li>
          </ul>
        </aside>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="container-x py-10">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="mt-8 h-96 w-full" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
