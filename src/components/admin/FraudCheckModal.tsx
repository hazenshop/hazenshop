"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  X,
  Phone,
  MessageCircle,
  Truck,
  ShoppingBag,
  Ban,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Info,
  ExternalLink,
} from "lucide-react";
import { FraudCheckResult } from "@/lib/types";
import { useToast } from "@/context/ToastContext";

interface FraudCheckModalProps {
  phone: string;
  customerName?: string;
  customerAddress?: string;
  orderId?: string;
  onClose: () => void;
}

export default function FraudCheckModal({
  phone,
  customerName,
  customerAddress,
  orderId,
  onClose,
}: FraudCheckModalProps) {
  const { showToast } = useToast();
  const [data, setData] = useState<FraudCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingBlacklist, setTogglingBlacklist] = useState(false);

  const fetchCheck = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fraud-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          customerName,
          customerAddress,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        showToast(json.message || "Failed to perform fraud check", "error");
      }
    } catch {
      showToast("Network error during fraud verification", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phone) {
      fetchCheck();
    }
  }, [phone]);

  const handleToggleBlacklist = async () => {
    if (!data) return;
    setTogglingBlacklist(true);
    try {
      const res = await fetch("/api/fraud-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_blacklist",
          phone: data.phone,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message, "success");
        setData((prev) => (prev ? { ...prev, isBlacklisted: json.isBlacklisted } : prev));
      } else {
        showToast("Failed to update blacklist", "error");
      }
    } catch {
      showToast("Error updating blacklist", "error");
    } finally {
      setTogglingBlacklist(false);
    }
  };

  const getWhatsAppConfirmationLink = () => {
    if (!data) return "#";
    const cleanPhone = data.phone.startsWith("88") ? data.phone : `88${data.phone}`;
    
    let message = `আসসালামু আলাইকুম ${customerName || "গ্রাহক"}! 🌸\nhazenshopbd.com এ আপনার অর্ডারটি পেয়েছি।`;
    if (orderId) {
      message += ` (অর্ডার #${orderId})`;
    }

    if (data.riskLevel === "high") {
      message += `\n\nসম্মানিত গ্রাহক, আমাদের ডেলিভারি পলিসি অনুযায়ী অনুগ্রহ করে ডেলিভারি চার্জটি অগ্রিম বিকাশ/নগদে পাঠিয়ে অর্ডারটি কনফার্ম করুন। ধন্যবাদ!`;
    } else {
      message += `\n\nআপনার প্রদত্ত ঠিকানা: ${customerAddress || "সঠিক ঠিকানা"}\n\nআপনার অর্ডারটি কি আমরা আজই কুরিয়ারে পাঠিয়ে দেব? অনুগ্রহ করে কনফার্ম করুন। ধন্যবাদ!`;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const getRiskTheme = (level?: string) => {
    if (level === "high") {
      return {
        bg: "bg-rose-500/10 border-rose-500/40 text-rose-400",
        badge: "bg-rose-500 text-white shadow-rose-500/20",
        icon: ShieldAlert,
        title: "উচ্চ ঝুঁকি / সম্ভাব্য ভুয়া অর্ডার (High Risk / Suspicious)",
      };
    }
    if (level === "medium") {
      return {
        bg: "bg-amber-500/10 border-amber-500/40 text-amber-400",
        badge: "bg-amber-500 text-slate-950 shadow-amber-500/20",
        icon: AlertTriangle,
        title: "মাঝারি ঝুঁকি / কল কনফার্মেশন প্রয়োজন (Moderate Risk)",
      };
    }
    return {
      bg: "bg-emerald-500/10 border-emerald-500/40 text-emerald-400",
      badge: "bg-emerald-500 text-white shadow-emerald-500/20",
      icon: ShieldCheck,
      title: "নিরাপদ কাস্টমার / ডেলিভারি নিশ্চিত (Safe Customer)",
    };
  };

  const theme = getRiskTheme(data?.riskLevel);
  const RiskIcon = theme.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Modal Top Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg sm:text-xl text-white flex items-center gap-2">
                Fraud & Courier Delivery History
                {orderId && <span className="font-mono text-xs text-brand-400">#{orderId}</span>}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Steadfast Courier Delivery Behavior & Local Store Fraud Verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-16 text-center space-y-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-400" />
            <p className="text-xs font-bold text-white">Checking Courier Delivery Network & Past Record...</p>
            <p className="text-[11px] text-slate-500">Querying Steadfast Network & Local Store History</p>
          </div>
        ) : !data ? (
          <div className="py-12 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-sm font-bold text-white">Could not fetch fraud verification data</p>
            <button
              onClick={fetchCheck}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-brand-400"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Customer Summary Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                  Customer Profile
                </span>
                <p className="font-bold text-sm text-white">{customerName || "Customer"}</p>
                <div className="flex items-center gap-2 text-slate-300 font-mono">
                  <Phone className="w-3.5 h-3.5 text-brand-400" />
                  <a href={`tel:${data.phone}`} className="hover:underline font-bold text-brand-400">
                    {data.phone}
                  </a>
                </div>
                {customerAddress && (
                  <p className="text-[11px] text-slate-400 line-clamp-1 max-w-sm mt-0.5">
                    {customerAddress}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                <button
                  onClick={handleToggleBlacklist}
                  disabled={togglingBlacklist}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                    data.isBlacklisted
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                  }`}
                  title={data.isBlacklisted ? "Remove from Store Blacklist" : "Add to Store Blacklist"}
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>{data.isBlacklisted ? "Blacklisted (ব্ল্যাকলিস্ট)" : "Blacklist Phone"}</span>
                </button>

                <button
                  onClick={fetchCheck}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                  title="Re-check"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Risk Assessment Banner */}
            <div className={`p-4 rounded-2xl border ${theme.bg} space-y-2`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <RiskIcon className="w-5 h-5 shrink-0" />
                  <span>{theme.title}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${theme.badge}`}>
                  {data.riskLevel} Risk ({data.riskScore}% Risk Score)
                </span>
              </div>
              <p className="text-xs font-bold leading-relaxed text-white">
                💡 {data.recommendationBn}
              </p>
              <p className="text-[11px] text-slate-300/80 leading-relaxed">
                {data.recommendation}
              </p>
            </div>

            {/* Warnings list if any */}
            {data.warnings.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl space-y-1.5 text-xs text-amber-300">
                <span className="font-bold flex items-center gap-1.5 text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  ঝুঁকি সতর্কতা ও নোটিস ({data.warnings.length}):
                </span>
                <ul className="list-disc pl-5 space-y-1 text-[11px]">
                  {data.warnings.map((w, idx) => (
                    <li key={idx} className="leading-snug">
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Delivery Performance Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Courier Delivery Record (Steadfast) */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-brand-400" />
                    <span className="text-xs font-bold text-white">Courier Network Record</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Steadfast BD</span>
                </div>

                {data.courierStats ? (
                  <div className="space-y-3">
                    {/* Success Rate Bar */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-400">ডেলিভারি সফলতার হার:</span>
                        <span
                          className={`font-black ${
                            data.courierStats.successRate >= 75
                              ? "text-emerald-400"
                              : data.courierStats.successRate >= 50
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {data.courierStats.successRate}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            data.courierStats.successRate >= 75
                              ? "bg-emerald-500"
                              : data.courierStats.successRate >= 50
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.max(5, data.courierStats.successRate)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="bg-slate-900 p-2 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block font-medium">মোট পার্সেল</span>
                        <span className="font-mono font-black text-sm text-white">
                          {data.courierStats.totalParcels}
                        </span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-emerald-400 block font-medium">ডেলিভার্ড</span>
                        <span className="font-mono font-black text-sm text-emerald-400">
                          {data.courierStats.delivered}
                        </span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-rose-400 block font-medium">বাতিল/রিটার্ন</span>
                        <span className="font-mono font-black text-sm text-rose-400">
                          {data.courierStats.cancelled}
                        </span>
                      </div>
                    </div>

                    {data.courierStats.fraudReports > 0 && (
                      <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30 text-center">
                        ⚠️ {data.courierStats.fraudReports}টি ফ্রড রিপোর্ট নথিভুক্ত
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center space-y-1.5 text-slate-400">
                    <Info className="w-5 h-5 mx-auto text-slate-500" />
                    <p className="text-xs font-bold text-slate-300">No Courier History Available</p>
                    <p className="text-[11px] text-slate-500">
                      Steadfast API keys can be configured in Settings to enable real-time courier verification.
                    </p>
                  </div>
                )}
              </div>

              {/* Local HAZENSHOP History */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-brand-400" />
                    <span className="text-xs font-bold text-white">HAZENSHOP BD History</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Store DB</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center pt-1">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-medium">স্টোর মোট অর্ডার</span>
                    <span className="font-mono font-black text-sm text-white">
                      {data.localStats.totalOrders}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-emerald-400 block font-medium">সফল ডেলিভারি</span>
                    <span className="font-mono font-black text-sm text-emerald-400">
                      {data.localStats.completedOrders}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-rose-400 block font-medium">বাতিল অর্ডার</span>
                    <span className="font-mono font-black text-sm text-rose-400">
                      {data.localStats.cancelledOrders}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-amber-400 block font-medium">অসম্পূর্ণ ড্রাফট</span>
                    <span className="font-mono font-black text-sm text-amber-400">
                      {data.localStats.incompleteOrders}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 text-center">
                  {data.localStats.totalOrders === 0
                    ? "✨ নতুন কাস্টমার (First-time customer in your store)"
                    : `পূর্বে আপনার স্টোর থেকে ${data.localStats.totalOrders} বার অর্ডার করেছেন।`}
                </div>
              </div>
            </div>

            {/* Quick Action Footer Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
              <a
                href={getWhatsAppConfirmationLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {data.riskLevel === "high"
                    ? "Ask Advance Courier Charge on WhatsApp"
                    : "Send WhatsApp Order Confirmation"}
                </span>
              </a>

              <a
                href={`tel:${data.phone}`}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-colors min-h-[44px]"
              >
                <Phone className="w-4 h-4 text-brand-400" />
                <span>Call Customer Directly ({data.phone})</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
