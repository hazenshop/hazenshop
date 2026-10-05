import React from "react";
import {
  Sparkles,
  MessageCircle,
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

      {/* 1. FLASH SALE / LIMITED RELEASE (IF ANY) */}
      {flashSaleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-4 sm:p-8 border border-black/[0.06] shadow-subtle space-y-4">
            <div className="pb-3 border-b border-slate-100 space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-brand-maroon-700 text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  Flash Deals
                </span>
                <span className="text-xs text-brand-maroon-700 font-medium">
                  সীমিত সময়ের বিশেষ মূল্যছাড়
                </span>
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                হট ডিল ও স্পেশাল অফার
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {flashSaleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. DYNAMIC CATEGORY SHOWCASE SECTIONS */}
      {categories.map((category) => {
        const catProducts = allProducts.filter((p) => p.category === category.slug);
        if (catProducts.length === 0) return null;

        return (
          <section key={category.id} className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="mb-4 sm:mb-6 pb-3 border-b border-black/[0.05]">
              <span className="text-[10px] font-bold uppercase text-brand-maroon-700 tracking-widest block mb-1">
                Collection
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {category.name}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {catProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      })}

      {/* 3. ALL PRODUCTS FALLBACK IF CATEGORIES HAVE NO PRODUCTS OR EMPTY */}
      {allProducts.length > 0 && categories.every((c) => allProducts.filter((p) => p.category === c.slug).length === 0) && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="mb-4 sm:mb-6 pb-3 border-b border-black/[0.05]">
            <span className="text-[10px] font-bold uppercase text-brand-maroon-700 tracking-widest block mb-1">
              Featured
            </span>
            <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              সকল পণ্য
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

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
              আমাদের প্রিমিয়াম বেডশিট ও জানালার পর্দা কালেকশন প্রস্তুত হচ্ছে। সরাসরি হোয়াটসঅ্যাপে নক দিয়ে বিস্তারিত জানতে পারেন।
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent("আসসালামু আলাইকুম HAZENSHOP BD! আমি আপনাদের নতুন কালেকশন সম্পর্কে জানতে চাই।")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3.5 rounded-full shadow-card transition-all min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>হোয়াটসঅ্যাপে যোগাযোগ</span>
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
