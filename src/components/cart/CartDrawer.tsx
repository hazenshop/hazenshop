"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer({ freeShippingThreshold = 2500 }: { freeShippingThreshold?: number }) {
  const { cart, isOpen, closeCart, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();

  if (!isOpen) return null;

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-[999] overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen sm:max-w-md bg-white shadow-floating flex flex-col border-l border-black/[0.08]">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white text-brand-dark">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-brand-600" />
              <h2 className="font-heading font-extrabold text-base tracking-tight">Shopping Bag ({totalItems})</h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-brand-dark transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Close Bag"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Complimentary Delivery Progress */}
          <div className="bg-slate-50 p-4 border-b border-slate-100">
            {amountNeededForFreeShipping > 0 ? (
              <p className="text-xs text-slate-600 font-normal mb-2">
                Add <span className="font-semibold text-brand-dark">{formatPrice(amountNeededForFreeShipping)}</span> more for <span className="font-semibold text-brand-700">Complimentary Delivery</span>
              </p>
            ) : (
              <p className="text-xs text-emerald-700 font-medium mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Complimentary Nationwide Delivery Unlocked
              </p>
            )}
            <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-brand-dark h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-10">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                  <ShoppingBag className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="font-heading font-semibold text-base text-slate-900 mb-1">Your bag is empty</h3>
                <p className="text-xs text-slate-400 mb-6 max-w-xs font-normal">
                  Explore our luxury bed linen collections and artisanal home textiles.
                </p>
                <button
                  onClick={closeCart}
                  className="bg-brand-dark hover:bg-brand-charcoal text-white font-medium text-xs px-6 py-3 rounded-full shadow-subtle transition-all min-h-[44px]"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || "default"}`}
                  className="flex gap-3.5 p-3 rounded-2xl border border-black/[0.05] bg-white hover:bg-slate-50/50 transition-all"
                >
                  <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-[#f4f2ee] shrink-0 border border-slate-100">
                    <Image
                      src={item.productImage || "/logo.jpg"}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {item.productName}
                      </h4>
                      {item.variantName && (
                        <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                          {item.variantName}
                        </p>
                      )}
                      <p className="text-xs font-bold text-slate-900 mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-200/80 rounded-full bg-white overflow-hidden shadow-subtle">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-50 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-50 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId, item.variantId)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 space-y-3 sm:space-y-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-base font-extrabold text-brand-dark">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Estimated Delivery Fee</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white font-extrabold py-3.5 px-4 rounded-full shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 group text-xs uppercase tracking-wider min-h-[46px]"
                >
                  <span>চেকআউট করুন (Cash on Delivery)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-gold-300 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1 text-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা</span>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}


