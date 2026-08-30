"use client";

import React from "react";
import Link from "next/link";
import { Phone, Truck, Sparkles, ShieldCheck } from "lucide-react";
import { SiteSettings } from "@/lib/types";

export default function AnnouncementBar({ settings }: { settings: SiteSettings }) {
  if (!settings.announcementBarActive) return null;

  const announcementMessage = settings.announcementBarText || "সারাদেশে ক্যাশ অন ডেলিভারি ও ফ্রি শিপিং সুবিধা!";

  return (
    <div className="bg-brand-dark text-slate-300 text-[11px] sm:text-xs py-2 px-3 sm:px-4 border-b border-white/[0.06] tracking-wide overflow-hidden select-none">
      {/* Mobile Continuous Running Text (Marquee Ticker) */}
      <div className="sm:hidden relative w-full overflow-hidden flex items-center">
        <div className="animate-marquee flex items-center shrink-0">
          {[0, 1].map((copyIndex) => (
            <div key={copyIndex} className="flex items-center gap-6 pr-6 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="bg-brand-gold-400 text-brand-dark font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-full tracking-wider shrink-0 shadow-sm">
                  স্পেশাল অফার
                </span>
                <span className="font-medium text-slate-200">{announcementMessage}</span>
              </div>
              <span className="text-white/20">•</span>
              <div className="flex items-center gap-1 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-gold-400 shrink-0" />
                <span>১০০% ক্যাশ অন ডেলিভারি</span>
              </div>
              <span className="text-white/20">•</span>
              <Link
                href={`tel:${settings.hotline}`}
                className="flex items-center gap-1 text-slate-300 hover:text-white"
              >
                <Phone className="w-3 h-3 text-brand-gold-400 shrink-0" />
                <span>হটলাইন: <strong className="font-bold text-slate-100">{settings.hotline}</strong></span>
              </Link>
              <span className="text-white/20">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Clean Static Bar */}
      <div className="hidden sm:flex max-w-7xl mx-auto items-center justify-between gap-4">
        {/* Announcement Message */}
        <div className="flex items-center gap-2.5 truncate">
          <span className="bg-brand-gold-400 text-brand-dark font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-full tracking-wider shrink-0 shadow-sm">
            স্পেশাল অফার
          </span>
          <span className="font-medium text-slate-200 truncate">
            {announcementMessage}
          </span>
        </div>

        {/* Auxiliary Links */}
        <div className="flex items-center gap-5 text-slate-400 text-xs shrink-0 font-normal">
          <Link
            href={`tel:${settings.hotline}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-brand-gold-400" />
            <span>হটলাইন: <strong className="font-bold text-slate-200">{settings.hotline}</strong></span>
          </Link>
          <span className="text-white/10">•</span>
          <Link
            href="/track-order"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Truck className="w-3.5 h-3.5 text-brand-gold-400" />
            <span>পার্সেল ট্র্যাক করুন</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
