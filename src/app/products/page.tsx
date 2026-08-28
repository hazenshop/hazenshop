import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";
import { Sparkles } from "lucide-react";

export const revalidate = 0;

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
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-black/[0.06] shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Collections</span>
          </div>
          <h1 className="font-heading text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {currentCategory ? currentCategory.name : searchParams.search ? `Search results for "${searchParams.search}"` : "All Collections"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Showing {products.length} artisanal pieces with Cash on Delivery across Bangladesh
          </p>
        </div>

        {/* Category Pills - Smooth horizontal scroll on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none snap-x shrink-0">
          <Link
            href="/products"
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 snap-start min-h-[38px] flex items-center ${
              !searchParams.category
                ? "bg-brand-maroon-700 text-white shadow-card"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            সকল কালেকশন
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 snap-start min-h-[38px] flex items-center ${
                searchParams.category === c.slug
                  ? "bg-brand-maroon-700 text-white shadow-card"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
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


