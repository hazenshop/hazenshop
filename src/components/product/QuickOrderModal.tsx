"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Phone,
  User,
  MapPin,
  MessageCircle,
  Loader2,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { DeliveryZone, ProductVariant, SiteSettings } from "@/lib/types";
import {
  formatPrice,
  getDeliveryFee,
  generateOrderId,
  generateWhatsAppOrderUrl,
  calculateDiscountPercentage,
} from "@/lib/utils";
import { trackPurchase } from "@/lib/pixel";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

export default function QuickOrderModal({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const { quickOrderProduct, quickOrderVariant, closeQuickOrder } = useCart();
  const { showToast } = useToast();

  const [draftOrderId] = useState(() => generateOrderId());
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>("dhaka");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setIsSubmitting(false);
    }
  }, [quickOrderProduct, quickOrderVariant]);

  const unitPrice = quickOrderProduct
    ? (selectedVariant
        ? selectedVariant.salePrice ?? selectedVariant.price
        : quickOrderProduct.salePrice ?? quickOrderProduct.price)
    : 0;

  const originalPrice = quickOrderProduct
    ? (selectedVariant ? selectedVariant.price : quickOrderProduct.price)
    : 0;
  const discountPercent = calculateDiscountPercentage(originalPrice, unitPrice);

  const itemSubtotal = unitPrice * quantity;
  const deliveryFee = getDeliveryFee(deliveryZone, {
    dhaka: Number(settings?.dhakaDeliveryFee ?? 60),
    outside_dhaka: Number(settings?.outsideDhakaDeliveryFee ?? 120),
    suburbs: Number(settings?.suburbsDeliveryFee ?? 100),
  });

  const isFreeDelivery = itemSubtotal >= Number(settings?.freeShippingThreshold ?? 2500);
  const appliedDeliveryFee = isFreeDelivery ? 0 : deliveryFee;
  const grandTotal = itemSubtotal + appliedDeliveryFee;

  // Capture incomplete draft in background when customer enters 11-digit phone
  useEffect(() => {
    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length >= 11 && quickOrderProduct) {
      const timer = setTimeout(() => {
        fetch("/api/orders/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: draftOrderId,
            customerName: customerName.trim() || "Customer (Draft)",
            customerPhone: cleanPhone,
            customerAddress: customerAddress.trim() || "Incomplete Address",
            deliveryZone,
            deliveryFee: appliedDeliveryFee,
            subtotal: itemSubtotal,
            totalAmount: grandTotal,
            notes: "Incomplete Quick Order (Unsubmitted)",
            items: [
              {
                productId: quickOrderProduct.id,
                productName: quickOrderProduct.name,
                productSlug: quickOrderProduct.slug,
                productImage: (selectedVariant?.image || quickOrderProduct.images[0]) || "/logo.jpg",
                variantId: selectedVariant?.id,
                variantName: selectedVariant?.name,
                quantity,
                price: unitPrice,
                total: itemSubtotal,
              },
            ],
          }),
        }).catch(() => {});
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [customerPhone, customerName, customerAddress, deliveryZone, grandTotal, appliedDeliveryFee, itemSubtotal, unitPrice, quickOrderProduct, selectedVariant, quantity, draftOrderId]);

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

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast("আপনার পূর্ণ নাম লিখুন", "error");
      return;
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 11) {
      showToast("সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন 017XXXXXXXX)", "error");
      return;
    }

    if (!customerAddress.trim()) {
      showToast("আপনার ডেলিভারি ঠিকানা লিখুন", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = draftOrderId || generateOrderId();
      const orderData = {
        id: orderId,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerAddress: customerAddress.trim(),
        deliveryZone,
        deliveryFee: appliedDeliveryFee,
        subtotal: itemSubtotal,
        discount: 0,
        totalAmount: grandTotal,
        paymentMethod: "COD" as const,
        status: "pending" as const,
        notes: notes.trim() || undefined,
        items: [
          {
            productId: quickOrderProduct.id,
            productName: quickOrderProduct.name,
            productSlug: quickOrderProduct.slug,
            productImage: (selectedVariant?.image || quickOrderProduct.images[0]) || "/logo.jpg",
            variantId: selectedVariant?.id,
            variantName: selectedVariant?.name,
            quantity,
            price: unitPrice,
            total: itemSubtotal,
          },
        ],
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        throw new Error("Failed to place order");
      }

      // Track Facebook Pixel Purchase Event
      trackPurchase({
        id: orderId,
        totalAmount: grandTotal,
        items: [
          {
            productId: quickOrderProduct.id,
            productName: quickOrderProduct.name,
            quantity,
            price: unitPrice,
          },
        ],
      });

      showToast("অর্ডার সফলভাবে সম্পন্ন হয়েছে! ক্যাশ অন ডেলিভারি।", "success");
      closeQuickOrder();
      router.push(`/order-success/${orderId}`);
    } catch (err: unknown) {
      console.error("Quick order submission error:", err);
      // Record failed submission draft for admin follow-up
      fetch("/api/orders/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draftOrderId,
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          customerAddress: customerAddress.trim(),
          deliveryZone,
          totalAmount: grandTotal,
          notes: `Failed Submission Attempt (${err instanceof Error ? err.message : "Network error"})`,
        }),
      }).catch(() => {});
      showToast("অর্ডার প্রসেস করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন বা হোয়াটসঅ্যাপে অর্ডার দিন।", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsAppUrl = generateWhatsAppOrderUrl(
    settings.whatsappNumber,
    [
      {
        name: quickOrderProduct.name,
        variant: selectedVariant?.name,
        quantity,
        price: unitPrice,
      },
    ],
    grandTotal,
    {
      name: customerName,
      phone: customerPhone,
      address: customerAddress,
    }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click dismiss */}
      <div className="fixed inset-0" onClick={closeQuickOrder} aria-hidden="true" />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-floating border border-black/10 overflow-hidden z-10 my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-brand-maroon-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-heading font-extrabold text-sm sm:text-base tracking-tight text-white">
              দ্রুত ক্যাশ অন ডেলিভারি অর্ডার (Quick Order)
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* 1. Selected Product Summary Banner */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
              <Image
                src={(selectedVariant?.image || quickOrderProduct.images[0]) || "/logo.jpg"}
                alt={quickOrderProduct.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-brand-maroon-700 bg-brand-maroon-50 px-2 py-0.2 rounded">
                  {quickOrderProduct.categoryName}
                </span>
                {quickOrderProduct.badge && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-900 bg-brand-gold-300 px-2 py-0.2 rounded">
                    {quickOrderProduct.badge}
                  </span>
                )}
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                {quickOrderProduct.name}
              </h4>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-sm sm:text-base font-extrabold text-brand-maroon-700">
                  {formatPrice(unitPrice)}
                </span>
                {originalPrice > unitPrice && (
                  <>
                    <span className="text-xs text-slate-400 line-through font-normal">
                      {formatPrice(originalPrice)}
                    </span>
                    <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 2. Step 1: Select Size / Option / Variant */}
          {quickOrderProduct.variants && quickOrderProduct.variants.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <label className="font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-brand-maroon-700" />
                  <span>সাইজ / অপশন বাছাই করুন (Select Variant):</span>
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
                      <span className="text-xs font-bold text-brand-maroon-700 shrink-0">
                        {formatPrice(variantPrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Quantity Stepper */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              পরিমাণ (Quantity):
            </span>
            <div className="flex items-center border border-slate-200 rounded-full p-1 bg-slate-50">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-sm transition-colors shadow-subtle min-h-[32px] min-w-[32px]"
              >
                -
              </button>
              <span className="w-9 text-center font-bold text-xs sm:text-sm text-slate-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white flex items-center justify-center font-bold text-sm transition-colors shadow-subtle min-h-[32px] min-w-[32px]"
              >
                +
              </button>
            </div>
          </div>

          {/* 4. Step 2: Cash On Delivery Customer Form */}
          <form onSubmit={handleSubmitOrder} className="space-y-4 pt-2 border-t border-slate-100">
            <div className="bg-brand-maroon-50/60 p-3 rounded-2xl border border-brand-maroon-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ)
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  অর্ডার করতে নিচের তথ্যগুলো পূরণ করুন
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                ১০০% COD
              </span>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                আপনার নাম (Full Name) <span className="text-rose-600 font-black">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="আপনার পূর্ণ নাম লিখুন"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 focus:border-brand-maroon-700 focus:ring-1 focus:ring-brand-maroon-700 focus:outline-none transition-all placeholder:text-slate-400 min-h-[40px]"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                মোবাইল নাম্বার (Mobile Number) <span className="text-rose-600 font-black">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  inputMode="tel"
                  required
                  placeholder="01XXXXXXXXX (১১ ডিজিট)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 focus:border-brand-maroon-700 focus:ring-1 focus:ring-brand-maroon-700 focus:outline-none transition-all placeholder:text-slate-400 font-mono min-h-[40px]"
                />
              </div>
            </div>

            {/* Full Delivery Address */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                সম্পূর্ণ ঠিকানা (Full Delivery Address) <span className="text-rose-600 font-black">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  required
                  rows={2}
                  placeholder="বাসা নং, রোড নং, এলাকা, থানা ও জেলা"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium rounded-xl pl-9 pr-3 py-2 border border-slate-200 focus:border-brand-maroon-700 focus:ring-1 focus:ring-brand-maroon-700 focus:outline-none transition-all resize-none placeholder:text-slate-400 min-h-[48px]"
                />
              </div>
            </div>

            {/* Delivery Zone Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                ডেলিভারি এরিয়া (Delivery Zone):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: "dhaka" as const, label: "ঢাকা সিটির ভেতর", sub: "Inside Dhaka", fee: Number(settings?.dhakaDeliveryFee ?? 60) },
                  { id: "outside_dhaka" as const, label: "ঢাকার বাইরে", sub: "Outside Dhaka", fee: Number(settings?.outsideDhakaDeliveryFee ?? 120) },
                  { id: "suburbs" as const, label: "ঢাকা উপশহর", sub: "Gazipur/Savar", fee: Number(settings?.suburbsDeliveryFee ?? 100) },
                ].map((zone) => (
                  <label
                    key={zone.id}
                    onClick={() => setDeliveryZone(zone.id)}
                    className={`p-2.5 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all min-h-[56px] ${
                      deliveryZone === zone.id
                        ? "border-brand-maroon-700 bg-brand-maroon-50/70 ring-1 ring-brand-maroon-700"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block leading-tight">{zone.label}</span>
                        <span className="text-[9px] text-slate-400">{zone.sub}</span>
                      </div>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          deliveryZone === zone.id ? "border-brand-maroon-700 bg-brand-maroon-700" : "border-slate-300"
                        }`}
                      >
                        {deliveryZone === zone.id && <div className="w-1 h-1 rounded-full bg-white" />}
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-brand-maroon-700 mt-1">
                      {isFreeDelivery ? "FREE" : formatPrice(zone.fee)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Order Cost Breakdown */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>পণ্য মূল্য ({quantity}টি):</span>
                <span className="font-semibold text-slate-900">{formatPrice(itemSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-semibold text-slate-900">
                  {isFreeDelivery ? <span className="text-emerald-700 font-bold">ফ্রি ডেলিভারি</span> : formatPrice(appliedDeliveryFee)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
                <span>সর্বমোট বিল (ক্যাশ অন ডেলিভারি):</span>
                <span className="text-lg font-heading font-extrabold text-brand-maroon-700">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-maroon-700 hover:bg-brand-maroon-800 active:scale-[0.99] text-white font-extrabold py-3.5 px-6 rounded-full shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wider group disabled:opacity-75 min-h-[46px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>অর্ডার প্রসেস হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-brand-gold-300 group-hover:scale-110 transition-transform shrink-0" />
                  <span>অর্ডার নিশ্চিত করুন (ক্যাশ অন ডেলিভারি)</span>
                </>
              )}
            </button>

            {/* WhatsApp Alternative */}
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-full border border-slate-200 transition-all flex items-center justify-center gap-2 text-xs min-h-[40px]"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>হোয়াটসঅ্যাপে অর্ডার করুন</span>
            </a>

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-0.5 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>কোন অগ্রিম টাকা লাগবে না • ডেলিভারি পেয়ে মূল্য পরিশোধ করবেন</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
