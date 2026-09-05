"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ShieldCheck, Loader2, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter the admin password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push(nextPath);
        router.refresh();
      } else {
        setError(data.error || "Invalid credentials. Try again.");
        if (data.locked || res.status === 429) {
          setIsLocked(true);
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Admin Passkey
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type={showPassword ? "text" : "password"}
              autoFocus
              required
              placeholder="Enter admin password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 text-white rounded-xl pl-10 pr-11 py-3 text-sm border border-slate-800 focus:border-brand-500 focus:outline-none placeholder:text-slate-600 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-medium text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-brand-dark font-black py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-75 min-h-[46px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Session...</span>
            </>
          ) : (
            <>
              <span>Sign In to Admin</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>Protected by HttpOnly Secure Session Cookie</span>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-brand-500/40">
              <Image src="/logo.jpg" alt="Hazen Logo" fill className="object-cover" priority />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              HAZEN<span className="text-brand-500">.</span> Admin Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Enter your authorized credentials to access store management
            </p>
          </div>
        </div>

        {/* Form wrapped in Suspense */}
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading auth...</div>}>
          <LoginForm />
        </Suspense>

        <div className="text-center text-[11px] text-slate-600">
          Hazen E-Commerce Management Engine &bull; Cash on Delivery Suite
        </div>
      </div>
    </div>
  );
}
