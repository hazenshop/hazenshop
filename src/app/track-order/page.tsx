"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Order, OrderStatus } from "@/lib/types";
import { formatPrice, getStatusColor } from "@/lib/utils";

const timelineSteps: { status: OrderStatus; label: string; desc: string }[] = [
  { status: "pending", label: "Order Placed", desc: "Received and awaiting confirmation" },
  { status: "confirmed", label: "Order Confirmed", desc: "Verified with customer" },
  { status: "packaging", label: "Packaging & QC", desc: "Quality checked and safely packed" },
  { status: "shipped", label: "In Transit", desc: "Handed over to courier partner" },
  { status: "delivered", label: "Delivered", desc: "Successfully delivered to customer" },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";
  const [query, setQuery] = useState(initialId);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchTracking = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const cleanQuery = q.trim();
      const isPhone = /^[0-9+]+$/.test(cleanQuery);

      let res = await fetch(`/api/orders?${isPhone ? "phone=" : "id="}${encodeURIComponent(cleanQuery)}`);
      let data = await res.json();

      if (!data.order && (!data.orders || data.orders.length === 0)) {
        res = await fetch(`/api/orders?${isPhone ? "id=" : "phone="}${encodeURIComponent(cleanQuery)}`);
        data = await res.json();
      }

      if (data.order) {
        setOrders([data.order]);
      } else if (data.orders && data.orders.length > 0) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error(e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchTracking(initialId);
    }
  }, [initialId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(query);
  };

  const getStepStatus = (currentStatus: OrderStatus, stepStatus: OrderStatus) => {
    const statusOrder: OrderStatus[] = [
      "pending",
      "confirmed",
      "packaging",
      "shipped",
      "out_for_delivery",
      "delivered",
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (currentStatus === "cancelled" || currentStatus === "returned") {
      return "cancelled";
    }

    if (currentIndex >= stepIndex) return "completed";
    return "upcoming";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 pb-20">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-slate-100 text-brand-dark border border-slate-200/60 mb-1">
          <Truck className="w-6 h-6 stroke-[1.75]" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
          Track Your Parcel (অর্ডার ট্র্যাক করুন)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto font-normal">
          Enter your 11-digit Mobile Number or Order ID (e.g. HZ-82914) to view live status updates.
        </p>
      </div>

      {/* Search Input Box */}
      <form
        onSubmit={handleSearch}
        className="max-w-xl mx-auto relative flex items-center shadow-subtle rounded-full overflow-hidden border border-black/[0.08] bg-white"
      >
        <input
          type="text"
          required
          inputMode="text"
          placeholder="Enter Mobile Number or Order ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full text-xs sm:text-sm py-3.5 sm:py-4 pl-5 pr-28 focus:outline-none text-slate-900 font-medium placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-1.5 bg-brand-dark hover:bg-brand-charcoal text-white font-medium px-5 py-2 sm:py-2.5 rounded-full transition-all flex items-center gap-1.5 disabled:opacity-50 text-xs shadow-subtle"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          <span>Track</span>
        </button>
      </form>

      {/* Results */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-dark" />
          <p className="text-xs font-medium">Looking up order status...</p>
        </div>
      ) : searched && orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-black/[0.06] shadow-subtle space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-heading font-semibold text-base text-slate-800">No Orders Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-normal">
            We could not find any order with &quot;{query}&quot;. Please verify your mobile number or Order ID.
          </p>
        </div>
      ) : (
        orders.map((order) => {
          const statusStyle = getStatusColor(order.status);

          return (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-subtle space-y-6 sm:space-y-8"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-heading text-lg sm:text-xl font-extrabold text-slate-900">
                      Order #{order.id}
                    </h2>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-normal">
                    Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "long" })}
                  </p>
                </div>

                {/* Courier info */}
                {order.courierName && (
                  <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-200/60 text-xs w-full sm:w-auto">
                    <span className="text-slate-400 block font-normal text-[10px]">Courier Partner:</span>
                    <span className="font-semibold text-slate-800">{order.courierName}</span>
                    {order.trackingCode && (
                      <span className="block font-mono text-brand-dark font-bold mt-0.5 text-[11px]">
                        ID: {order.trackingCode}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Progress Timeline */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Live Dispatch Timeline
                </h3>

                {/* Mobile Vertical Timeline */}
                <div className="space-y-2.5 sm:hidden">
                  {timelineSteps.map((step, idx) => {
                    const statusType = getStepStatus(order.status, step.status);
                    const isCompleted = statusType === "completed";

                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                          isCompleted
                            ? "bg-slate-50 border-brand-dark text-slate-900"
                            : "bg-white border-slate-100 text-slate-400"
                        }`}
                      >
                        <div className="pt-0.5">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-xs font-semibold ${isCompleted ? "text-slate-900" : "text-slate-500"}`}>
                              {step.label}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop 5-Column Grid */}
                <div className="hidden sm:grid sm:grid-cols-5 gap-3">
                  {timelineSteps.map((step, idx) => {
                    const statusType = getStepStatus(order.status, step.status);
                    const isCompleted = statusType === "completed";

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                          isCompleted
                            ? "bg-slate-50 border-brand-dark text-slate-900 shadow-subtle"
                            : "bg-white border-slate-100 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-dark" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <h4 className={`text-xs font-semibold ${isCompleted ? "text-slate-900" : "text-slate-500"}`}>
                            {step.label}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-1 leading-snug font-normal">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1 text-[10px] font-semibold uppercase tracking-wider">Recipient</span>
                  <p className="font-semibold text-slate-900">{order.customerName}</p>
                  <p className="text-slate-500">{order.customerPhone}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1 text-[10px] font-semibold uppercase tracking-wider">Delivery Destination</span>
                  <p className="text-slate-700">{order.customerAddress}</p>
                </div>
              </div>

              {/* Items in this order */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Order Items ({order.items.length})
                </h4>
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-[#f4f2ee] border border-slate-100">
                        <Image src={item.productImage || "/logo.jpg"} alt={item.productName} fill className="object-cover" />
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-slate-900 line-clamp-1">{item.productName}</h5>
                        {item.variantName && (
                          <p className="text-[11px] text-slate-400">{item.variantName}</p>
                        )}
                        <span className="text-[11px] text-slate-400">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">{formatPrice(item.total)}</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-xs font-semibold text-slate-700">
                <span>Total Payable (Cash on Delivery):</span>
                <span className="text-lg font-heading font-extrabold text-brand-dark">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400 text-xs">Loading tracking portal...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}

