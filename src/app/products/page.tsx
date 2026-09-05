import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";
import { Sparkles, Filter } from "lucide-react";

export const revalidate = 0;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { category?: string; filter?: string; search?: string };
}): Promise<Metadata> {
  const categories = await db.getCategories();
  const currentCategory = categories.find((c) => c.slug === searchParams.category);

  if (currentCategory) {
    return {
      title: `${currentCategory.name} Collection | HAZENSHOP BD`,
      description: currentCategory.description || `Explore our ${currentCategory.name} collection. Cash on Delivery across Bangladesh.`,
    };
  }

  if (searchParams.search) {
    return {
      title: `Search: "${searchParams.search}" | HAZENSHOP BD`,
      description: `Browse product results for "${searchParams.search}" on HAZENSHOP BD.`,
    };
  }

  return {
    title: "All Collections | HAZENSHOP BD (hazenshopbd.com)",
    description: "Browse export-quality Egyptian cotton bedsheets, luxury curtains, quilts, and comforters with Cash on Delivery across Bangladesh.",
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; filter?: string; search?: string; sort?: string };
}) {
  const categories = await db.getCategories();
  let products = await db.getProducts({
    category: searchParams.category,
    search: searchParams.search,
    flashSale: searchParams.filter === "flashSale" ? true : undefined,
  });

  // Sorting
  if (searchParams.sort === "price-low") {
    products.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
  } else if (searchParams.sort === "price-high") {
    products.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
  } else if (searchParams.sort === "rating") {
    products.sort((a, b) => b.rating - a.rating);
  }

  const currentCategory = categories.find((c) => c.slug === searchParams.category);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-16">
      {/* Header & Filter Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-black/[0.06] shadow-subtle space-y-4 sm:space-y-5">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-maroon-700 uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold-500" />
            <span>Curated Collections</span>
          </div>
          <h1 className="font-heading text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {currentCategory ? currentCategory.name : searchParams.search ? `Search results for "${searchParams.search}"` : "সকল কালেকশন"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            {products.length}টি প্রিমিয়াম পণ্য রয়েছে • পুরো বাংলাদেশে ১০০% ক্যাশ অন ডেলিভারি
          </p>
        </div>

        {/* Category Pills - Responsive: Smooth horizontal swipe on mobile, clean flex-wrap on desktop */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto md:flex-wrap pb-1 scrollbar-none">
          <Link
            href="/products"
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 min-h-[38px] flex items-center ${
              !searchParams.category
                ? "bg-brand-maroon-700 text-white shadow-card ring-2 ring-brand-maroon-700/20"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            সকল কালেকশন
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 min-h-[38px] flex items-center ${
                searchParams.category === c.slug
                  ? "bg-brand-maroon-700 text-white shadow-card ring-2 ring-brand-maroon-700/20"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-black/[0.06] shadow-subtle space-y-4">
          <p className="text-xs sm:text-sm font-bold text-slate-700">এই ক্যাটাগরিতে বর্তমানে কোনো পণ্য পাওয়া যায়নি।</p>
          <Link
            href="/products"
            className="inline-block bg-brand-maroon-700 text-white font-bold text-xs px-6 py-3 rounded-full shadow-card min-h-[44px]"
          >
            সব কালেকশন দেখুন
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
