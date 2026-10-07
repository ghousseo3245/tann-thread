"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingBag, Tag, Trash2, Undo2 } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useToast } from "@/components/ui/toast";
import { useStore } from "@/lib/store";
import { formatPKR } from "@/lib/products";
import {
  getWhatsAppNumber,
  whatsappOrderUrl,
  cartOrderMessage,
} from "@/lib/whatsapp-order";
import { siteConfig } from "@/site.config";

/** Official WhatsApp glyph (SVG, not an emoji) for the order button. */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

export function CartDrawer() {
  const router = useRouter();
  const toast = useToast();

  const cartOpen = useStore((s) => s.cartOpen);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const cart = useStore((s) => s.cart);
  const cartCount = useStore((s) => s.cartCount);
  const subtotal = useStore((s) => s.subtotal);
  const promo = useStore((s) => s.promo);
  const promoDiscount = useStore((s) => s.promoDiscount);
  const updateQty = useStore((s) => s.updateQty);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const undoRemove = useStore((s) => s.undoRemove);
  const applyPromo = useStore((s) => s.applyPromo);
  const removePromo = useStore((s) => s.removePromo);

  const [promoInput, setPromoInput] = useState("");
  const [removedItem, setRemovedItem] = useState<{ variantId: string; name: string } | null>(null);

  useEffect(() => {
    if (!cartOpen) {
      setRemovedItem(null);
      setPromoInput("");
    }
  }, [cartOpen]);

  const handleApplyPromo = () => {
    const code = promoInput.trim();
    if (!code) return;
    try {
      const ok = applyPromo(code);
      if (ok) {
        setPromoInput("");
        toast(`Code ${code.trim().toUpperCase()} applied. Enjoy the savings.`);
      } else {
        toast(`Code ${code.trim().toUpperCase()} is not valid.`);
      }
    } catch {
      toast("We could not apply that code. Please try again.");
    }
  };

  const handleRemovePromo = () => {
    removePromo();
    setPromoInput("");
  };

  const handleRemoveItem = (variantId: string, name: string) => {
    removeFromCart(variantId);
    setRemovedItem({ variantId, name });
  };

  const handleUndoRemove = () => {
    undoRemove();
    setRemovedItem(null);
  };

  const handleCheckout = () => {
    setCartOpen(false);
    router.push("/checkout");
  };

  const handleWhatsAppOrder = async () => {
    if (cart.length === 0) return;
    const number = await getWhatsAppNumber();
    const message = cartOrderMessage(
      cart.map((item) => ({
        name: item.name,
        variantLabel: item.size ? `${item.color}, ${item.size}` : item.color,
        price: item.price,
        qty: item.qty,
      }))
    );
    window.open(whatsappOrderUrl(number, message), "_blank", "noopener");
  };

  const effectiveSubtotal = Math.max(0, subtotal - promoDiscount);
  const threshold = siteConfig.freeShippingThreshold;
  const remaining = threshold - effectiveSubtotal;
  const progress = Math.min(100, Math.max(0, (effectiveSubtotal / threshold) * 100));
  const showUndo =
    removedItem !== null && !cart.some((item) => item.variantId === removedItem.variantId);

  return (
    <Drawer open={cartOpen} onClose={() => setCartOpen(false)} title={cartCount > 0 ? `Your Bag (${cartCount})` : "Your Bag"}>
      {cart.length === 0 && !showUndo ? (
        <div className="flex h-full flex-col items-center justify-center text-center py-12">
          <span className="rounded-full bg-espresso/5 p-5">
            <ShoppingBag className="h-8 w-8 text-espresso/50" aria-hidden="true" />
          </span>
          <h3 className="font-display mt-6 text-2xl tracking-tight text-espresso">Your bag is empty</h3>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-espresso/60">
            Beautiful full-grain leather goods are waiting. Start with our best sellers.
          </p>
          <Button
            className="mt-6"
            onClick={() => {
              setCartOpen(false);
              router.push("/shop");
            }}
          >
            Start shopping
          </Button>
        </div>
      ) : (
        <div className="flex min-h-full flex-col">
          <div className="flex-1">
            {/* Free shipping progress */}
            <div className="rounded-2xl bg-ivory-dark p-4 ring-1 ring-espresso/10">
              <p className="text-sm leading-relaxed text-espresso">
                {remaining > 0 ? (
                  <>
                    <strong className="font-semibold">{formatPKR(remaining)}</strong> away from
                    complimentary shipping
                  </>
                ) : (
                  <strong className="font-semibold text-cognac-dark">
                    You unlocked complimentary shipping.
                  </strong>
                )}
              </p>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-espresso/10"
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progress toward complimentary shipping"
              >
                <div
                  className="h-full rounded-full bg-cognac transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Line items */}
            <ul className="mt-4 divide-y divide-espresso/10">
              {cart.map((item) => (
                <li key={item.variantId} className="flex gap-4 py-5">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-espresso/5 ring-1 ring-espresso/10">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display text-[15px] leading-snug text-espresso">{item.name}</p>
                        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-espresso/50">
                          {item.color}
                          {item.size ? ` · Size ${item.size}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${item.name} from bag`}
                        onClick={() => handleRemoveItem(item.variantId, item.name)}
                        className="rounded-full p-1.5 text-espresso/50 transition-colors hover:bg-espresso/5 hover:text-espresso"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QuantityStepper
                        small
                        qty={item.qty}
                        onChange={(q) => updateQty(item.variantId, q)}
                      />
                      <p className="text-sm font-semibold tabular-nums text-espresso">
                        {formatPKR(item.price * item.qty)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {showUndo && removedItem ? (
              <div className="mt-2 flex items-center justify-between rounded-xl bg-espresso/5 px-4 py-3">
                <p className="text-sm text-espresso/70">
                  Removed <span className="font-medium text-espresso">{removedItem.name}</span>.
                </p>
                <button
                  type="button"
                  onClick={handleUndoRemove}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-cognac-dark hover:text-cognac"
                >
                  <Undo2 className="h-4 w-4" aria-hidden="true" />
                  Undo
                </button>
              </div>
            ) : null}

            {/* Promo code */}
            <div className="mt-4">
              {promo ? (
                <div className="flex items-center justify-between rounded-xl border border-cognac/40 bg-cognac/10 px-4 py-3">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-espresso">
                    <Tag className="h-4 w-4 text-cognac-dark" aria-hidden="true" />
                    {promo}
                    <span className="font-normal text-espresso/60">
                      ({siteConfig.promoCodes[promo] ?? 0}% off applied)
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-sm font-medium text-espresso/60 underline-offset-2 hover:text-espresso hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <label htmlFor="promo-code" className="sr-only">
                    Promo code
                  </label>
                  <input
                    id="promo-code"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleApplyPromo();
                    }}
                    placeholder="Promo code (try WELCOME10)"
                    className="h-11 flex-1 rounded-full border border-espresso/20 bg-ivory px-4 text-sm text-espresso placeholder:text-espresso/40 focus:outline-none focus:ring-2 focus:ring-cognac"
                  />
                  <Button variant="outline" onClick={handleApplyPromo} disabled={!promoInput.trim()}>
                    Apply
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Summary footer */}
          <div className="sticky bottom-0 -mx-5 mt-4 border-t border-espresso/10 bg-ivory px-5 pb-2 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-espresso/65">Subtotal</span>
              <span className="font-semibold tabular-nums text-espresso">{formatPKR(subtotal)}</span>
            </div>
            {promoDiscount > 0 ? (
              <div className="mt-1.5 flex items-center justify-between text-sm">
                <span className="text-espresso/65">Discount{promo ? ` (${promo})` : ""}</span>
                <span className="font-semibold tabular-nums text-cognac-dark">-{formatPKR(promoDiscount)}</span>
              </div>
            ) : null}
            <p className="mt-1.5 text-xs leading-relaxed text-espresso/50">
              Delivery calculated at checkout. Complimentary over {formatPKR(threshold)}.
            </p>
            <Button
              size="lg"
              className="mt-4 w-full shadow-md shadow-cognac/25 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-cognac/30"
              onClick={handleCheckout}
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <button
              type="button"
              onClick={() => void handleWhatsAppOrder()}
              className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full bg-[#1FA855] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#1FA855]/25 transition-all hover:-translate-y-px hover:bg-[#1B9348] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1FA855]"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Order via WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              className="mt-2 w-full py-2.5 text-center text-sm font-semibold text-espresso/55 underline-offset-4 transition-colors hover:text-espresso hover:underline"
            >
              Continue shopping
            </button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
