"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Zap } from "lucide-react";
import { ProductVariant, SiteSettings } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { trackAddToCart } from "@/lib/pixel";
import { useCart } from "@/context/CartContext";

export default function QuickOrderModal({ settings }: { settings?: SiteSettings }) {
  const router = useRouter();
  const { quickOrderProduct, closeQuickOrder, addToCart } = useCart();

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && quickOrderProduct) {
        closeQuickOrder();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [quickOrderProduct, closeQuickOrder]);

  if (!quickOrderProduct) {
    return null;
  }

  const handleOrderVariant = (variant?: ProductVariant) => {
    addToCart(quickOrderProduct, variant, 1, { silent: true });
    trackAddToCart(quickOrderProduct, variant, 1);
    closeQuickOrder();
    router.push("/checkout");
  };

  const hasVariants =
    quickOrderProduct.variants && quickOrderProduct.variants.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-150">
      {/* Backdrop click dismiss */}
      <div
        className="fixed inset-0"
        onClick={closeQuickOrder}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto flex flex-col animate-in zoom-in-95 duration-150">
        {/* Top Bar with Close 'x' */}
        <div className="flex items-center justify-end px-4 py-3 border-b border-slate-200">
          <button
            type="button"
            onClick={closeQuickOrder}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body - Variant List */}
        <div className="p-4 sm:p-6 space-y-3 max-h-[75vh] overflow-y-auto">
          {hasVariants ? (
            quickOrderProduct.variants.map((v) => {
              const effectivePrice = v.salePrice ?? v.price;
              return (
                <div
                  key={v.id}
                  className="bg-[#f8f9fa] rounded-lg p-4 sm:p-5 flex items-center justify-between gap-4 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  {/* Variant Title */}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm sm:text-base font-normal text-slate-800 leading-snug block">
                      {v.name}
                    </span>
                  </div>

                  {/* Price & Order Now Button */}
                  <div className="flex flex-col items-end shrink-0 space-y-1">
                    <span className="text-sm sm:text-base font-normal text-slate-800 font-sans">
                      ৳ {effectivePrice.toLocaleString("en-BD")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOrderVariant(v)}
                      className="bg-[#1e40af] hover:bg-[#1d4ed8] active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-1.5 rounded flex items-center gap-1 shadow-sm transition-all"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Order Now</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-[#f8f9fa] rounded-lg p-4 sm:p-5 flex items-center justify-between gap-4 border border-slate-100">
              <div className="flex-1 min-w-0">
                <span className="text-sm sm:text-base font-normal text-slate-800 leading-snug block">
                  {quickOrderProduct.name}
                </span>
              </div>
              <div className="flex flex-col items-end shrink-0 space-y-1">
                <span className="text-sm sm:text-base font-normal text-slate-800 font-sans">
                  ৳ {(quickOrderProduct.salePrice ?? quickOrderProduct.price).toLocaleString("en-BD")}
                </span>
                <button
                  type="button"
                  onClick={() => handleOrderVariant(undefined)}
                  className="bg-[#1e40af] hover:bg-[#1d4ed8] active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-1.5 rounded flex items-center gap-1 shadow-sm transition-all"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Order Now</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Close button */}
        <div className="flex items-center justify-end px-4 sm:px-6 py-3 border-t border-slate-200 bg-white">
          <button
            type="button"
            onClick={closeQuickOrder}
            className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm px-5 py-1.5 rounded transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
