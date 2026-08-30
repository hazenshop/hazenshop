"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer({
  freeShippingThreshold = 2500,
}: {
  freeShippingThreshold?: number;
}) {
  const {
    cart,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalItems,
  } = useCart();

  // Prevent background scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-[999] overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Container: Bottom Sheet on Mobile (<sm) & Slide-Over on Desktop (>=sm) */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:left-auto sm:right-0 max-w-full flex justify-end">
        <div className="w-full sm:w-screen sm:max-w-md bg-white shadow-floating flex flex-col rounded-t-[32px] sm:rounded-none max-h-[90vh] sm:max-h-full sm:border-l border-black/[0.08] animate-in slide-in-from-bottom sm:slide-in-from-right duration-300">
          {/* Mobile Drag Indicator Pill */}
          <div className="sm:hidden pt-3 pb-1 flex justify-center cursor-pointer" onClick={closeCart}>
            <div className="w-12 h-1.5 rounded-full bg-slate-300" />
          </div>

          {/* Drawer Header */}
          <div className="px-5 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-white text-slate-900">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-50 text-brand-maroon-700">
                <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-base sm:text-lg tracking-tight leading-tight">
                  Shopping Bag ({totalItems})
                </h2>
                <span className="text-[10px] text-slate-400 font-medium">১০০% ক্যাশ অন ডেলিভারি</span>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Progress Bar */}
          <div className="bg-brand-50/60 px-5 py-3 border-b border-brand-100">
            {amountNeededForFreeShipping > 0 ? (
              <p className="text-xs text-slate-700 font-medium mb-1.5">
                আর মাত্র <span className="font-bold text-brand-maroon-700">{formatPrice(amountNeededForFreeShipping)}</span> টাকার পণ্য যোগ করলেই <span className="font-bold text-emerald-800">ফ্রি ডেলিভারি!</span>
              </p>
            ) : (
              <p className="text-xs text-emerald-800 font-bold mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                অভিনন্দন! আপনার অর্ডারে ফ্রি ডেলিভারি আনলক হয়েছে
              </p>
            )}
            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand-maroon-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                  <ShoppingBag className="w-7 h-7 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    আপনার ব্যাগ বর্তমানে খালি
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs font-normal">
                    আমাদের এক্সপোর্ট কোয়ালিটি বেডশিট ও পর্দা কালেকশন থেকে পছন্দসই পণ্য বাছাই করুন।
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white font-bold text-xs px-6 py-3.5 rounded-full shadow-card transition-all min-h-[44px]"
                >
                  কালেকশন দেখুন (Browse Products)
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || "default"}`}
                  className="flex gap-3.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#f4f2ee] shrink-0 border border-slate-200">
                    <Image
                      src={item.productImage || "/logo.jpg"}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                          aria-label="Remove Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.variantName && (
                        <span className="text-[11px] font-medium text-slate-500 block mt-0.5 truncate">
                          {item.variantName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/60">
                      <span className="text-xs sm:text-sm font-black text-brand-maroon-700">
                        {formatPrice(item.price)}
                      </span>

                      {/* Touch Stepper */}
                      <div className="flex items-center gap-2 bg-white rounded-full border border-slate-200 p-0.5 shadow-subtle">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1, item.variantId)
                          }
                          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors min-h-[28px] min-w-[28px]"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-900 w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1, item.variantId)
                          }
                          className="w-7 h-7 rounded-full bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white flex items-center justify-center transition-colors min-h-[28px] min-w-[28px]"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sticky Bottom Summary & Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-slate-100 shadow-floating space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-500 font-medium">
                  <span>পণ্য উপমোট (Subtotal):</span>
                  <span className="text-sm font-bold text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 font-medium">
                  <span>ডেলিভারি চার্জ:</span>
                  <span className="font-semibold text-slate-900">
                    {subtotal >= freeShippingThreshold ? (
                      <span className="text-emerald-700 font-bold">ফ্রি (Free)</span>
                    ) : (
                      "চেকআউটে নির্ধারিত হবে"
                    )}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full bg-brand-maroon-700 hover:bg-brand-maroon-800 active:scale-[0.99] text-white font-extrabold py-3.5 sm:py-4 px-6 rounded-full shadow-card hover:shadow-card-hover transition-all flex items-center justify-between text-xs sm:text-sm uppercase tracking-wider group min-h-[48px]"
              >
                <span>অর্ডার সম্পন্ন করুন (ক্যাশ অন ডেলিভারি)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm sm:text-base font-black text-brand-gold-300">
                    {formatPrice(subtotal)}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-white" />
                </div>
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>কোন অগ্রিম পেমেন্ট নেই &bull; ক্যাশ অন ডেলিভারি</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
