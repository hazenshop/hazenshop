import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, Truck, ShieldCheck } from "lucide-react";
import { Category, SiteSettings } from "@/lib/types";

export default function Footer({
  settings,
  categories,
}: {
  settings: SiteSettings;
  categories: Category[];
}) {
  return (
    <footer className="bg-brand-dark text-slate-300 pt-16 pb-24 md:pb-12 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/[0.08]">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-slate-900">
                <Image
                  src="/logo.jpg"
                  alt="Hazen Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-xl tracking-tight text-white leading-none">
                  HAZEN<span className="text-brand-400">.</span>
                </span>
                <span className="text-[9px] font-semibold tracking-widest text-slate-400 uppercase mt-0.5">
                  Luxury Bedsheets & Window Curtains
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Curating export-quality Egyptian cotton bedsheet sets, blackout window curtains (পর্দা), and cloud comforters delivered directly across Bangladesh with seamless Cash on Delivery.
            </p>
            <div className="pt-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                <span>100% Quality & Fabric Guarantee</span>
              </div>
            </div>

          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs uppercase tracking-widest text-white font-semibold">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-normal">
              <li>
                <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-slate-400 hover:text-white transition-colors">
                  All Collections
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-brand-400" />
                  <span>Track Parcel</span>
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-slate-500 hover:text-slate-300 transition-colors">
                  Store Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs uppercase tracking-widest text-white font-semibold">
              Collections
            </h4>
            <ul className="space-y-2 text-xs font-normal">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Concierge */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs uppercase tracking-widest text-white font-semibold">
              Concierge
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-brand-400 shrink-0 border border-white/10">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Hotline</span>
                  <a href={`tel:${settings.hotline}`} className="font-semibold text-slate-200 hover:text-white">
                    {settings.hotline}
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-brand-400 shrink-0 border border-white/10">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Email</span>
                  <a href={`mailto:${settings.supportEmail}`} className="font-medium text-slate-200 hover:text-white">
                    {settings.supportEmail}
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-brand-400 shrink-0 border border-white/10">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Dispatch Center</span>
                  <span className="text-slate-300 text-xs">Dhaka, Bangladesh</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} HAZEN Luxury Living. All rights reserved.</p>
          <p className="text-slate-400">
            Crafted for tranquil living & restorative slumber
          </p>
        </div>
      </div>
    </footer>
  );
}

