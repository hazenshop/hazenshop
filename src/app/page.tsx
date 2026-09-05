import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Sparkles,
  MessageCircle,
  LayoutGrid,
} from "lucide-react";
import { db } from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";
import TrustBadges from "@/components/footer/TrustBadges";

import HomeProductCatalog from "@/components/home/HomeProductCatalog";

export const revalidate = 0; // Fresh dynamic data

export default async function HomePage() {
  const settings = await db.getSettings();
  const categories = await db.getCategories();
  const allProducts = await db.getProducts();

  const flashSaleProducts = allProducts.filter((p) => p.flashSale);
  const cleanWhatsApp = (settings.whatsappNumber || "01700000000").replace(/[^0-9]/g, "");

  return (
    <div className="space-y-8 sm:space-y-12 pb-16 pt-2 sm:pt-4">
      {/* 1. PRIMARY STORE CATALOG & PRODUCTS SHOWCASE (IMMEDIATELY VISIBLE AT TOP) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-4 sm:p-7 border border-black/[0.06] shadow-subtle space-y-5">
          {/* Header Title & Trust Highlights */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.05]">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-brand-maroon-700 tracking-widest mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>HAZEN EXCLUSIVE COLLECTION</span>
              </div>
              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                আমাদের সকল প্রিমিয়াম প্রডাক্ট
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>ক্যাশ অন ডেলিভারি (COD)</span>
              </span>
            </div>
          </div>

          {/* Dynamic Product Catalog with Clickable Category Pills */}
          <HomeProductCatalog products={allProducts} categories={categories} />

          {/* Quick trust metrics bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-[11px] sm:text-xs text-slate-600 font-medium border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>১০০% ক্যাশ অন ডেলিভারি</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>প্যাকেট খুলে দেখে মূল্য পরিশোধ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>১০০% প্রিমিয়াম ফেব্রিক ও অরিজিনাল কোয়ালিটি</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EMPTY CATALOG GRACEFUL STATE */}
      {allProducts.length === 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-14 text-center border border-black/[0.06] shadow-subtle space-y-4 max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-brand-maroon-50 text-brand-maroon-700 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-lg sm:text-2xl text-slate-900">
              নতুন এক্সক্লুসিভ কালেকশন যুক্ত হচ্ছে
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
              আমাদের প্রিমিয়াম বেডশিট ও জানালার পর্দা কালেকশন প্রস্তুত হচ্ছে। সরাসরি হোয়াটসঅ্যাপে নক দিয়ে বিস্তারিত জানতে পারেন।
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent("আসসালামু আলাইকুম HAZENSHOP BD! আমি আপনাদের নতুন কালেকশন সম্পর্কে জানতে চাই।")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3.5 rounded-full shadow-card transition-all min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>হোয়াটসঅ্যাপে যোগাযোগ</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 5. TRUST BADGES */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <TrustBadges />
      </section>
    </div>
  );
}
