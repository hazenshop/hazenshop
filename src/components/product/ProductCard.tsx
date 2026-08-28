"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Star, ArrowRight } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const discountPercent = calculateDiscountPercentage(product.price, product.salePrice);
  const effectivePrice = product.salePrice ?? product.price;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.variants[0] || undefined, 1, { silent: false });
    showToast(`Added "${product.name}" to bag.`);
  };

  const handleQuickOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.variants[0] || undefined, 1, { silent: true });
    router.push("/checkout");
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-black/[0.06] shadow-subtle hover:shadow-card-hover transition-all duration-500 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Product Image & Badges */}
      <Link href={`/products/${product.slug}`} className="relative aspect-[4/4.5] w-full bg-[#f4f2ee] overflow-hidden block">
        <Image
          src={product.images[0] || "/logo.jpg"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Minimal Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
          {product.badge && (
            <span className="bg-brand-dark/90 backdrop-blur-md text-white font-medium text-[8px] sm:text-[9px] uppercase tracking-widest px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-white/10 shadow-subtle">
              {product.badge}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-white/95 backdrop-blur-md text-brand-dark font-bold text-[8px] sm:text-[9px] tracking-wider px-1.5 py-0.5 sm:px-2 rounded-full shadow-subtle border border-black/5 w-fit">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Low Stock Indicator */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-white/95 backdrop-blur-md text-slate-800 text-[8px] sm:text-[9px] font-medium px-2 py-0.5 rounded-full border border-black/5 shadow-subtle flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{product.stock} left</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs mb-1.5 sm:mb-2">
            <span className="text-slate-400 font-medium truncate uppercase text-[8px] sm:text-[9px] tracking-widest max-w-[65%]">
              {product.categoryName}
            </span>
            <div className="flex items-center gap-1 text-slate-700 font-semibold text-[10px] sm:text-[11px] shrink-0">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-brand-400 text-brand-400" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/products/${product.slug}`} className="block group-hover:text-brand-700 transition-colors">
            <h3 className="font-heading font-semibold text-slate-900 text-xs sm:text-base leading-snug line-clamp-2 mb-1.5 sm:mb-2">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-2 sm:pt-3 border-t border-slate-100 mt-1 sm:mt-2">
          <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
            <span className="text-sm sm:text-lg font-extrabold text-brand-dark tracking-tight">
              {formatPrice(effectivePrice)}
            </span>
            {product.salePrice && (
              <span className="text-[11px] sm:text-xs text-slate-400 line-through font-normal">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* CTAs */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button
              onClick={handleQuickAdd}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium text-[10px] sm:text-xs py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-full transition-all flex items-center justify-center gap-1 border border-slate-200/80 active:scale-95 min-h-[36px]"
              aria-label={`Add ${product.name} to bag`}
            >
              <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Add</span>
            </button>

            <button
              onClick={handleQuickOrder}
              className="w-full bg-brand-dark hover:bg-brand-charcoal text-white font-medium text-[10px] sm:text-xs py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-full transition-all shadow-subtle hover:shadow-sm flex items-center justify-center gap-1 active:scale-95 min-h-[36px]"
              aria-label={`Order ${product.name} now`}
            >
              <span>Order</span>
              <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


