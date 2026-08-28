"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, ShoppingBag, Truck, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function MobileNav({ whatsappNumber }: { whatsappNumber: string }) {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, "");

  // Don't show inside admin or on single product detail page where contextual sticky bar is active
  if (pathname.startsWith("/admin") || (pathname.startsWith("/products/") && pathname !== "/products")) {
    return null;
  }


  const isHome = pathname === "/";
  const isCollections = pathname.startsWith("/products") || pathname.startsWith("/category");
  const isTracking = pathname === "/track-order";

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-black/[0.06] pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] px-3 md:hidden shadow-floating"
    >
      <div className="grid grid-cols-5 items-center justify-items-center max-w-md mx-auto">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center min-h-[44px] w-full py-1 rounded-xl transition-all ${
            isHome
              ? "text-brand-dark font-semibold"
              : "text-slate-400 hover:text-slate-600 active:scale-95"
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${isHome ? "scale-105 stroke-[2]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Overview</span>
        </Link>

        <Link
          href="/products"
          className={`flex flex-col items-center justify-center min-h-[44px] w-full py-1 rounded-xl transition-all ${
            isCollections
              ? "text-brand-dark font-semibold"
              : "text-slate-400 hover:text-slate-600 active:scale-95"
          }`}
        >
          <Grid className={`w-5 h-5 transition-transform ${isCollections ? "scale-105 stroke-[2]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Collections</span>
        </Link>

        <button
          onClick={openCart}
          className="relative flex flex-col items-center justify-center min-h-[44px] w-full py-1 rounded-xl text-slate-700 hover:text-brand-dark active:scale-95 transition-all"
          aria-label={`Open Bag with ${totalItems} items`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-brand-dark text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Bag</span>
        </button>

        <Link
          href="/track-order"
          className={`flex flex-col items-center justify-center min-h-[44px] w-full py-1 rounded-xl transition-all ${
            isTracking
              ? "text-brand-dark font-semibold"
              : "text-slate-400 hover:text-slate-600 active:scale-95"
          }`}
        >
          <Truck className={`w-5 h-5 transition-transform ${isTracking ? "scale-105 stroke-[2]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Track</span>
        </Link>

        <a
          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            "Hello Hazen! I would like to inquire about your collections."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center min-h-[44px] w-full py-1 rounded-xl text-emerald-600 hover:text-emerald-700 active:scale-95 transition-all"
        >
          <MessageCircle className="w-5 h-5 stroke-[1.75]" />
          <span className="text-[10px] tracking-tight mt-0.5">WhatsApp</span>
        </a>
      </div>
    </nav>
  );
}


