"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Truck,
  MapPin,
  ShoppingBag,
  Printer,
  MessageCircle,
  PhoneCall,
  Clock,
} from "lucide-react";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#7A1C2C", "#b8873f", "#d4af37", "#10b981"],
      });
    } catch (e) {
      console.error(e);
    }

    if (orderId) {
      fetch(`/api/orders?id=${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.order) setOrder(data.order);
        })
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const whatsappInquiryUrl = `https://wa.me/8801700000000?text=${encodeURIComponent(
    `Hello Hazen! I just placed order #${orderId}. Please let me know when it will be dispatched.`
  )}`;

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-6 sm:space-y-8 pb-20">
      {/* Success Badge Banner */}
      <div className="bg-brand-maroon-700 text-white rounded-3xl p-6 sm:p-10 text-center shadow-card border border-white/10 space-y-4 relative overflow-hidden">
        <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-brand-gold-300">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-gold-300 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
            অর্ডার সফল হয়েছে (Order Confirmed)
          </span>
          <h1 className="font-heading text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            ধন্যবাদ! আপনার ক্যাশ অন ডেলিভারি অর্ডারটি গ্রহণ করা হয়েছে
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-md mx-auto font-normal">
            আমাদের কাস্টমার কেয়ার প্রতিনিধি আপনার সাথে যোগাযোগ করে দ্রুত পার্সেল ডেলিভারির ব্যবস্থা করবেন।
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full border border-white/15 text-xs">
          <span className="text-slate-300">অর্ডার রেফারেন্স নং:</span>
          <span className="font-mono font-bold text-white text-sm tracking-wider">{orderId}</span>
        </div>
      </div>

      {/* Order Summary & Tracking Box */}
      {order && (
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-brand-maroon-700/10 shadow-subtle space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">গ্রাহকের নাম</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900">{order.customerName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">মোবাইল নাম্বার</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono">{order.customerPhone}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">পেমেন্ট মেথড</span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ১০০% ক্যাশ অন ডেলিভারি
              </span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs">
            <MapPin className="w-4 h-4 text-brand-maroon-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block mb-0.5">ডেলিভারি ঠিকানা:</span>
              <span className="text-slate-700 font-normal">{order.customerAddress}</span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">অর্ডারকৃত পণ্য তালিকা</h3>
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-white">
                    <Image src={item.productImage || "/logo.jpg"} alt={item.productName} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.productName}</h4>
                    {item.variantName && (
                      <p className="text-[11px] text-slate-500 font-medium">{item.variantName}</p>
                    )}
                    <span className="text-[11px] text-slate-500">পরিমাণ: {item.quantity}টি</span>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-brand-maroon-700">{formatPrice(item.total)}</span>
              </div>
            ))}
          </div>

          {/* Total Breakdown */}
          <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>পণ্যের মোট মূল্য (Subtotal):</span>
              <span className="font-bold text-slate-900">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>ডেলিভারি চার্জ:</span>
              <span className="font-bold text-slate-900">
                {order.deliveryFee === 0 ? <span className="text-emerald-700 font-bold">ফ্রি ডেলিভারি</span> : formatPrice(order.deliveryFee)}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm font-extrabold text-slate-900">
              <span>সর্বমোট পরিশোধযোগ্য (ক্যাশ অন ডেলিভারি):</span>
              <span className="text-xl font-heading font-extrabold text-brand-maroon-700">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Expectations Note */}
      <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 text-xs text-slate-700 flex items-start gap-3">
        <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-emerald-900 block mb-0.5">ডেলিভারি সময়সীমা:</span>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            ঢাকা সিটির ভেতর ২৪-৪৮ ঘন্টার মধ্যে এবং ঢাকার বাইরে ২-৩ দিনের মধ্যে আপনার ঠিকানায় পার্সেল পৌঁছে দেওয়া হবে।
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href={`/track-order?id=${orderId}`}
          className="bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white font-bold py-3.5 px-4 rounded-full shadow-card transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-center min-h-[44px]"
        >
          <Truck className="w-4 h-4 text-brand-gold-300" />
          <span>পার্সেল ট্র্যাক করুন</span>
        </Link>

        <a
          href={whatsappInquiryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-full shadow-card transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-center min-h-[44px]"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp এ কথা বলুন</span>
        </a>

        <button
          type="button"
          onClick={handlePrint}
          className="bg-white hover:bg-slate-50 text-slate-800 font-bold py-3.5 px-4 rounded-full border border-slate-200 shadow-subtle transition-all flex items-center justify-center gap-2 text-xs text-center min-h-[44px]"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>মেমো প্রিন্ট করুন</span>
        </button>
      </div>
    </div>
  );
}


