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

export const revalidate = 0; // Fresh dynamic data

export default async function HomePage() {
  const settings = await db.getSettings();
  const categories = await db.getCategories();
  const allProducts = await db.getProducts();

  const flashSaleProducts = allProducts.filter((p) => p.flashSale);
  const cleanWhatsApp = (settings.whatsappNumber || "01700000000").replace(/[^0-9]/g, "");

  return (
    <div className="space-y-10 sm:space-y-14 pb-16 pt-2 sm:pt-4">
      {/* 1. POPULAR CATEGORIES (FIRST & PRIMARY TOP SECTION) */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-4 sm:p-7 border border-black/[0.06] shadow-subtle space-y-4 sm:space-y-6">
            <div className="flex items-end justify-between pb-3 border-b border-black/[0.05]">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-brand-maroon-700 tracking-widest mb-1">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Curated Departments</span>
                </div>
                <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  সকল কালেকশন ও ক্যাটাগরি
                </h1>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold text-brand-maroon-700 hover:text-brand-maroon-800 flex items-center gap-1 group transition-colors bg-brand-maroon-50 px-3 py-1.5 rounded-full"
              >
                <span>সব পণ্য</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((cat, idx) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group relative rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/70 shadow-subtle hover:shadow-card transition-all text-center p-3 sm:p-4 flex flex-col items-center hover:-translate-y-0.5 min-h-[120px] sm:min-h-[140px] justify-center"
                >
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2.5 bg-white border border-slate-200 group-hover:scale-105 transition-transform duration-500 shadow-subtle">
                    <Image
                      src={cat.image || "/logo.jpg"}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 100px"
                      priority={idx < 6}
                      className="object-cover"
                    />
                  </div>
                  <h2 className="font-heading font-bold text-xs sm:text-sm text-slate-900 group-hover:text-brand-maroon-700 transition-colors leading-tight line-clamp-2">
                    {cat.name}
                  </h2>
                </Link>
              ))}
            </div>

            {/* Quick trust metrics bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-[11px] sm:text-xs text-slate-600 font-medium border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>১০০% ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>প্যাকেট দেখে মূল্য পরিশোধ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>১০০% প্রিমিয়াম ফেব্রিক গ্যারান্টি</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. FLASH SALE / LIMITED RELEASE (IF ANY) */}
      {flashSaleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-4 sm:p-8 border border-black/[0.06] shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-brand-maroon-700 text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                    Flash Deals
                  </span>
                  <span className="text-xs text-brand-maroon-700 font-medium">
                    সীমিত সময়ের বিশেষ মূল্যছাড়
                  </span>
                </div>
                <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  হট ডিল ও স্পেশাল অফার
                </h2>
              </div>

              <Link
                href="/products?filter=flashSale"
                className="text-xs font-bold text-brand-maroon-700 hover:text-brand-maroon-800 bg-brand-50 border border-brand-200/80 px-4 py-2 rounded-full transition-colors"
              >
                সব ডিল দেখুন &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {flashSaleProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. DYNAMIC CATEGORY SHOWCASE SECTIONS */}
      {categories.map((category) => {
        const catProducts = allProducts.filter((p) => p.category === category.slug);
        if (catProducts.length === 0) return null;

        return (
          <section key={category.id} className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-4 sm:mb-6 pb-3 border-b border-black/[0.05]">
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-maroon-700 tracking-widest block mb-1">
                  Collection
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {category.name}
                </h2>
              </div>
              <Link
                href={`/category/${category.slug}`}
                className="text-xs font-semibold text-slate-600 hover:text-brand-maroon-700 flex items-center gap-1 group transition-colors"
              >
                <span>সব দেখুন ({catProducts.length})</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {catProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      })}

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
