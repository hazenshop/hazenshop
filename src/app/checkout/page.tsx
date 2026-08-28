"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Phone,
  User,
  MapPin,
  Trash2,
  ArrowLeft,
  Loader2,
  Lock,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { DeliveryZone, SiteSettings } from "@/lib/types";
import { formatPrice, getDeliveryFee, generateOrderId } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { showToast } = useToast();

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>("dhaka");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(console.error);
  }, []);

  const deliveryFee = settings
    ? getDeliveryFee(deliveryZone, {
        dhaka: settings.dhakaDeliveryFee,
        outside_dhaka: settings.outsideDhakaDeliveryFee,
        suburbs: settings.suburbsDeliveryFee,
      })
    : 60;

  const isFreeDelivery = settings ? subtotal >= settings.freeShippingThreshold : false;
  const appliedDeliveryFee = isFreeDelivery ? 0 : deliveryFee;
  const grandTotal = subtotal + appliedDeliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast("Your bag is empty", "error");
      return;
    }

    if (!customerName.trim()) {
      showToast("Please enter your full name", "error");
      return;
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 11) {
      showToast("Please enter a valid 11-digit mobile number", "error");
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
        subtotal,
        discount: 0,
        totalAmount: grandTotal,
        paymentMethod: "COD" as const,
        status: "pending" as const,
        notes: notes.trim() || undefined,
        items: cart,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        throw new Error("Failed to create order");
      }

      clearCart();
      showToast("Order placed successfully. Cash on Delivery.", "success");
      router.push(`/order-success/${orderId}`);
    } catch (err) {
      console.error(err);
      showToast("Failed to place order. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="font-heading font-extrabold text-xl text-slate-900">Your bag is currently empty</h2>
        <p className="text-xs text-slate-500 font-normal">
          Select pieces from our luxury bed linen collections to proceed.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-brand-dark hover:bg-brand-charcoal text-white font-medium text-xs px-6 py-3 rounded-full shadow-subtle transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse All Collections</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-dark transition-colors min-h-[36px] py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Collections</span>
        </Link>
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-700 font-medium bg-slate-100/80 px-2.5 sm:px-3 py-1.5 rounded-full border border-slate-200/60">
          <Lock className="w-3 h-3 text-slate-500" />
          <span>Cash on Delivery Guaranteed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* Customer Information Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-4 sm:p-8 border border-black/[0.06] shadow-subtle space-y-5 sm:space-y-6">
            <div className="space-y-1 pb-3 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600">
                Step 1 of 2
              </span>
              <h2 className="font-heading font-extrabold text-lg sm:text-2xl text-slate-900 tracking-tight">
                Delivery Details (অর্ডার তথ্য)
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                No advance payment or card needed. Inspect your package upon arrival.
              </p>
            </div>


            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name (আপনার নাম) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium rounded-xl pl-10 pr-4 py-3 border border-slate-200/80 focus:border-brand-dark focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Number (১১ ডিজিট মোবাইল নাম্বার) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    inputMode="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium rounded-xl pl-10 pr-4 py-3 border border-slate-200/80 focus:border-brand-dark focus:outline-none transition-all placeholder:text-slate-400 font-mono"
                  />
                </div>
              </div>

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

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Delivery Zone (ডেলিভারি এরিয়া)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: "dhaka" as const, label: "Inside Dhaka", fee: settings?.dhakaDeliveryFee || 60 },
                    { id: "outside_dhaka" as const, label: "Outside Dhaka", fee: settings?.outsideDhakaDeliveryFee || 120 },
                    { id: "suburbs" as const, label: "Suburbs / Gazipur", fee: settings?.suburbsDeliveryFee || 100 },
                  ].map((zone) => (
                    <label
                      key={zone.id}
                      onClick={() => setDeliveryZone(zone.id)}
                      className={`p-3 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                        deliveryZone === zone.id
                          ? "border-brand-dark bg-slate-50 shadow-subtle ring-1 ring-brand-dark"
                          : "border-slate-200/80 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span className="text-xs font-semibold text-slate-900">{zone.label}</span>
                      <span className="text-xs font-bold text-slate-900 mt-1">
                        {isFreeDelivery ? "FREE" : formatPrice(zone.fee)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Special instructions / notes (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50/70 text-xs rounded-xl px-4 py-2.5 border border-slate-200/80 focus:bg-white focus:border-brand-dark focus:outline-none"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Order Items & Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-subtle space-y-5">
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 pb-3 border-b border-slate-100">
              Order Summary ({cart.length} Items)
            </h3>

            {/* Item List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || "default"}`}
                  className="flex gap-3 items-center justify-between p-2.5 rounded-2xl bg-slate-50/60 border border-slate-100"
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-[#f4f2ee]">
                    <Image src={item.productImage || "/logo.jpg"} alt={item.productName} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-slate-900 truncate">{item.productName}</h4>
                    {item.variantName && (
                      <p className="text-[11px] text-slate-500 font-normal">{item.variantName}</p>
                    )}
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {formatPrice(item.price)} × {item.quantity} = {formatPrice(item.total)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId, item.variantId)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery Charge</span>
                <span className="font-semibold text-slate-900">
                  {isFreeDelivery ? (
                    <span className="text-emerald-700 font-semibold">Complimentary</span>
                  ) : (
                    formatPrice(appliedDeliveryFee)
                  )}
                </span>
              </div>
              <div className="border-t border-slate-200/80 pt-3 flex justify-between items-center text-sm font-extrabold text-brand-dark">
                <span>Total Payable (ক্যাশ অন ডেলিভারি):</span>
                <span className="text-xl font-heading font-extrabold text-brand-dark">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              form="checkout-form"
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-dark hover:bg-brand-charcoal active:scale-[0.99] text-white font-medium py-3.5 px-6 rounded-full shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wider group disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-brand-400" />
                  <span>Confirm Cash on Delivery Order</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Inspect package before giving cash</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

