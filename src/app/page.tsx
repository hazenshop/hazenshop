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
  const featuredProducts = allProducts.filter((p) => p.featured);
  const luxuryBedsheets = allProducts.filter((p) => p.category === "luxury-bedsheets");
  const comforters = allProducts.filter((p) => p.category === "comforter-sets");

  const hero = settings.heroBanners?.[0] || {
    id: "hero-default",
    title: "Timeless Textiles for Pure Living",
    subtitle: "Artisanal bed linens, breathable combed cotton, and luxury quilts delivered directly across all 64 districts in Bangladesh.",
    buttonText: "Explore Collection",
    buttonLink: "/products",
    image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=1200&auto=format&fit=crop",
    badge: "Autumn / Winter Edition",
  };

  return (
    <div className="space-y-12 sm:space-y-20 pb-16">
      {/* EDITORIAL HERO BANNER */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-6">
        <div className="relative rounded-3xl overflow-hidden bg-brand-dark text-white min-h-[400px] sm:min-h-[480px] md:min-h-[520px] flex items-center shadow-card border border-black/10">
          {/* Background Image with Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src={hero.image || "/logo.jpg"}
              alt={hero.title}
              fill
              priority
              className="object-cover object-center opacity-40 scale-100 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 via-brand-dark/80 sm:via-brand-dark/75 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 p-5 sm:p-12 lg:p-16 max-w-2xl space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-brand-300 text-[10px] font-semibold tracking-widest uppercase backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-brand-400" />
              <span>{hero.badge || "Special Edition"}</span>
            </div>

            <h1 className="font-heading text-2xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.15] sm:leading-[1.1] tracking-tight text-white">
              {hero.title}
            </h1>

            <p className="text-xs sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl">
              {hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <Link
                href={hero.buttonLink || "/products"}
                className="bg-white hover:bg-slate-100 active:scale-95 text-brand-dark font-semibold text-xs sm:text-sm px-6 sm:px-7 py-3 sm:py-3.5 rounded-full shadow-subtle hover:shadow-card transition-all text-center flex items-center justify-center gap-2 group min-h-[44px]"
              >
                <span>{hero.buttonText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/track-order"
                className="bg-white/10 hover:bg-white/15 text-slate-200 font-medium px-5 sm:px-6 py-3 sm:py-3.5 rounded-full backdrop-blur-md transition-all text-xs sm:text-sm border border-white/10 text-center min-h-[44px] flex items-center justify-center"
              >
                Track Your Parcel
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 sm:pt-5 text-[11px] sm:text-xs text-slate-300/90 font-normal border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>Cash on Delivery (ক্যাশ অন ডেলিভারি)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>7-Day Easy Exchange</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-5 sm:mb-8 pb-3 sm:pb-4 border-b border-black/[0.05]">
          <div>
            <span className="text-[10px] font-bold uppercase text-brand-600 tracking-widest block mb-1">
              Curated Departments
            </span>
            <h2 className="font-heading text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Signature Collections
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-slate-600 hover:text-brand-dark flex items-center gap-1 group transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile Horizontal Scroll + Desktop Grid */}
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-none snap-x">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative rounded-2xl bg-white border border-black/[0.05] shadow-subtle hover:shadow-card-hover transition-all text-center p-3 sm:p-4 flex flex-col items-center hover:-translate-y-0.5 shrink-0 w-28 sm:w-auto snap-start"
            >
              <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-2.5 sm:mb-3.5 bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                <Image
                  src={cat.image || "/logo.jpg"}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-heading font-semibold text-xs sm:text-sm text-slate-900 group-hover:text-brand-700 transition-colors leading-tight line-clamp-2">
                {cat.name}
              </h3>
              {cat.productCount ? (
                <span className="text-[10px] text-slate-400 mt-1">
                  {cat.productCount} items
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </section>

      {/* FLASH SALE / LIMITED RELEASE */}
      {flashSaleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-4 sm:p-10 border border-black/[0.06] shadow-subtle">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-brand-dark text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                    Limited Time
                  </span>
                  <span className="text-xs text-brand-600 font-medium">
                    Complimentary Nationwide Delivery
                  </span>
                </div>
                <h2 className="font-heading text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Seasonal Flash Specials
                </h2>
              </div>

              <Link
                href="/products?filter=flashSale"
                className="text-xs font-semibold text-brand-dark hover:text-brand-600 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-full transition-colors"
              >
                Explore All Deals
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

      {/* LUXURY BEDSHEETS FEATURED GRID */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-5 sm:mb-8 pb-3 sm:pb-4 border-b border-black/[0.05]">
          <div>
            <span className="text-[10px] font-bold uppercase text-brand-600 tracking-widest block mb-1">
              Master Craftsmanship
            </span>
            <h2 className="font-heading text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              100% Combed Cotton Linens
            </h2>
          </div>
          <Link
            href="/category/luxury-bedsheets"
            className="text-xs font-semibold text-slate-600 hover:text-brand-dark flex items-center gap-1 group transition-colors"
          >
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {luxuryBedsheets.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* EDITORIAL PROMO FEATURE: COMFORTERS */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-brand-dark text-white p-6 sm:p-12 shadow-card border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="max-w-xl space-y-3 sm:space-y-4">
            <span className="bg-white/10 text-brand-300 text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
              Winter Essential
            </span>
            <h3 className="font-heading text-xl sm:text-4xl font-extrabold leading-tight text-white">
              Cloud Microfiber Luxury Quilts
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm font-normal leading-relaxed">
              350 GSM siliconized microfiber filling that delivers weightless thermal comfort. Breathable hypoallergenic casing crafted for peaceful slumber.
            </p>
            <div className="pt-2">
              <Link
                href="/category/comforter-sets"
                className="bg-white hover:bg-slate-100 text-brand-dark font-semibold px-6 py-3 rounded-full transition-all inline-flex items-center justify-center gap-2 text-xs sm:text-sm shadow-subtle min-h-[44px]"
              >
                <span>Discover Quilts</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative w-full md:w-80 aspect-[4/3] rounded-2xl overflow-hidden shadow-card border border-white/10 shrink-0">
            <Image
              src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800&auto=format&fit=crop"
              alt="Luxury Comforter"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* ALL FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-5 sm:mb-8 pb-3 sm:pb-4 border-b border-black/[0.05]">
          <div>
            <span className="text-[10px] font-bold uppercase text-brand-600 tracking-widest block mb-1">
              Curated Selection
            </span>
            <h2 className="font-heading text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Trending Editions
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-slate-600 hover:text-brand-dark flex items-center gap-1 group transition-colors"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {allProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* TRUST BADGES SECTION */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <TrustBadges />
      </section>
    </div>
  );
}


