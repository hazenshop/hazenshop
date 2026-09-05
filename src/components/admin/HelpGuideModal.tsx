"use client";

import React, { useState } from "react";
import {
  X,
  HelpCircle,
  ShoppingBag,
  Truck,
  Printer,
  Package,
  MessageCircle,
  Phone,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function HelpGuideModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"orders" | "courier" | "print" | "products">("orders");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col my-auto text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">
                দোকান পরিচালনা নির্দেশিকা (Shop Owner Quick Guide)
              </h3>
              <p className="text-[11px] text-slate-400">সহজে অর্ডার, কুরিয়ার ও স্টক ম্যানেজ করার নিয়মাবলী</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "orders"
                ? "bg-brand-500 text-brand-dark shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>১. অর্ডার প্রসেসিং</span>
          </button>

          <button
            onClick={() => setActiveTab("courier")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "courier"
                ? "bg-brand-500 text-brand-dark shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>২. কুরিয়ারে প্রেরণ</span>
          </button>

          <button
            onClick={() => setActiveTab("print")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "print"
                ? "bg-brand-500 text-brand-dark shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>৩. মেমো ও চালান প্রিন্ট</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "products"
                ? "bg-brand-500 text-brand-dark shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>৪. স্টক ও পণ্য</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          {/* TAB 1: ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-brand-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>নতুন অর্ডার আসলে কী করবেন?</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  কাস্টমার ওয়েবসাইটে অর্ডার দিলে তা সরাসরি <strong>"অর্ডার ও ডেলিভারি (Orders)"</strong> পেজে চলে আসবে।
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex gap-3 items-start p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-brand-500 text-brand-dark font-black flex items-center justify-center shrink-0 text-xs">
                    ১
                  </span>
                  <div>
                    <strong className="text-white block text-xs">কাস্টমারকে কল বা হোয়াটসঅ্যাপ করুন</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      অর্ডার সারির পাশে থাকা <strong>WhatsApp</strong> বা <strong>Phone</strong> বাটনে ক্লিক করে ঠিকানার সত্যতা নিশ্চিত হোন।
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-brand-500 text-brand-dark font-black flex items-center justify-center shrink-0 text-xs">
                    ২
                  </span>
                  <div>
                    <strong className="text-white block text-xs">ফ্রড বা রিটার্ন রেকর্ড চেক করুন</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      লাল রঙের <strong>Shield</strong> বাটনে চাপ দিলে কাস্টমারের কুরিয়ার ডেলিভারি সাকসেস রেট ও অতীতের কোনো পার্সেল চুরির রেকর্ড আছে কিনা দেখতে পাবেন।
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-brand-500 text-brand-dark font-black flex items-center justify-center shrink-0 text-xs">
                    ৩
                  </span>
                  <div>
                    <strong className="text-white block text-xs">স্ট্যাটাস Confirmed করুন</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      অর্ডার স্ট্যাটাস ড্রপডাউন থেকে <strong>Confirmed</strong> বা <strong>Packaging</strong> সিলেক্ট করুন।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COURIER */}
          {activeTab === "courier" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Truck className="w-4 h-4" />
                  <span>Steadfast ও Pathao-তে ১-ক্লিকে পার্সেল পাঠানো</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  ম্যানুয়ালি কুরিয়ার পোর্টালে কাস্টমারের নাম-ঠিকানা টাইপ করার প্রয়োজন নেই।
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex gap-3 items-start p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    ১
                  </span>
                  <div>
                    <strong className="text-white block text-xs">কুরিয়ার আইকন ক্লিক করুন</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      অর্ডারের পাশে থাকা <strong>Truck</strong> আইকনে ক্লিক করে "Send to Steadfast" অথবা "Send to Pathao" বাটনে চাপ দিন।
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    ২
                  </span>
                  <div>
                    <strong className="text-white block text-xs">বাল্ক কুরিয়ার বুকিং</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      একসাথে একাধিক অর্ডার টিক চিহ্ন দিয়ে উপরের <strong>"Send Selected to Courier"</strong> বাটনে ক্লিক করে এক ক্লিকেই সব পার্সেল বুকিং করতে পারবেন।
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    ৩
                  </span>
                  <div>
                    <strong className="text-white block text-xs">স্বয়ংক্রিয় ট্র্যাকিং কোড</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      কুরিয়ারে বুকিং সম্পন্ন হলে ট্র্যাকিং আইডি সরাসরি অর্ডারে যুক্ত হয়ে যাবে এবং স্ট্যাটাস Shipped হয়ে যাবে।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRINT */}
          {activeTab === "print" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-brand-400 font-bold text-sm">
                  <Printer className="w-4 h-4" />
                  <span>প্যাকেজিং চালান ও ক্যাশ অন ডেলিভারি মেমো প্রিন্ট</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  পার্সেল প্যাকেটের ওপর লাগানোর জন্য অথবা কাস্টমারকে মেমো দেওয়ার জন্য প্রিন্ট করুন।
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex gap-3 items-start p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-brand-500 text-brand-dark font-black flex items-center justify-center shrink-0 text-xs">
                    ১
                  </span>
                  <div>
                    <strong className="text-white block text-xs">প্রিন্টার আইকনে ক্লিক করুন</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      যেকোনো অর্ডারের পাশে থাকা <strong>Printer</strong> আইকনে ক্লিক করলে মেমো প্রিভিউ ওপেন হবে।
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-brand-500 text-brand-dark font-black flex items-center justify-center shrink-0 text-xs">
                    ২
                  </span>
                  <div>
                    <strong className="text-white block text-xs">ক্লিন A4 / স্টিকার প্রিন্ট</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      "Print Invoice" বাটনে ক্লিক করলে কোনো ওয়েবসাইট ব্যাকগ্রাউন্ড ছাড়াই নিখুঁত মেমো প্রিন্ট হবে।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRODUCTS */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Package className="w-4 h-4" />
                  <span>স্টক বাড়ানো-কমানো ও নতুন পণ্য যোগ</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  পণ্য তালিকা থেকে দ্রুত স্টক পরিবর্তন এবং সীমাহীন স্টকের সুবিধা।
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex gap-3 items-start p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    ১
                  </span>
                  <div>
                    <strong className="text-white block text-xs">কুইক স্টক বাড়ানো</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      পণ্য তালিকা থেকে সরাসরি <strong>+5</strong> বা <strong>+10</strong> চাপ দিয়ে ১ সেকেন্ডেই স্টক আপডেট করতে পারবেন।
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    ২
                  </span>
                  <div>
                    <strong className="text-white block text-xs">সীমাহীন স্টক (Unlimited Stock)</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      যেসব পণ্যের স্টক ফুরিয়ে যাওয়ার চিন্তা নেই সেগুলোতে "সীমাহীন স্টক" টিক দিলে কখনো স্টক আউট দেখাবে না।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">HAZENSHOP BD E-Commerce Management Suite</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-brand-dark font-black text-xs transition-colors shadow-md"
          >
            বুঝেছি (Close)
          </button>
        </div>
      </div>
    </div>
  );
}
