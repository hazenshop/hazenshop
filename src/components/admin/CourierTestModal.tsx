"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Clock,
  Store,
  Wallet,
  ShieldCheck,
  ExternalLink,
  Check,
} from "lucide-react";
import { SiteSettings } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface PathaoStoreItem {
  store_id: number;
  store_name: string;
  store_address: string;
  is_active: number;
}

interface TestResult {
  success: boolean;
  message: string;
  endpoint?: string;
  durationMs?: number;
  currentBalance?: number;
  stores?: PathaoStoreItem[];
  diagnostic?: string;
}

export default function CourierTestModal({
  isOpen,
  courier,
  settings,
  onClose,
  onApplyStoreId,
}: {
  isOpen: boolean;
  courier: "steadfast" | "pathao" | null;
  settings: SiteSettings;
  onClose: () => void;
  onApplyStoreId?: (storeId: string) => void;
}) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [appliedStoreId, setAppliedStoreId] = useState<number | null>(null);

  const runTest = async () => {
    if (!courier) return;
    setTesting(true);
    setResult(null);

    try {
      const res = await fetch("/api/courier/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courier, settings }),
      });

      const data: TestResult = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : "নেটওয়ার্ক বা সার্ভার কানেকশন এরর হয়েছে।",
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    if (isOpen && courier) {
      runTest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, courier]);

  if (!isOpen || !courier) return null;

  const courierTitle = courier === "steadfast" ? "Steadfast Courier API" : "Pathao Courier API";
  const courierColor = courier === "steadfast" ? "emerald" : "rose";

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto text-slate-100">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                courier === "steadfast"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
            >
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">{courierTitle} Live Diagnostic</h3>
              <p className="text-[11px] text-slate-400">এপিআই সংযোগ ও লাইভ রেসপন্স টেস্ট</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 text-xs">
          {/* Loading State */}
          {testing && (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <Loader2 className={`w-10 h-10 animate-spin text-${courierColor}-400`} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-white">কুরিয়ার সার্ভারের সাথে যোগাযোগ করা হচ্ছে...</h4>
                <p className="text-slate-400 text-[11px]">
                  {courier === "steadfast"
                    ? "Steadfast API Key & Secret Key যাচাই ও ব্যালেন্স চেক করা হচ্ছে..."
                    : "Pathao OAuth 2.0 টোকেন সংগ্রহ ও হাব স্টোর ভ্যালিডেট করা হচ্ছে..."}
                </p>
              </div>
            </div>
          )}

          {/* Test Results */}
          {!testing && result && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  result.success
                    ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                    : "bg-rose-950/40 border-rose-800/60 text-rose-300"
                }`}
              >
                {result.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 min-w-0 flex-1">
                  <h4 className="font-black text-sm">
                    {result.success
                      ? `${courierTitle} সফলভাবে সংযুক্ত হয়েছে! (Connected)`
                      : "কানেকশন ব্যর্থ হয়েছে (Connection Failed)"}
                  </h4>
                  <p className="text-[11px] opacity-90 leading-relaxed break-words">{result.message}</p>
                </div>
              </div>

              {/* Latency & Endpoint Info */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px]">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400">রেসপন্স সময়:</span>
                  <strong className="text-white font-mono">{result.durationMs ?? 0} ms</strong>
                </div>
                <div className="flex items-center gap-2 justify-end truncate">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span className="text-slate-400 truncate">
                    {result.success ? "SSL সিকিউরড" : "অথেনটিকেশন এরর"}
                  </span>
                </div>
              </div>

              {/* Specific Courier Details */}
              {/* 1. Steadfast Success Details */}
              {result.success && courier === "steadfast" && (
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Wallet className="w-4 h-4" />
                      <span>মার্চেন্ট অ্যাকাউন্ট ব্যালেন্স:</span>
                    </div>
                    <span className="text-lg font-black text-white font-mono">
                      {formatPrice(result.currentBalance ?? 0)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-emerald-900/50 flex items-center justify-between text-[11px] text-emerald-300">
                    <span>স্ট্যাটাস: 1-Click Send to Steadfast রেডি</span>
                    <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                      Active
                    </span>
                  </div>
                </div>
              )}

              {/* 2. Pathao Success Details (Stores list) */}
              {result.success && courier === "pathao" && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-rose-400" />
                      <span>আপনার রেজিস্টার্ড পিকআপ হাব / স্টোরসমূহ:</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {result.stores?.length || 0} টি স্টোর পাওয়া গেছে
                    </span>
                  </div>

                  {result.stores && result.stores.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {result.stores.map((store) => {
                        const isApplied = appliedStoreId === store.store_id || settings.pathaoStoreId === String(store.store_id);
                        return (
                          <div
                            key={store.store_id}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                              isApplied
                                ? "bg-rose-950/40 border-rose-600/60"
                                : "bg-slate-950 border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <strong className="text-white text-xs">{store.store_name}</strong>
                                <span className="font-mono text-[10px] text-rose-400 bg-rose-950/60 border border-rose-900 px-1.5 rounded">
                                  ID: {store.store_id}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">{store.store_address}</p>
                            </div>

                            {onApplyStoreId && (
                              <button
                                type="button"
                                onClick={() => {
                                  onApplyStoreId(String(store.store_id));
                                  setAppliedStoreId(store.store_id);
                                }}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-1 shrink-0 transition-all ${
                                  isApplied
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                    : "bg-rose-600 hover:bg-rose-500 text-white"
                                }`}
                              >
                                {isApplied ? <Check className="w-3 h-3" /> : null}
                                <span>{isApplied ? "Applied" : "Use This"}</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-center">
                      কোনো পিকআপ স্টোর পাওয়া যায়নি। পাঠাও মার্চেন্ট প্যানেলে পিকআপ হাব যোগ করুন।
                    </div>
                  )}
                </div>
              )}

              {/* Error Troubleshooting Guide */}
              {!result.success && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>সমস্যা সমাধানের উপায় (How to Fix):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed">
                    {courier === "steadfast" ? (
                      <>
                        <li>Steadfast Merchant Portal &gt; API Settings থেকে সঠিক <strong>API Key</strong> ও <strong>Secret Key</strong> কপি করেছেন কিনা চেক করুন।</li>
                        <li>কোনো এক্সট্রা স্পেস বা ভুল অক্ষর নেই তা নিশ্চিত করুন।</li>
                        <li>আপনার Steadfast একাউন্ট সক্রিয় এবং মার্চেন্ট চুক্তি সম্পন্ন কিনা যাচাই করুন।</li>
                      </>
                    ) : (
                      <>
                        <li>Pathao Developer Portal থেকে <strong>Client ID</strong> এবং <strong>Client Secret</strong> পুনরায় কপি করুন।</li>
                        <li>আপনার Pathao রেজিস্টার্ড ইমেইল ও পাসওয়ার্ড সঠিক দিয়েছেন কিনা চেক করুন।</li>
                        <li>যদি লাইভ একাউন্ট হয়, তবে <strong>Sandbox</strong> অপশনটি টিক চিহ্ন মুক্ত রাখুন।</li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={testing}
            onClick={runTest}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`} />
            <span>Re-Test Connection</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-brand-dark font-black text-xs transition-colors shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
