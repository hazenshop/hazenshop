"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Truck,
  PhoneCall,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Category, Product, SiteSettings } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function Navbar({
  settings,
  categories,
}: {
  settings: SiteSettings;
  categories: Category[];
}) {
  const router = useRouter();
  const { totalItems, openCart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveResults, setLiveResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced live search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setLiveResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        if (data.products) {
          setLiveResults(data.products.slice(0, 4));
          setShowDropdown(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-black/[0.05] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden shadow-subtle group-hover:scale-105 transition-transform border border-black/5 bg-slate-50">
              <Image
                src="/logo.jpg"
                alt="Hazen Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight text-brand-dark leading-none">
                HAZEN<span className="text-brand-500">.</span>
              </span>
              <span className="text-[9px] font-semibold tracking-widest text-slate-400 uppercase mt-0.5">
                Luxury Living
              </span>
            </div>
          </Link>

          {/* Minimal Spotlight Search Bar */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-md relative items-center mx-6">
            <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center">
              <input
                type="text"
                placeholder="Search collection, fabrics, sizes..."
                value={searchQuery}
                onFocus={() => liveResults.length > 0 && setShowDropdown(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50/80 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-brand-dark rounded-full pl-10 pr-24 py-2.5 border border-slate-200/80 focus:border-brand-500/80 focus:ring-2 focus:ring-brand-500/10 focus:outline-none transition-all placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1.5 bg-brand-dark hover:bg-brand-charcoal text-white font-medium text-xs px-3.5 py-1.5 rounded-full transition-all shadow-subtle hover:shadow-sm"
              >
                Search
              </button>
            </form>

            {/* Live Autocomplete Dropdown */}
            {showDropdown && liveResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden z-50 p-2 space-y-1 backdrop-blur-md">
                <div className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-widest">
                  Matching Items
                </div>
                {liveResults.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-brand-50 transition-colors group"
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-50 border border-slate-100">
                      <Image src={p.images[0] || "/logo.jpg"} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 truncate group-hover:text-brand-700">
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-brand-700">
                          {formatPrice(p.salePrice ?? p.price)}
                        </span>
                        {p.badge && (
                          <span className="text-[9px] bg-brand-100 text-brand-800 font-semibold px-1.5 py-0.5 rounded">
                            {p.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-700 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full text-center py-2 text-xs font-semibold text-brand-700 hover:bg-slate-50 rounded-xl transition-colors border-t border-slate-100 block"
                >
                  View all results for &quot;{searchQuery}&quot; →
                </button>
              </div>
            )}
          </div>

          {/* Action Navigation */}
          <div className="flex items-center gap-3">
            {/* Track Order CTA */}
            <Link
              href="/track-order"
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-full text-slate-600 hover:text-brand-dark hover:bg-slate-100/70 text-xs font-medium transition-all"
            >
              <Truck className="w-4 h-4 text-slate-500" />
              <span>Track Parcel</span>
            </Link>

            {/* Hotline Call Button */}
            <Link
              href={`tel:${settings.hotline}`}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-100/80 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-all border border-slate-200/60"
            >
              <PhoneCall className="w-3.5 h-3.5 text-brand-600" />
              <span>{settings.hotline}</span>
            </Link>

            {/* Minimal Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 sm:px-4 sm:py-2.5 rounded-full bg-brand-dark hover:bg-brand-charcoal text-white transition-all shadow-subtle hover:shadow-card flex items-center gap-2 font-medium"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-semibold tracking-wide">
                Bag
              </span>
              {totalItems > 0 && (
                <span className="bg-brand-500 text-brand-dark text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full text-slate-700 hover:bg-slate-100 md:hidden transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center justify-between py-2 border-t border-slate-100/80 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-7 tracking-wide">
            <Link
              href="/"
              className="hover:text-brand-dark transition-colors font-semibold text-brand-dark"
            >
              Overview
            </Link>
            <Link
              href="/products"
              className="hover:text-brand-dark transition-colors"
            >
              All Collections
            </Link>
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="hover:text-brand-dark transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              Cash on Delivery (ক্যাশ অন ডেলিভারি)
            </span>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl p-4 space-y-4 shadow-card">
          {/* Mobile Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search bedsheets & bedding..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-xs rounded-full pl-9 pr-20 py-2.5 border border-slate-200/80 focus:outline-none focus:border-brand-500 text-slate-900"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1 bg-brand-dark text-white font-medium text-xs px-3 py-1.5 rounded-full"
            >
              Search
            </button>
          </form>

          {/* Navigation Links */}
          <div className="space-y-1 text-sm font-medium text-slate-800">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-slate-50"
            >
              Overview
            </Link>
            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-slate-50"
            >
              All Collections
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-600"
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/track-order"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-brand-700 bg-brand-50 font-semibold"
            >
              Track Parcel
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100 text-xs text-center">
            <a
              href={`tel:${settings.hotline}`}
              className="inline-flex items-center gap-1.5 text-slate-700 font-medium"
            >
              <PhoneCall className="w-3.5 h-3.5 text-brand-600" />
              <span>Concierge Hotline: {settings.hotline}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

