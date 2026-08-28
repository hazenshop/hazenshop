"use client";

import React from "react";
import Link from "next/link";
import { Phone, Truck } from "lucide-react";
import { SiteSettings } from "@/lib/types";

export default function AnnouncementBar({ settings }: { settings: SiteSettings }) {
  if (!settings.announcementBarActive) return null;

  return (
    <div className="bg-brand-dark text-slate-300 text-[11px] sm:text-xs py-2 px-4 border-b border-white/[0.06] tracking-wide">
      <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-between gap-3">
        {/* Announcement Message */}
        <div className="flex items-center gap-2 text-center truncate">
          <span className="bg-brand-500 text-brand-dark font-bold text-[9px] uppercase px-1.5 py-0.5 rounded-full tracking-wider shrink-0">
            Complimentary
          </span>
          <span className="font-medium text-slate-200 truncate">
            {settings.announcementBarText}
          </span>
        </div>

        {/* Auxiliary Links */}
        <div className="hidden sm:flex items-center gap-5 text-slate-400 text-xs shrink-0 font-normal">
          <Link
            href={`tel:${settings.hotline}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="w-3 h-3 text-brand-400" />
            <span>Concierge: <strong className="font-medium text-slate-200">{settings.hotline}</strong></span>
          </Link>
          <span className="text-white/10">•</span>
          <Link
            href="/track-order"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Truck className="w-3.5 h-3.5 text-brand-400" />
            <span>Track Parcel</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

