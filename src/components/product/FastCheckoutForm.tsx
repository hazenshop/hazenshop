"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Phone,
  User,
  MapPin,
  MessageCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { DeliveryZone, Product, ProductVariant, SiteSettings } from "@/lib/types";
import {
  formatPrice,
  getDeliveryFee,
  generateOrderId,
  generateWhatsAppOrderUrl,
} from "@/lib/utils";
import { trackPurchase } from "@/lib/pixel";
import { useToast } from "@/context/ToastContext";

interface FastCheckoutFormProps {
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  settings: SiteSettings;
}

export default function FastCheckoutForm({
  product,
  selectedVariant,
  quantity,
  settings,
}: FastCheckoutFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>("dhaka");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unitPrice = selectedVariant
    ? selectedVariant.salePrice ?? selectedVariant.price
    : product.salePrice ?? product.price;

  const itemSubtotal = unitPrice * quantity;
  
  const deliveryFee = getDeliveryFee(deliveryZone, {
    dhaka: settings.dhakaDeliveryFee,
    outside_dhaka: settings.outsideDhakaDeliveryFee,
    suburbs: settings.suburbsDeliveryFee,
  });

  const isFreeDelivery = itemSubtotal >= settings.freeShippingThreshold;
  const appliedDeliveryFee = isFreeDelivery ? 0 : deliveryFee;
  const grandTotal = itemSubtotal + appliedDeliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast("Please enter your full name", "error");
      return;
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 11) {
      showToast("Please enter a valid 11-digit mobile number (e.g. 017XXXXXXXX)", "error");
      return;
    }

    if (!customerAddress.trim()) {
      showToast("Please enter your full delivery address", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = generateOrderId();
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
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            productImage: (selectedVariant?.image || product.images[0]) || "/logo.jpg",
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
            productId: product.id,
            productName: product.name,
            quantity,
            price: unitPrice,
          },
        ],
      });

      showToast("Order placed successfully. Cash on Delivery.", "success");
      router.push(`/order-success/${orderId}`);
    } catch (err) {
      console.error("Order submission error:", err);
      showToast("Something went wrong. Please try again or order on WhatsApp.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsAppUrl = generateWhatsAppOrderUrl(
    settings.whatsappNumber,
    [
      {
        name: product.name,
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
    <div id="fast-order" className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-brand-maroon-700/20 shadow-card space-y-5">

      {/* Header */}
      <div className="space-y-1 pb-3.5 border-b border-slate-100 bg-brand-maroon-50/60 -mx-5 sm:-mx-7 -mt-5 sm:-mt-7 p-4 sm:p-5 rounded-t-3xl border-b border-brand-maroon-100">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-maroon-700 bg-white px-2.5 py-0.5 rounded-full border border-brand-maroon-200">
            Express COD Order
          </span>
          <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            ১০০% ক্যাশ অন ডেলিভারি
          </span>
        </div>
        <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight pt-1">
          অর্ডার করতে তথ্য দিন (Cash on Delivery)
        </h3>
        <p className="text-xs text-slate-600 font-normal">
          কোন অগ্রিম টাকা লাগবে না। পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ করবেন।
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="space-y-4 pt-1">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            আপনার নাম (Full Name) <span className="text-rose-600 font-black">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              placeholder="আপনার পূর্ণ নাম লিখুন"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-slate-50/90 hover:bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium rounded-xl pl-10 pr-4 py-3 border border-slate-200 focus:border-brand-maroon-700 focus:ring-1 focus:ring-brand-maroon-700 focus:outline-none transition-all placeholder:text-slate-400 min-h-[44px]"
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            মোবাইল নাম্বার (Mobile Number) <span className="text-rose-600 font-black">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="tel"
              inputMode="tel"
              required
              placeholder="01XXXXXXXXX (১১ ডিজিট)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full bg-slate-50/90 hover:bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium rounded-xl pl-10 pr-4 py-3 border border-slate-200 focus:border-brand-maroon-700 focus:ring-1 focus:ring-brand-maroon-700 focus:outline-none transition-all placeholder:text-slate-400 font-mono min-h-[44px]"
            />
          </div>
        </div>

        {/* Full Delivery Address */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            সম্পূর্ণ ঠিকানা (Full Delivery Address) <span className="text-rose-600 font-black">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <textarea
              required
              rows={2}
              placeholder="বাসা নং, রোড নং, এলাকা, থানা ও জেলা"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full bg-slate-50/90 hover:bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium rounded-xl pl-10 pr-4 py-2.5 border border-slate-200 focus:border-brand-maroon-700 focus:ring-1 focus:ring-brand-maroon-700 focus:outline-none transition-all resize-none placeholder:text-slate-400 min-h-[56px]"
            />
          </div>
        </div>

        {/* Delivery Area Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            ডেলিভারি এরিয়া (Delivery Zone)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: "dhaka" as const, label: "ঢাকা সিটির ভেতর", sub: "Inside Dhaka", fee: settings.dhakaDeliveryFee },
              { id: "outside_dhaka" as const, label: "ঢাকার বাইরে", sub: "Outside Dhaka", fee: settings.outsideDhakaDeliveryFee },
              { id: "suburbs" as const, label: "ঢাকা উপশহর", sub: "Gazipur/Savar", fee: settings.suburbsDeliveryFee },
            ].map((zone) => (
              <label
                key={zone.id}
                onClick={() => setDeliveryZone(zone.id)}
                className={`p-3 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all min-h-[64px] ${
                  deliveryZone === zone.id
                    ? "border-brand-maroon-700 bg-brand-maroon-50/50 shadow-subtle ring-1 ring-brand-maroon-700"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">{zone.label}</span>
                    <span className="text-[10px] text-slate-400">{zone.sub}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      deliveryZone === zone.id ? "border-brand-maroon-700 bg-brand-maroon-700" : "border-slate-300"
                    }`}
                  >
                    {deliveryZone === zone.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <span className="text-xs font-extrabold text-brand-maroon-700 mt-1">
                  {isFreeDelivery ? "FREE" : formatPrice(zone.fee)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Order Summary Box */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>পণ্য: {product.name} ({quantity}টি)</span>
            <span className="font-semibold text-slate-900">{formatPrice(itemSubtotal)}</span>
          </div>
          {selectedVariant && (
            <div className="flex justify-between text-slate-500 font-normal">
              <span>বাছাইকৃত সাইজ:</span>
              <span className="font-medium text-slate-800">{selectedVariant.name}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>ডেলিভারি চার্জ:</span>
            <span className="font-semibold text-slate-900">
              {isFreeDelivery ? (
                <span className="text-emerald-700 font-bold">ফ্রি ডেলিভারি</span>
              ) : (
                formatPrice(appliedDeliveryFee)
              )}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
            <span>সর্বমোট পরিশোধযোগ্য (ক্যাশ অন ডেলিভারি):</span>
            <span className="text-xl font-heading font-extrabold text-brand-maroon-700">{formatPrice(grandTotal)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-maroon-700 hover:bg-brand-maroon-800 active:scale-[0.99] text-white font-bold py-4 px-6 rounded-full shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider group disabled:opacity-75 min-h-[48px]"
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
          className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-3 px-4 rounded-full border border-slate-200 transition-all flex items-center justify-center gap-2 text-xs min-h-[42px]"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>WhatsApp এ মেসেজ দিয়ে অর্ডার করুন</span>
        </a>

        {/* Trust Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1 text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>কোন অগ্রিম পেমেন্ট নেই • ডেলিভারিম্যানের সামনে প্যাকেট খুলে চেক করুন</span>
        </div>
      </form>
    </div>
  );
}


