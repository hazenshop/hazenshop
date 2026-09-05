import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-black/[0.06] shadow-card">
        <div className="w-16 h-16 rounded-full bg-brand-maroon-50 text-brand-maroon-700 flex items-center justify-center mx-auto text-2xl font-black font-mono">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            পেজটি খুঁজে পাওয়া যায়নি
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            আপনি যে পেজ বা পণ্যটি খুঁজছেন তা স্থানান্তরিত হয়েছে অথবা মুছে ফেলা হয়েছে।
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white font-bold text-xs px-5 py-3 rounded-full shadow-subtle transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>হোমে ফিরে যান</span>
          </Link>

          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-3 rounded-full transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>কালেকশন দেখুন</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
