"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const isDashboard = pathname === "/admin";

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Universal Admin Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 shadow-md">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Left: Brand or Back to Dashboard Button */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 group transition-transform active:scale-95"
            >
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-brand-500/50 bg-slate-950 shadow-sm">
                <Image src="/logo.jpg" alt="HAZENSHOP" fill className="object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-sm sm:text-base text-white tracking-tight leading-none">
                  HAZENSHOP<span className="text-brand-500">.</span>
                </span>
                <span className="text-[9px] font-bold text-brand-400 uppercase tracking-wider mt-0.5">
                  Store Admin
                </span>
              </div>
            </Link>

            {!isDashboard && (
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700/60"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-brand-400" />
                  <span>Dashboard (ড্যাশবোর্ড)</span>
                </Link>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {!isDashboard && (
              <Link
                href="/admin"
                className="sm:hidden inline-flex items-center gap-1 p-2 rounded-xl bg-slate-800 text-brand-400 text-xs font-bold border border-slate-700/60 min-h-[38px]"
                title="Back to Dashboard"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-[11px]">Dashboard</span>
              </Link>
            )}

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-brand-400 hover:text-brand-300 font-bold text-xs transition-all border border-slate-700/60 min-h-[38px]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">hazenshop.com</span>
              <span className="sm:hidden">Store</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 font-medium text-xs transition-all border border-slate-800 min-h-[38px]"
              title="Sign Out of Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Full-Width Admin Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 space-y-6">
        {children}
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-slate-600 text-xs">
        HAZENSHOP Admin Portal • hazenshop.com
      </footer>
    </div>
  );
}
