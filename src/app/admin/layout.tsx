"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FolderTree,
  Settings,
  ExternalLink,
  Menu,
  X,
  HardDrive,
  LogOut,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: FolderTree },
    { name: "Media & Storage", href: "/admin/storage", icon: HardDrive },
    { name: "Settings & SEO", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header Bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between p-3.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-brand-500/40 shadow-sm bg-slate-950">
            <Image src="/logo.jpg" alt="Hazen" fill className="object-cover" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white tracking-tight leading-none block">
              HAZEN ADMIN
            </span>
            <span className="text-[9px] font-bold text-brand-400 uppercase tracking-wider">
              Store Control
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-400 hover:text-white transition-colors border border-slate-700/60 min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Open Storefront"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 h-screen ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Brand header */}
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-brand-500/50 shadow-md bg-slate-950">
                <Image src="/logo.jpg" alt="Hazen Logo" fill className="object-cover" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-white block leading-none">
                  HAZEN<span className="text-brand-500">.</span>
                </span>
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">
                  Admin Panel
                </span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                    isActive
                      ? "bg-brand-500 text-brand-dark shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-900/60">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-brand-400 transition-colors min-h-[40px]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Live Storefront</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800/80 text-xs font-medium transition-colors min-h-[40px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
          <div className="text-[10px] text-slate-500 text-center pt-1">
            Hazen COD Commerce v2.0
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-950 p-3.5 sm:p-6 lg:p-8 min-h-screen overflow-y-auto pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Sticky Quick Navigation Bar */}
      <nav
        aria-label="Admin Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-2 py-1.5 shadow-2xl flex items-center justify-around pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        {[
          { name: "Overview", href: "/admin", icon: LayoutDashboard },
          { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
          { name: "Products", href: "/admin/products", icon: Package },
          { name: "Categories", href: "/admin/categories", icon: FolderTree },
          { name: "Settings", href: "/admin/settings", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] py-1 px-1 rounded-xl transition-all ${
                isActive
                  ? "text-brand-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              <span className="text-[10px] tracking-tight mt-0.5">{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
