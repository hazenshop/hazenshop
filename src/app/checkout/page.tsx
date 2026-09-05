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
  ShoppingBag,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { DeliveryZone, SiteSettings } from "@/lib/types";
import { formatPrice, getDeliveryFee, generateOrderId } from "@/lib/utils";
import { trackInitiateCheckout, trackPurchase } from "@/lib/pixel";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { showToast } = useToast();

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [draftOrderId] = useState(() => generateOrderId());
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>("dhaka");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      trackInitiateCheckout(subtotal, cart.length);
    }
  }, []);

  const deliveryFee = settings
    ? getDeliveryFee(deliveryZone, {
        dhaka: Number(settings.dhakaDeliveryFee ?? 60),
        outside_dhaka: Number(settings.outsideDhakaDeliveryFee ?? 120),
        suburbs: Number(settings.suburbsDeliveryFee ?? 100),
      })
    : 60;

  const isFreeDelivery = settings ? subtotal >= Number(settings.freeShippingThreshold ?? 2500) : false;
  const appliedDeliveryFee = isFreeDelivery ? 0 : deliveryFee;
  const grandTotal = subtotal + appliedDeliveryFee;

  // Capture incomplete checkout draft in background when phone is entered
  useEffect(() => {
    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length >= 11 && cart.length > 0) {
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
            subtotal,
            totalAmount: grandTotal,
            notes: "Incomplete Full Checkout Page (Unsubmitted)",
            items: cart,
          }),
        }).catch(() => {});
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [customerPhone, customerName, customerAddress, deliveryZone, grandTotal, cart, subtotal, appliedDeliveryFee, draftOrderId]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast("আপনার ব্যাগ খালি। পণ্য বাছাই করুন।", "error");
      return;
    }

    if (!customerName.trim()) {
      showToast("দয়া করে আপনার পূর্ণ নাম লিখুন", "error");
      return;
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 11) {
      showToast("দয়া করে সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন", "error");
      return;
    }

    if (!customerAddress.trim()) {
      showToast("দয়া করে সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন", "error");
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

      // Track Facebook Pixel Purchase Event
      trackPurchase({
        id: orderId,
        totalAmount: grandTotal,
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      clearCart();
      showToast("অর্ডার সফল হয়েছে! ক্যাশ অন ডেলিভারিতে পাঠানো হচ্ছে।", "success");
      router.push(`/order-success/${orderId}`);
    } catch (err: unknown) {
      console.error(err);
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
          notes: `Failed Checkout Attempt (${err instanceof Error ? err.message : "Network error"})`,
          items: cart,
        }),
      }).catch(() => {});
      showToast("অর্ডার প্রসেস করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="font-heading font-extrabold text-xl text-slate-900">আপনার ব্যাগ বর্তমানে খালি</h2>
        <p className="text-xs text-slate-500 font-normal">
          আমাদের প্রিমিয়াম বেডশিট ও জানালার পর্দা কালেকশন থেকে পছন্দসই পণ্য বাছাই করুন।
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white font-bold text-xs px-6 py-3.5 rounded-full shadow-card transition-all min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>কালেকশন দেখুন (Browse Collections)</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-8 pb-28 md:pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-maroon-700 transition-colors min-h-[36px] py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>কালেকশনে ফিরে যান</span>
        </Link>
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>১০০% ক্যাশ অন ডেলিভারি</span>
        </div>
      </div>

      {/* Mobile Collapsible Order Summary Bar */}
      <div className="lg:hidden bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
        <button
          type="button"
          onClick={() => setShowMobileSummary(!showMobileSummary)}
          className="w-full p-4 flex items-center justify-between bg-slate-50/80 text-xs font-bold text-slate-800"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand-maroon-700" />
            <span>অর্ডারের পণ্যসমূহ ({cart.length} টি)</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showMobileSummary ? "rotate-180" : ""}`} />
          </div>
          <span className="font-extrabold text-sm text-brand-maroon-700">{formatPrice(grandTotal)}</span>
        </button>

        {showMobileSummary && (
          <div className="p-4 space-y-3 border-t border-slate-100 bg-white">
            {cart.map((item) => (
              <div
                key={`${item.productId}-${item.variantId || "default"}`}
                className="flex gap-3 items-center justify-between text-xs"
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-50">
                  <Image src={item.productImage || "/logo.jpg"} alt={item.productName} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 truncate">{item.productName}</h4>
                  {item.variantName && <p className="text-[11px] text-slate-500">{item.variantName}</p>}
                  <p className="text-[11px] text-slate-500">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <span className="font-bold text-slate-900">{formatPrice(item.total)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500 font-medium">
              <span>ডেলিভারি চার্জ:</span>
              <span className="font-bold text-slate-800">
                {isFreeDelivery ? "ফ্রি" : formatPrice(appliedDeliveryFee)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* Customer Information Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-brand-maroon-700/10 shadow-card space-y-5 sm:space-y-6">
            <div className="space-y-1 pb-3.5 border-b border-brand-maroon-100 bg-brand-maroon-50/50 -mx-5 sm:-mx-8 -mt-5 sm:-mt-8 p-5 sm:p-7 rounded-t-3xl">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-maroon-700 bg-white px-2.5 py-0.5 rounded-full border border-brand-maroon-200">
                নিরাপদ চেকআউট
              </span>
              <h2 className="font-heading font-extrabold text-lg sm:text-2xl text-slate-900 tracking-tight pt-1">
                ডেলিভারি ঠিকানা ও তথ্য (Cash on Delivery)
              </h2>
              <p className="text-xs text-slate-600 font-normal">
                কোন অগ্রিম পেমেন্ট লাগবে না। পণ্য হাতে পেয়ে চেক করে টাকা পরিশোধ করবেন।
              </p>
            </div>

            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
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

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  ডেলিভারি এরিয়া (Delivery Zone)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: "dhaka" as const, label: "ঢাকা সিটির ভেতর", sub: "Inside Dhaka", fee: settings?.dhakaDeliveryFee ?? 60 },
                    { id: "outside_dhaka" as const, label: "ঢাকার বাইরে", sub: "Outside Dhaka", fee: settings?.outsideDhakaDeliveryFee ?? 120 },
                    { id: "suburbs" as const, label: "ঢাকা উপশহর", sub: "Gazipur/Savar", fee: settings?.suburbsDeliveryFee ?? 100 },
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

              <div>
                <input
                  type="text"
                  placeholder="বিশেষ কোনো নির্দেশনা থাকলে লিখুন (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 text-xs rounded-xl px-4 py-3 border border-slate-200 focus:bg-white focus:border-brand-maroon-700 focus:outline-none min-h-[44px]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-maroon-700 hover:bg-brand-maroon-800 active:scale-[0.99] text-white font-extrabold py-4 px-6 rounded-full shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider group disabled:opacity-75 min-h-[50px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>অর্ডার প্রসেস হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-brand-gold-300 group-hover:scale-110 transition-transform shrink-0" />
                    <span>অর্ডার নিশ্চিত করুন ({formatPrice(grandTotal)})</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Order Items & Summary (Desktop 5 cols) */}
        <div className="hidden lg:block lg:col-span-5 space-y-6">
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
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
                <span>সর্বমোট পরিশোধযোগ্য:</span>
                <span className="text-xl font-heading font-extrabold text-brand-maroon-700">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ডেলিভারির সময় প্যাকেট খুলে দেখে পেমেন্ট করুন</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
