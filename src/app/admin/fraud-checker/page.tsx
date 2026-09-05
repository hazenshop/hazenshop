"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Search,
  Phone,
  MessageCircle,
  Truck,
  ShoppingBag,
  Ban,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Info,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { FraudCheckResult } from "@/lib/types";
import { useToast } from "@/context/ToastContext";

export default function FraudCheckerPage() {
  const { showToast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [result, setResult] = useState<FraudCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [togglingBlacklist, setTogglingBlacklist] = useState(false);

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = phoneNumber.replace(/[^0-9]/g, "");
    if (!clean || clean.length < 11) {
      showToast("দয়া করে সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (e.g. 017XXXXXXXX)", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/fraud-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: clean,
          customerName,
          customerAddress,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
        showToast("Fraud & Courier analysis completed!", "success");
      } else {
        showToast(data.message || "Failed to check phone number", "error");
      }
    } catch {
      showToast("Network error during fraud verification", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlacklist = async () => {
    if (!result) return;
    setTogglingBlacklist(true);
    try {
      const res = await fetch("/api/fraud-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_blacklist",
          phone: result.phone,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message, "success");
        setResult((prev) => (prev ? { ...prev, isBlacklisted: json.isBlacklisted } : prev));
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
    if (!result) return "#";
    const cleanPhone = result.phone.startsWith("88") ? result.phone : `88${result.phone}`;
    
    let message = `আসসালামু আলাইকুম ${customerName || "গ্রাহক"}! 🌸\nhazenshopbd.com এ আপনার অর্ডার ও ইনকোয়ারির জন্য যোগাযোগ করা হয়েছে।`;

    if (result.riskLevel === "high") {
      message += `\n\nসম্মানিত গ্রাহক, আমাদের ডেলিভারি পলিসি অনুযায়ী অনুগ্রহ করে ডেলিভারি চার্জটি অগ্রিম বিকাশ/নগদে পাঠিয়ে অর্ডারটি কনফার্ম করুন। ধন্যবাদ!`;
    } else {
      message += `\n\nআপনার অর্ডারটি কি আমরা আজই কুরিয়ারে পাঠিয়ে দেব? অনুগ্রহ করে কনফার্ম করুন। ধন্যবাদ!`;
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

  const theme = getRiskTheme(result?.riskLevel);
  const RiskIcon = theme.icon;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs text-brand-400 hover:underline font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
            </Link>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-white mt-1 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-brand-400" />
            Fake Order Detection & Courier Fraud Checker
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verify customer delivery success rates across Bangladesh (Steadfast Courier network) and check local store return history before dispatching Cash on Delivery orders.
          </p>
        </div>
      </div>

      {/* Lookup Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Search className="w-4 h-4 text-brand-400" />
          Customer Phone Number & Delivery Lookup
        </h2>

        <form onSubmit={handleCheck} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                মোবাইল নাম্বার (Phone) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="017XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-950 text-sm font-mono text-white rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-brand-500 min-h-[44px]"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                কাস্টমার নাম (Optional)
              </label>
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 text-sm text-white rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-brand-500 min-h-[44px]"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                ঠিকানা (Address / Optional)
              </label>
              <input
                type="text"
                placeholder="Area / Full Address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full bg-slate-950 text-sm text-white rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-brand-500 min-h-[44px]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-400">
              💡 Checks Steadfast courier network database + HAZENSHOP BD store order history
            </span>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-brand-500 hover:bg-brand-400 text-brand-dark font-black text-sm px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 min-h-[44px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking Courier Network...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Check Customer History & Fraud Risk</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 animate-fade-in">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                Verification Result For:
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-xl sm:text-2xl font-black text-brand-400">
                  {result.phone}
                </span>
                {result.isValidPhone ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Valid BD Number
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <AlertTriangle className="w-3 h-3" /> Invalid Format
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleBlacklist}
                disabled={togglingBlacklist}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                  result.isBlacklisted
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                }`}
              >
                <Ban className="w-3.5 h-3.5" />
                <span>{result.isBlacklisted ? "Blacklisted Customer" : "Add to Blacklist"}</span>
              </button>
            </div>
          </div>

          {/* Risk Card */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${theme.bg} space-y-2.5`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 font-bold text-base text-white">
                <RiskIcon className="w-6 h-6 shrink-0" />
                <span>{theme.title}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${theme.badge}`}>
                {result.riskLevel} Risk ({result.riskScore}% Risk Score)
              </span>
            </div>
            <p className="text-sm font-bold leading-relaxed text-white">
              💡 {result.recommendationBn}
            </p>
            <p className="text-xs text-slate-300/90 leading-relaxed">
              {result.recommendation}
            </p>
          </div>

          {/* Warnings List */}
          {result.warnings.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl space-y-2 text-xs text-amber-300">
              <span className="font-bold flex items-center gap-1.5 text-amber-400 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                ঝুঁকি সতর্কতা ও নোটিস ({result.warnings.length}):
              </span>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                {result.warnings.map((w, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Performance Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Multi-Courier Database (Steadfast + Pathao) */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-brand-400" />
                  <span className="text-sm font-bold text-white">Courier Networks Record</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">Steadfast & Pathao</span>
              </div>

              {result.courierStats ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-400">ডেলিভারি সফলতার হার ({result.courierStats.courier}):</span>
                      <span
                        className={`font-black text-sm ${
                          result.courierStats.successRate >= 75
                            ? "text-emerald-400"
                            : result.courierStats.successRate >= 50
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {result.courierStats.successRate}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          result.courierStats.successRate >= 75
                            ? "bg-emerald-500"
                            : result.courierStats.successRate >= 50
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.max(5, result.courierStats.successRate)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-xs text-slate-400 block font-medium">মোট পার্সেল</span>
                      <span className="font-mono font-black text-base text-white">
                        {result.courierStats.totalParcels}
                      </span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-xs text-emerald-400 block font-medium">ডেলিভার্ড</span>
                      <span className="font-mono font-black text-base text-emerald-400">
                        {result.courierStats.delivered}
                      </span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-xs text-rose-400 block font-medium">বাতিল/রিটার্ন</span>
                      <span className="font-mono font-black text-base text-rose-400">
                        {result.courierStats.cancelled}
                      </span>
                    </div>
                  </div>

                  {/* Individual Courier Split */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    {result.steadfastStats && (
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
                        <span className="font-bold text-white block">Steadfast Courier:</span>
                        <span className="text-slate-400 block text-[11px]">
                          {result.steadfastStats.delivered} delivered / {result.steadfastStats.totalParcels} ({result.steadfastStats.successRate}%)
                        </span>
                      </div>
                    )}
                    {result.pathaoStats && (
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
                        <span className="font-bold text-rose-400 block">Pathao Courier:</span>
                        <span className="text-slate-400 block text-[11px]">
                          {result.pathaoStats.delivered} delivered / {result.pathaoStats.totalParcels} ({result.pathaoStats.successRate}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {result.courierStats.fraudReports > 0 && (
                    <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 text-center">
                      ⚠️ {result.courierStats.fraudReports}টি ফ্রড/প্রতারণা রিপোর্ট নথিভুক্ত রয়েছে
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center space-y-2 text-slate-400">
                  <Info className="w-6 h-6 mx-auto text-slate-500" />
                  <p className="text-xs font-bold text-slate-300">No Courier History Found</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Configure your Steadfast and Pathao API keys in Admin Settings to query real-time courier network records.
                  </p>
                </div>
              )}
            </div>

            {/* Store DB History */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-brand-400" />
                  <span className="text-sm font-bold text-white">HAZENSHOP BD History</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">Store Record</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-center">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-xs text-slate-400 block font-medium">স্টোরে মোট অর্ডার</span>
                  <span className="font-mono font-black text-base text-white">
                    {result.localStats.totalOrders}
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-xs text-emerald-400 block font-medium">সফল ডেলিভারি</span>
                  <span className="font-mono font-black text-base text-emerald-400">
                    {result.localStats.completedOrders}
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-xs text-rose-400 block font-medium">বাতিল অর্ডার</span>
                  <span className="font-mono font-black text-base text-rose-400">
                    {result.localStats.cancelledOrders}
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-xs text-amber-400 block font-medium">ড্রাফট / অসম্পূর্ণ</span>
                  <span className="font-mono font-black text-base text-amber-400">
                    {result.localStats.incompleteOrders}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-400 text-center pt-2">
                {result.localStats.totalOrders === 0
                  ? "✨ নতুন কাস্টমার (First-time customer in your store)"
                  : `পূর্বে আপনার স্টোরে ${result.localStats.totalOrders} বার অর্ডার করেছেন।`}
              </div>
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
            <a
              href={getWhatsAppConfirmationLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>
                {result.riskLevel === "high"
                  ? "Ask Advance Shipping via WhatsApp"
                  : "Send WhatsApp Order Confirmation"}
              </span>
            </a>

            <a
              href={`tel:${result.phone}`}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-colors min-h-[44px]"
            >
              <Phone className="w-4 h-4 text-brand-400" />
              <span>Call Customer Directly ({result.phone})</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
