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
  ChevronDown,
  Sparkles,
  Grid,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Category, Product, SiteSettings } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import CategoryPillsBar from "./CategoryPillsBar";

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
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

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

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/[0.05] transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden shadow-subtle group-hover:scale-105 transition-transform border border-black/5 bg-slate-50">
              <Image
                src="/logo.jpg"
                alt="Hazen Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-lg sm:text-2xl tracking-tight text-brand-dark leading-none">
                HAZENSHOP BD<span className="text-brand-maroon-700">.</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
                hazenshopbd.com
              </span>
            </div>
          </Link>

          {/* Spotlight Search Bar */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-md relative items-center mx-4">
            <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center">
              <input
                type="text"
                placeholder="পণ্য, চাদর বা পর্দা খুঁজুন..."
                value={searchQuery}
                onFocus={() => liveResults.length > 0 && setShowDropdown(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50/80 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-brand-dark rounded-full pl-10 pr-20 py-2.5 border border-slate-200/80 focus:border-brand-maroon-700 focus:ring-2 focus:ring-brand-maroon-700/10 focus:outline-none transition-all placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1.5 bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-full transition-all shadow-subtle"
              >
                খুঁজুন
              </button>
            </form>

            {/* Live Autocomplete Dropdown */}
            {showDropdown && liveResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden z-50 p-2 space-y-1 backdrop-blur-md">
                <div className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-widest">
                  পণ্য তালিকা
                </div>
                {liveResults.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-brand-50 transition-colors group"
                  >
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <Image
                        src={p.images[0] || "/logo.jpg"}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-semibold text-slate-900 group-hover:text-brand-maroon-700 truncate">
                        {p.name}
                      </h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-brand-maroon-700">
                          {formatPrice(p.salePrice ?? p.price)}
                        </span>
                        {p.badge && (
                          <span className="text-[9px] bg-brand-50 text-brand-maroon-800 font-semibold px-1.5 py-0.5 rounded">
                            {p.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-maroon-700 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full text-center py-2 text-xs font-semibold text-brand-maroon-700 hover:bg-slate-50 rounded-xl transition-colors border-t border-slate-100 block"
                >
                  &quot;{searchQuery}&quot; এর সকল ফলাফল দেখুন →
                </button>
              </div>
            )}
          </div>

          {/* Action Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Track Order CTA */}
            <Link
              href="/track-order"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-full text-slate-600 hover:text-brand-maroon-700 hover:bg-brand-50/50 text-xs font-bold transition-all"
            >
              <Truck className="w-4 h-4 text-slate-500" />
              <span>পার্সেল ট্র্যাক</span>
            </Link>

            {/* Hotline Call Button */}
            <Link
              href={`tel:${settings.hotline}`}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-100/80 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-all border border-slate-200/60"
            >
              <PhoneCall className="w-3.5 h-3.5 text-brand-maroon-700" />
              <span>কল:</span>
              <span className="font-bold text-slate-900">{settings.hotline}</span>
            </Link>

            {/* Bag Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 sm:px-4 sm:py-2.5 rounded-full bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white transition-all shadow-subtle hover:shadow-card flex items-center gap-2 font-bold min-h-[44px]"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-4 h-4 text-brand-gold-300" />
              <span className="hidden sm:inline text-xs font-bold tracking-wide">
                ব্যাগ
              </span>
              {totalItems > 0 && (
                <span className="bg-brand-gold-400 text-brand-dark text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-4 text-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMobileMenuOpen((prev) => !prev);
              }}
              className="p-2 rounded-full text-slate-700 hover:bg-slate-100 md:hidden transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer z-20"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <Menu className="w-5 h-5 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links with Mega-Menu */}
        <nav className="hidden md:flex items-center justify-between py-2.5 border-t border-slate-100 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-7 tracking-wide">
            <Link
              href="/"
              className="hover:text-brand-maroon-700 transition-colors font-semibold text-slate-900"
            >
              Home
            </Link>

            {/* Categories Mega Menu Trigger */}
            <div
              ref={megaMenuRef}
              className="relative"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className="flex items-center gap-1 hover:text-brand-maroon-700 font-semibold transition-colors py-1 cursor-pointer"
              >
                <span>All Collections</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMegaMenuOpen ? "rotate-180 text-brand-maroon-700" : ""}`} />
              </button>

              {/* Mega-Menu Dropdown Panel */}
              {isMegaMenuOpen && (
                <div className="absolute top-full -left-4 w-[640px] bg-white rounded-3xl p-6 shadow-floating border border-black/[0.08] z-50 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="col-span-2 flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Explore Handcrafted Living Departments
                    </span>
                    <Link
                      href="/products"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="text-xs font-bold text-brand-maroon-700 hover:underline flex items-center gap-1"
                    >
                      <span>View Full Catalog</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-slate-100/80 transition-all group"
                    >
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <Image
                          src={c.image || "/logo.jpg"}
                          alt={c.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-maroon-700 truncate">
                          {c.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-normal">
                          {c.description || "Premium quality crafted fabrics"}
                        </p>
                        {c.featured && (
                          <span className="inline-block mt-1 text-[9px] font-extrabold uppercase text-brand-maroon-700 bg-brand-100/70 px-2 py-0.2 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Popular Category Links */}
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="hover:text-brand-maroon-700 font-medium transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              ১০০% ক্যাশ অন ডেলিভারি
            </span>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/98 backdrop-blur-xl px-4 py-4 space-y-4 shadow-floating max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
          {/* Mobile Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="পণ্য খুঁজুন (Search bedsheets, curtains)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/90 text-xs rounded-xl pl-9 pr-10 py-2.5 border border-slate-200 focus:outline-none focus:border-brand-maroon-700 text-slate-900 placeholder:text-slate-400 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Quick Primary Navigation Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold border border-slate-100 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-brand-maroon-700 shrink-0" />
              <span>হোমপেজ (Home)</span>
            </Link>

            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 rounded-xl bg-brand-50/80 hover:bg-brand-50 text-brand-maroon-700 font-bold border border-brand-100 transition-colors"
            >
              <Grid className="w-4 h-4 text-brand-maroon-700 shrink-0" />
              <span>সকল পণ্য (Shop All)</span>
            </Link>
          </div>

          {/* Categories Grid (2 Columns Compact & Clean) */}
          {categories.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                  কালেকশন ও বিভাগসমূহ
                </span>
                <Link
                  href="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[11px] font-bold text-brand-maroon-700 hover:underline"
                >
                  সব দেখুন &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 transition-all group"
                  >
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-black/5">
                      <Image
                        src={c.image || "/logo.jpg"}
                        alt={c.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-brand-maroon-700">
                      {c.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Utility Links */}
          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <Link
              href="/track-order"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium border border-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-maroon-700" />
                <span>পার্সেল ট্র্যাক করুন (Track Parcel)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

          {/* Customer Support Contact */}
          <div className="pt-2 border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-maroon-700 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">কাস্টমার হেল্পলাইন</span>
                  <a
                    href={`tel:${settings.hotline}`}
                    className="text-xs font-bold text-slate-900 hover:text-brand-maroon-700"
                  >
                    {settings.hotline}
                  </a>
                </div>
              </div>

              {settings.whatsappNumber && (
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-colors shrink-0"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
