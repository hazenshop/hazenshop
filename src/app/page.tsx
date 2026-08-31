import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle,
  Clock,
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

  const hero = settings.heroBanners?.[0] || {
    id: "hero-default",
    title: "Luxury Bedsheets & Designer Window Curtains",
    subtitle: "Export-grade 100% Egyptian cotton bedsheet sets, 100% blackout window drapes, and cloud comforters delivered with Cash on Delivery nationwide across Bangladesh.",
    buttonText: "Explore Collections",
    buttonLink: "/products",
    image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=1200&auto=format&fit=crop",
    badge: "Seasonal Home Living Edition",
  };

  const cleanWhatsApp = (settings.whatsappNumber || "01700000000").replace(/[^0-9]/g, "");

  return (
    <div className="space-y-10 sm:space-y-16 pb-16">
      {/* EDITORIAL HERO BANNER */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4">
        <div className="relative rounded-3xl overflow-hidden bg-brand-maroon-700 text-white min-h-[380px] sm:min-h-[460px] md:min-h-[500px] flex items-center shadow-card border border-white/10">
          {/* Background Image with Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src={hero.image || "/logo.jpg"}
              alt={hero.title}
              fill
              priority
              className="object-cover object-center opacity-40 scale-100 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-maroon-800/95 via-brand-maroon-700/85 sm:via-brand-maroon-700/80 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 p-5 sm:p-10 lg:p-14 max-w-2xl space-y-3.5 sm:space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-brand-gold-300 text-[10px] font-bold tracking-widest uppercase backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold-300" />
              <span>{hero.badge || "Special Edition"}</span>
            </div>

            <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.15] sm:leading-[1.1] tracking-tight text-white">
              {hero.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-100 font-normal leading-relaxed max-w-xl">
              {hero.subtitle}
            </p>

            {/* Direct Category Badges / Quick Navigation inside Hero */}
            <div className="space-y-2 pt-1 sm:pt-2">
              <span className="text-[11px] font-bold text-brand-gold-300 uppercase tracking-wider block">
                ক্যাটাগরি বাছাই করুন (Select Category):
              </span>
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-full bg-white text-brand-maroon-700 font-extrabold text-xs sm:text-sm shadow-card hover:bg-slate-100 active:scale-95 transition-all min-h-[40px]"
                >
                  <span>সব কালেকশন</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-maroon-700" />
                </Link>

                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all min-h-[40px]"
                  >
                    {cat.image && (
                      <div className="relative w-4 h-4 sm:w-5 sm:h-5 rounded-full overflow-hidden shrink-0 border border-white/30">
                        <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                      </div>
                    )}
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick trust metrics */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-3 sm:pt-4 text-[11px] sm:text-xs text-slate-300/90 font-normal border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-brand-gold-400 shrink-0" />
                <span>১০০% ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-brand-gold-400 shrink-0" />
                <span>প্যাকেট দেখে মূল্য পরিশোধ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-brand-gold-400 shrink-0" />
                <span>১০০% প্রিমিয়াম ফেব্রিক গ্যারান্টি</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES SHOWCASE */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-4 sm:mb-6 pb-3 border-b border-black/[0.05]">
            <div>
              <span className="text-[10px] font-bold uppercase text-brand-maroon-700 tracking-widest block mb-1">
                Curated Departments
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                সকল কালেকশন ও ক্যাটাগরি
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold text-slate-600 hover:text-brand-maroon-700 flex items-center gap-1 group transition-colors"
            >
              <span>সব দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group relative rounded-2xl bg-white border border-slate-100 shadow-subtle hover:shadow-card transition-all text-center p-3 sm:p-4 flex flex-col items-center hover:-translate-y-0.5"
              >
                <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2 sm:mb-3 bg-slate-50 border border-slate-200 group-hover:scale-105 transition-transform duration-500">
                  <Image
                    src={cat.image || "/logo.jpg"}
                    alt={cat.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-heading font-bold text-xs sm:text-sm text-slate-900 group-hover:text-brand-maroon-700 transition-colors leading-tight line-clamp-2">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FLASH SALE / LIMITED RELEASE (IF ANY) */}
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

      {/* DYNAMIC CATEGORY SHOWCASE SECTIONS */}
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

      {/* EMPTY CATALOG GRACEFUL STATE */}
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
                href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent("আসসালামু আলাইকুম Hazen! আমি আপনাদের নতুন কালেকশন সম্পর্কে জানতে চাই।")}`}
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

      {/* TRUST BADGES */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <TrustBadges />
      </section>
    </div>
  );
}
