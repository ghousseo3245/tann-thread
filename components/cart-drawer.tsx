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
import { siteConfig } from "@/site.config";

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
          <h3 className="font-display text-2xl text-espresso mt-6">Your bag is empty</h3>
          <p className="mt-2 max-w-xs text-sm text-espresso/60">
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
            <div className="rounded-xl bg-ivory-dark p-4">
              <p className="text-sm text-espresso">
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
                <li key={item.variantId} className="flex gap-4 py-4">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-espresso/5">
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
                        <p className="font-medium text-espresso leading-snug">{item.name}</p>
                        <p className="mt-0.5 text-xs text-espresso/55">
                          {item.color}
                          {item.size ? ` / Size ${item.size}` : ""}
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
                      <p className="text-sm font-semibold text-espresso">
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
              <span className="text-espresso/70">Subtotal</span>
              <span className="font-semibold text-espresso">{formatPKR(subtotal)}</span>
            </div>
            {promoDiscount > 0 ? (
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-espresso/70">Discount{promo ? ` (${promo})` : ""}</span>
                <span className="font-semibold text-cognac-dark">-{formatPKR(promoDiscount)}</span>
              </div>
            ) : null}
            <p className="mt-1 text-xs text-espresso/50">
              Delivery calculated at checkout. Complimentary over {formatPKR(threshold)}.
            </p>
            <Button size="lg" className="mt-3 w-full" onClick={handleCheckout}>
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              className="mt-2 w-full py-2 text-center text-sm font-medium text-espresso/60 hover:text-espresso"
            >
              Continue shopping
            </button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
