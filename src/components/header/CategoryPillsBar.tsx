"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers } from "lucide-react";
import { Category } from "@/lib/types";

export default function CategoryPillsBar({ categories }: { categories: Category[] }) {
  const pathname = usePathname();

  // Hide on individual product detail pages (/products/[slug]) to avoid clutter & let product gallery shine
  if (pathname.startsWith("/products/") && pathname !== "/products") {
    return null;
  }

  return (
    <div className="w-full max-w-full bg-white/95 backdrop-blur-md border-b border-black/[0.05] py-2 px-3 sm:px-6 overflow-hidden md:hidden">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none scroll-smooth pb-0.5 max-w-full">
        {/* All Products Pill */}
        <Link
          href="/products"
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all border ${
            pathname === "/products"
              ? "bg-brand-maroon-700 text-white border-brand-maroon-700 shadow-subtle"
              : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>সব কালেকশন</span>
        </Link>

        {/* Dynamic Category Pills */}
        {categories.map((cat) => {
          const isActive = pathname === `/category/${cat.slug}`;
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all border ${
                isActive
                  ? "bg-brand-maroon-700 text-white border-brand-maroon-700 shadow-subtle font-semibold"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
              }`}
            >
              {cat.image && (
                <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 border border-black/10 bg-slate-200">
                  <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                </div>
              )}
              <span className="whitespace-nowrap">{cat.name}</span>
              {cat.featured && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold-500 shrink-0" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
