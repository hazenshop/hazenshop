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
    <div id="fast-order" className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-card space-y-6">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-slate-100">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600">
          Direct Express Checkout
        </span>
        <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-brand-dark tracking-tight">
          Delivery Details (অর্ডার তথ্য)
        </h3>
        <p className="text-xs text-slate-500 font-normal">
          No advance payment or card required. Pay cash upon delivery.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Name (আপনার নাম) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              placeholder="e.g. Rakib Ahmed"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium rounded-xl pl-10 pr-4 py-3 border border-slate-200/80 focus:border-brand-dark focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Mobile Number (১১ ডিজিট মোবাইল নাম্বার) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="tel"
              required
              placeholder="017XXXXXXXX"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium rounded-xl pl-10 pr-4 py-3 border border-slate-200/80 focus:border-brand-dark focus:outline-none transition-all placeholder:text-slate-400 font-mono"
            />
          </div>
        </div>

        {/* Full Delivery Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Delivery Address (সম্পূর্ণ ঠিকানা) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <textarea
              required
              rows={2}
              placeholder="House, Road, Area, Thana & District (বাসা নং, রোড নং, এলাকা, থানা ও জেলা)"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium rounded-xl pl-10 pr-4 py-2.5 border border-slate-200/80 focus:border-brand-dark focus:outline-none transition-all resize-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Delivery Area Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Delivery Zone (ডেলিভারি এরিয়া)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: "dhaka" as const, label: "Inside Dhaka", fee: settings.dhakaDeliveryFee },
              { id: "outside_dhaka" as const, label: "Outside Dhaka", fee: settings.outsideDhakaDeliveryFee },
              { id: "suburbs" as const, label: "Suburbs / Gazipur", fee: settings.suburbsDeliveryFee },
            ].map((zone) => (
              <label
                key={zone.id}
                onClick={() => setDeliveryZone(zone.id)}
                className={`p-3 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                  deliveryZone === zone.id
                    ? "border-brand-dark bg-slate-50 shadow-subtle"
                    : "border-slate-200/80 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">{zone.label}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      deliveryZone === zone.id ? "border-brand-dark bg-brand-dark" : "border-slate-300"
                    }`}
                  >
                    {deliveryZone === zone.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-900 mt-1">
                  {isFreeDelivery ? "FREE" : formatPrice(zone.fee)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Delivery Notes */}
        <div>
          <input
            type="text"
            placeholder="Special instructions / notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-50/70 text-xs rounded-xl px-4 py-2.5 border border-slate-200/80 focus:bg-white focus:border-brand-dark focus:outline-none"
          />
        </div>

        {/* Order Summary Box */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Item: {product.name} ({quantity}x)</span>
            <span className="font-semibold text-slate-900">{formatPrice(itemSubtotal)}</span>
          </div>
          {selectedVariant && (
            <div className="flex justify-between text-slate-500 font-normal">
              <span>Selected Variant:</span>
              <span className="font-medium text-slate-700">{selectedVariant.name}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Delivery Fee:</span>
            <span className="font-semibold text-slate-900">
              {isFreeDelivery ? (
                <span className="text-emerald-700 font-semibold">Complimentary</span>
              ) : (
                formatPrice(appliedDeliveryFee)
              )}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200/80 flex justify-between items-center text-sm font-extrabold text-brand-dark">
            <span>Total Payable (ক্যাশ অন ডেলিভারি):</span>
            <span className="text-lg font-heading font-extrabold text-brand-dark">{formatPrice(grandTotal)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-dark hover:bg-brand-charcoal active:scale-[0.99] text-white font-medium py-3.5 px-6 rounded-full shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider group disabled:opacity-75"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Placing Order...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
              <span>Confirm Order • Cash on Delivery</span>
            </>
          )}
        </button>

        {/* WhatsApp Alternative */}
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-2.5 px-4 rounded-full border border-slate-200/80 transition-all flex items-center justify-center gap-2 text-xs"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Order via WhatsApp Concierge</span>
        </a>

        {/* Trust Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>No advance payment needed • Inspect package before payment</span>
        </div>
      </form>
    </div>
  );
}

