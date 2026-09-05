"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Truck,
  ExternalLink,
} from "lucide-react";
import { ProductVariant, SiteSettings } from "@/lib/types";
import {
  formatPrice,
  calculateDiscountPercentage,
  generateWhatsAppOrderUrl,
} from "@/lib/utils";
import { trackAddToCart } from "@/lib/pixel";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

export default function QuickOrderModal({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const { quickOrderProduct, quickOrderVariant, closeQuickOrder, addToCart } = useCart();
  const { showToast } = useToast();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  // Sync state whenever quickOrderProduct / quickOrderVariant changes
  useEffect(() => {
    if (quickOrderProduct) {
      if (quickOrderVariant) {
        setSelectedVariant(quickOrderVariant);
      } else if (quickOrderProduct.variants && quickOrderProduct.variants.length > 0) {
        setSelectedVariant(quickOrderProduct.variants[0]);
      } else {
        setSelectedVariant(undefined);
      }
      setQuantity(1);
    }
  }, [quickOrderProduct, quickOrderVariant]);

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

  const unitPrice = selectedVariant
    ? selectedVariant.salePrice ?? selectedVariant.price
    : quickOrderProduct.salePrice ?? quickOrderProduct.price;

  const originalPrice = selectedVariant ? selectedVariant.price : quickOrderProduct.price;
  const discountPercent = calculateDiscountPercentage(originalPrice, unitPrice);
  const itemSubtotal = unitPrice * quantity;

  // Primary Action: Add to Cart and Go Directly to /checkout
  const handleProceedToCheckout = () => {
    addToCart(quickOrderProduct, selectedVariant, quantity, { silent: true });
    trackAddToCart(quickOrderProduct, selectedVariant, quantity);
    closeQuickOrder();
    router.push("/checkout");
  };

  // Secondary Action: Add to Cart & Stay on Page
  const handleAddToBag = () => {
    addToCart(quickOrderProduct, selectedVariant, quantity, { silent: false });
    trackAddToCart(quickOrderProduct, selectedVariant, quantity);
    showToast(`"${quickOrderProduct.name}" ব্যাগে যোগ করা হয়েছে!`);
    closeQuickOrder();
  };

  const whatsAppUrl = generateWhatsAppOrderUrl(
    settings?.whatsappNumber || "01700000000",
    [
      {
        name: quickOrderProduct.name,
        variant: selectedVariant?.name,
        quantity,
        price: unitPrice,
      },
    ],
    itemSubtotal
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click dismiss */}
      <div className="fixed inset-0" onClick={closeQuickOrder} aria-hidden="true" />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-floating border border-black/10 overflow-hidden z-10 my-auto flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-brand-maroon-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-gold-300 animate-pulse" />
            <span className="font-heading font-extrabold text-sm sm:text-base tracking-tight text-white">
              পণ্য ও সাইজ নির্বাচন করুন (Select & Order)
            </span>
          </div>
          <button
            type="button"
            onClick={closeQuickOrder}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Product Info Card */}
          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
              <Image
                src={(selectedVariant?.image || quickOrderProduct.images[0]) || "/logo.jpg"}
                alt={quickOrderProduct.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-brand-maroon-700 bg-brand-maroon-50 px-2 py-0.5 rounded">
                  {quickOrderProduct.categoryName}
                </span>
                {quickOrderProduct.badge && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-900 bg-brand-gold-300 px-2 py-0.5 rounded">
                    {quickOrderProduct.badge}
                  </span>
                )}
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                {quickOrderProduct.name}
              </h3>
              <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                <span className="text-base sm:text-xl font-extrabold text-brand-maroon-700">
                  {formatPrice(unitPrice)}
                </span>
                {originalPrice > unitPrice && (
                  <>
                    <span className="text-xs text-slate-400 line-through font-normal">
                      {formatPrice(originalPrice)}
                    </span>
                    <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                      -{discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Variant Selector */}
          {quickOrderProduct.variants && quickOrderProduct.variants.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1 text-[11px] sm:text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-brand-maroon-700" />
                  <span>সাইজ / অপশন বাছাই করুন:</span>
                </label>
                {selectedVariant && (
                  <span className="font-bold text-brand-maroon-700 bg-brand-maroon-50 px-2 py-0.5 rounded text-[11px]">
                    {selectedVariant.name}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickOrderProduct.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const variantPrice = v.salePrice ?? v.price;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2.5 min-h-[46px] ${
                        isSelected
                          ? "bg-brand-maroon-50 border-brand-maroon-700 text-slate-900 shadow-subtle ring-1 ring-brand-maroon-700 font-bold"
                          : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-brand-maroon-700 bg-brand-maroon-700"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        {v.colorCode && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: v.colorCode }}
                          />
                        )}
                        <span className="text-xs truncate">{v.name}</span>
                      </div>
                      <span className="text-xs font-bold text-brand-maroon-700 shrink-0 font-mono">
                        {formatPrice(variantPrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector & Live Total */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                পরিমাণ (Quantity):
              </span>
              <span className="text-[11px] text-slate-500">
                মোট বিল: <strong className="text-brand-maroon-700 font-extrabold">{formatPrice(itemSubtotal)}</strong>
              </span>
            </div>

            <div className="flex items-center border border-slate-200 rounded-full p-1 bg-white shadow-subtle">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-sm transition-colors min-h-[32px] min-w-[32px]"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-9 text-center font-bold text-xs sm:text-sm text-slate-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white flex items-center justify-center font-bold text-sm transition-colors min-h-[32px] min-w-[32px]"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Value Propositions / Delivery Trust Badges */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-emerald-50/60 p-2.5 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-emerald-950">ক্যাশ অন ডেলিভারি</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-emerald-950">সারাদেশে হোম ডেলিভারি</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 space-y-2.5 shrink-0">
          {/* Primary Action Button: Proceed to Checkout */}
          <button
            type="button"
            onClick={handleProceedToCheckout}
            className="w-full bg-brand-maroon-700 hover:bg-brand-maroon-800 active:scale-[0.99] text-white font-extrabold py-3.5 px-6 rounded-full shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wider group min-h-[48px]"
          >
            <span>অর্ডার করুন (Proceed to Checkout)</span>
            <ArrowRight className="w-4 h-4 text-brand-gold-300 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* Secondary Actions Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAddToBag}
              className="w-full bg-white hover:bg-slate-100 text-slate-800 font-bold py-2.5 px-3 rounded-full border border-slate-200 transition-all flex items-center justify-center gap-1.5 text-xs min-h-[40px]"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-brand-maroon-700 shrink-0" />
              <span>কার্টে যোগ করুন</span>
            </button>

            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-full transition-all flex items-center justify-center gap-1.5 text-xs min-h-[40px]"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
              <span>হোয়াটসঅ্যাপ অর্ডার</span>
            </a>
          </div>

          {/* Full product details link */}
          <div className="text-center pt-0.5">
            <Link
              href={`/products/${quickOrderProduct.slug}`}
              onClick={closeQuickOrder}
              className="text-[11px] text-slate-500 hover:text-brand-maroon-700 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span>বিস্তারিত বিবরণ ও রিভিউ দেখতে এখানে চাপুন</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
