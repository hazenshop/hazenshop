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
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#121316", "#b8873f", "#d4af37", "#64748b"],
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 pb-20">
      {/* Success Badge Banner */}
      <div className="bg-brand-dark text-white rounded-3xl p-8 sm:p-10 text-center shadow-card border border-white/10 space-y-4 relative overflow-hidden">
        <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-brand-300">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400">
            Order Confirmation
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ধন্যবাদ! আপনার অর্ডারটি গ্রহণ করা হয়েছে
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto font-normal">
            Our concierge team will verify details and prepare your package for swift delivery.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 text-xs">
          <span className="text-slate-400">Order Reference:</span>
          <span className="font-mono font-bold text-white text-sm">{orderId}</span>
        </div>
      </div>

      {/* Order Summary & Tracking Box */}
      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-subtle space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Recipient</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-900">{order.customerName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Phone</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-900">{order.customerPhone}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Payment Term</span>
              <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-full">
                Cash On Delivery
              </span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex items-start gap-3 text-xs">
            <MapPin className="w-4 h-4 text-brand-dark shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 block mb-0.5">Delivery Address:</span>
              <span className="text-slate-600 font-normal">{order.customerAddress}</span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Ordered Items</h3>
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-[#f4f2ee]">
                    <Image src={item.productImage || "/logo.jpg"} alt={item.productName} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{item.productName}</h4>
                    {item.variantName && (
                      <p className="text-[11px] text-slate-400 font-normal">{item.variantName}</p>
                    )}
                    <span className="text-[11px] text-slate-400">Qty: {item.quantity}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-900">{formatPrice(item.total)}</span>
              </div>
            ))}
          </div>

          {/* Total Breakdown */}
          <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Delivery Fee:</span>
              <span className="font-semibold text-slate-900">{order.deliveryFee === 0 ? "Complimentary" : formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="border-t border-slate-200/80 pt-3 flex justify-between items-center text-xs sm:text-sm font-extrabold text-brand-dark">
              <span>Total Payable upon Delivery:</span>
              <span className="text-lg font-heading font-extrabold text-brand-dark">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={`/track-order?id=${orderId}`}
          className="flex-1 bg-brand-dark hover:bg-brand-charcoal text-white font-medium py-3.5 px-6 rounded-full shadow-subtle hover:shadow-card transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-center"
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Track Parcel Live</span>
        </Link>

        <Link
          href="/"
          className="bg-white hover:bg-slate-50 text-slate-800 font-medium py-3.5 px-6 rounded-full border border-black/[0.08] shadow-subtle transition-all flex items-center justify-center gap-2 text-xs text-center"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
          <span>Continue Exploring</span>
        </Link>
      </div>
    </div>
  );
}

