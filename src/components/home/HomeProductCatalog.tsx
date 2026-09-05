"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  LayoutGrid,
  ChevronRight,
  Filter,
  Package,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Category, Product } from "@/lib/types";
import ProductCard from "@/components/product/ProductCard";

interface HomeProductCatalogProps {
  products: Product[];
  categories: Category[];
}

export default function HomeProductCatalog({
  products,
  categories,
}: HomeProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCategoryDrawer, setShowCategoryDrawer] = useState<boolean>(false);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    if (selectedCategory === "flash-sale") return products.filter((p) => p.flashSale);
    if (selectedCategory === "featured") return products.filter((p) => p.featured);
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Category Pills Bar (Clickable Filter Tabs) */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-black/[0.05]">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 min-h-[38px] ${
              selectedCategory === "all"
                ? "bg-brand-maroon-700 text-white shadow-subtle"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>সকল পণ্য ({products.length})</span>
          </button>

          {products.some((p) => p.flashSale) && (
            <button
              type="button"
              onClick={() => setSelectedCategory("flash-sale")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 min-h-[38px] ${
                selectedCategory === "flash-sale"
                  ? "bg-rose-600 text-white shadow-subtle"
                  : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>🔥 ফ্ল্যাশ ডিল</span>
            </button>
          )}

          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat.slug).length;
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 min-h-[38px] ${
                  isSelected
                    ? "bg-brand-maroon-700 text-white shadow-subtle"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <span>{cat.name}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Optional Toggle to view Full Category Directory */}
        <button
          type="button"
          onClick={() => setShowCategoryDrawer(!showCategoryDrawer)}
          className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-brand-maroon-700 hover:text-brand-maroon-800 bg-brand-50 hover:bg-brand-100 border border-brand-200/80 px-3.5 py-2 rounded-full transition-colors shrink-0 min-h-[38px]"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>{showCategoryDrawer ? "ক্যাটাগরি বন্ধ করুন" : "ক্যাটাগরি লিস্ট"}</span>
        </button>
      </div>

      {/* Collapsible Category Cards (Only shown when user clicks button) */}
      {showCategoryDrawer && categories.length > 0 && (
        <div className="bg-slate-50/80 rounded-3xl p-5 sm:p-6 border border-slate-200 animate-in fade-in duration-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <h3 className="font-heading font-extrabold text-sm text-slate-900">
              ক্যাটাগরি অনুযায়ী ব্রাউজ করুন
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              যে কোনো কালেকশনে ক্লিক করুন
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  setShowCategoryDrawer(false);
                }}
                className={`group p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all min-h-[110px] ${
                  selectedCategory === cat.slug
                    ? "bg-brand-maroon-50 border-brand-maroon-700 shadow-subtle"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden mb-2 bg-slate-100 border border-slate-200">
                  <Image src={cat.image || "/logo.jpg"} alt={cat.name} fill className="object-cover" />
                </div>
                <span className="font-heading font-bold text-xs text-slate-900 line-clamp-1">
                  {cat.name}
                </span>
                <span className="text-[10px] text-brand-maroon-700 font-medium mt-0.5">
                  {products.filter((p) => p.category === cat.slug).length} টি পণ্য
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-heading font-bold text-base text-slate-800">
            এই ক্যাটাগরিতে বর্তমানে কোনো পণ্য নেই
          </h4>
          <p className="text-xs text-slate-500">
            দয়া করে অন্য ক্যাটাগরি বাছাই করুন অথবা সকল পণ্য দেখুন
          </p>
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className="inline-flex items-center gap-1.5 bg-brand-maroon-700 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-colors"
          >
            <span>সব পণ্য দেখুন</span>
          </button>
        </div>
      )}
    </div>
  );
}
