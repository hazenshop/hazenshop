"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import AnnouncementBar from "@/components/header/AnnouncementBar";
import Navbar from "@/components/header/Navbar";
import Footer from "@/components/footer/Footer";
import MobileNav from "@/components/header/MobileNav";
import CartDrawer from "@/components/cart/CartDrawer";
import QuickOrderModal from "@/components/product/QuickOrderModal";
import { Category, SiteSettings } from "@/lib/types";

export default function StorefrontShell({
  children,
  settings,
  categories,
}: {
  children: React.ReactNode;
  settings: SiteSettings;
  categories: Category[];
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  const cleanWhatsAppNumber = (settings.whatsappNumber || "01700000000").replace(/[^0-9]/g, "");
  const formattedWhatsApp = cleanWhatsAppNumber.startsWith("88") ? cleanWhatsAppNumber : `88${cleanWhatsAppNumber}`;
  const whatsappUrl = `https://wa.me/${formattedWhatsApp}?text=${encodeURIComponent(
    "আসসালামু আলাইকুম Hazen! আমি আপনাদের পণ্য ও কালেকশন সম্পর্কে জানতে চাই।"
  )}`;

  return (
    <div className="flex flex-col min-h-screen relative w-full overflow-x-hidden">
      <AnnouncementBar settings={settings} />
      <Navbar settings={settings} categories={categories} />
      <main className="flex-1 pb-20 md:pb-0 w-full min-w-0">{children}</main>
      <Footer settings={settings} categories={categories} />
      <MobileNav whatsappNumber={settings.whatsappNumber} />
      <CartDrawer freeShippingThreshold={settings.freeShippingThreshold} />
      <QuickOrderModal settings={settings} />

      {/* Floating WhatsApp Action Button on Desktop & Tablet */}
      <aside aria-label="WhatsApp Support" className="hidden sm:block fixed bottom-6 right-6 z-40">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs px-4 py-3 rounded-full shadow-card hover:shadow-card-hover transition-all duration-300 group border border-white/20"
        >
          <MessageCircle className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
          <span>হোয়াটসঅ্যাপে কথা বলুন</span>
        </a>
      </aside>
    </div>
  );
}

