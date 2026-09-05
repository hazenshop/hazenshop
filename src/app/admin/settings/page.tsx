"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Phone,
  MessageCircle,
  Truck,
  Sparkles,
  Globe,
  Tag,
  Loader2,
  Share2,
} from "lucide-react";
import { SiteSettings } from "@/lib/types";
import { useToast } from "@/context/ToastContext";

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        showToast("সাইটের সেটিংস সফলভাবে আপডেট করা হয়েছে! (Settings saved)", "success");
      } else {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "সেটিংস সংরক্ষণ করা যায়নি। দয়া করে ইনপুটগুলো চেক করুন। (Failed to save)");
      }
    } catch (e: any) {
      showToast(e?.message || "Error updating settings. Please check your connection.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="py-20 text-center text-slate-400">Loading store settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Site Settings & Live Storefront Controls
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            হটলাইন, হোয়াটসঅ্যাপ নম্বর, ডেলিভারি চার্জ, হোমপেজ ব্যানার এবং এসইও মেটা কনফিগার করুন
          </p>
        </div>

        <button
          form="settings-form"
          type="submit"
          disabled={saving}
          className="bg-brand-500 hover:bg-brand-600 text-brand-dark font-black text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50 min-h-[44px]"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save All Settings</span>
        </button>
      </div>

      <form id="settings-form" onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        {/* Contact & Social Communication */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-bold text-sm">
            <Phone className="w-4 h-4 text-brand-400" />
            <span>কাস্টমার হটলাইন ও হোয়াটসঅ্যাপ হেল্পলাইন (Hotline & WhatsApp)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Store Hotline Phone Number</label>
              <input
                type="text"
                value={settings.hotline}
                onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
                className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">WhatsApp Order Number (e.g. 017XXXXXXXX)</label>
              <input
                type="text"
                placeholder="017XXXXXXXX"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 font-bold text-emerald-400"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Store Name / Brand</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 font-bold"
              />
            </div>
          </div>
        </div>



        {/* Announcement Ticker Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Top Announcement Ticker Bar</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="barActive"
                checked={settings.announcementBarActive}
                onChange={(e) => setSettings({ ...settings, announcementBarActive: e.target.checked })}
                className="w-4 h-4 rounded text-brand-500"
              />
              <label htmlFor="barActive" className="text-slate-300 font-bold cursor-pointer">Enabled</label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Announcement Message Text</label>
            <input
              type="text"
              value={settings.announcementBarText}
              onChange={(e) => setSettings({ ...settings, announcementBarText: e.target.value })}
              className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 font-medium"
            />
          </div>
        </div>

        {/* Delivery Charges Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-bold text-sm">
            <Truck className="w-4 h-4 text-brand-400" />
            <span>Delivery Tariffs & Complimentary Shipping Rule</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Inside Dhaka (৳)</label>
              <input
                type="number"
                value={settings.dhakaDeliveryFee}
                onChange={(e) => setSettings({ ...settings, dhakaDeliveryFee: Number(e.target.value) })}
                className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Outside Dhaka (৳)</label>
              <input
                type="number"
                value={settings.outsideDhakaDeliveryFee}
                onChange={(e) => setSettings({ ...settings, outsideDhakaDeliveryFee: Number(e.target.value) })}
                className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Suburbs / Surrounding (৳)</label>
              <input
                type="number"
                value={settings.suburbsDeliveryFee}
                onChange={(e) => setSettings({ ...settings, suburbsDeliveryFee: Number(e.target.value) })}
                className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Free Delivery on (৳)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 font-bold text-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Marketing & Analytics Integrations (Facebook Pixel) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-bold text-sm">
            <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-black flex items-center justify-center text-xs">f</span>
            <span>Facebook Pixel / Meta Ads Tracking Integration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300">
                Facebook Pixel ID (Meta Pixel Dataset ID)
              </label>
              <input
                type="text"
                placeholder="e.g. 2242388576616945"
                value={settings.facebookPixelId || ""}
                onChange={(e) => setSettings({ ...settings, facebookPixelId: e.target.value.trim() })}
                className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 font-mono text-sm focus:border-blue-500 focus:outline-none placeholder:text-slate-600"
              />
              <p className="text-[11px] text-slate-400 leading-normal">
                মেটা বিজনেস ম্যানেজারের Pixel/Dataset ID। স্বয়ংক্রিয়ভাবে PageView, ViewContent, AddToCart ও Purchase ট্র্যাক হবে।
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300">
                Meta Test Event Code (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. TEST82490"
                value={settings.facebookTestEventCode || ""}
                onChange={(e) => setSettings({ ...settings, facebookTestEventCode: e.target.value.trim() })}
                className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 font-mono text-sm focus:border-blue-500 focus:outline-none placeholder:text-slate-600"
              />
              <p className="text-[11px] text-slate-400 leading-normal">
                Meta Events Manager &gt; Test Events ট্যাবের টেস্ট কোড (যেমন: TEST82490)। লাইভ টেস্ট চেক করতে ব্যবহার করুন।
              </p>
            </div>
          </div>
        </div>

        {/* Courier Automation APIs (Steadfast & Pathao) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>🚚 কুরিয়ার অটোমেশন এপিআই (Steadfast & Pathao Courier APIs)</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full font-bold">
              1-Click Send to Courier
            </span>
          </div>

          <div className="space-y-6">
            {/* 1. Steadfast Courier */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-sm text-white">Steadfast Courier Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="steadfastActive"
                    checked={settings.steadfastEnabled ?? true}
                    onChange={(e) => setSettings({ ...settings, steadfastEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500"
                  />
                  <label htmlFor="steadfastActive" className="text-slate-300 font-bold text-xs cursor-pointer">
                    Enabled
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Steadfast API Key</label>
                  <input
                    type="text"
                    placeholder="Enter Steadfast API Key"
                    value={settings.steadfastApiKey || ""}
                    onChange={(e) => setSettings({ ...settings, steadfastApiKey: e.target.value.trim() })}
                    className="w-full bg-slate-900 text-white rounded-xl p-3 border border-slate-800 font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Steadfast Secret Key</label>
                  <input
                    type="password"
                    placeholder="Enter Steadfast Secret Key"
                    value={settings.steadfastSecretKey || ""}
                    onChange={(e) => setSettings({ ...settings, steadfastSecretKey: e.target.value.trim() })}
                    className="w-full bg-slate-900 text-white rounded-xl p-3 border border-slate-800 font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-slate-400">
                  Steadfast Merchant Portal &gt; API Credentials থেকে এপিআই ও সিক্রেট কি সংগ্রহ করুন।
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    showToast("Testing Steadfast connection...");
                    try {
                      const res = await fetch("/api/courier/test", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ courier: "steadfast", settings }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        showToast(`Steadfast Connected! Balance: ৳${data.currentBalance ?? 0}`, "success");
                      } else {
                        showToast(data.message || "Failed to connect to Steadfast", "error");
                      }
                    } catch {
                      showToast("Error testing Steadfast", "error");
                    }
                  }}
                  className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/80 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors shrink-0"
                >
                  Test Connection
                </button>
              </div>
            </div>

            {/* 2. Pathao Courier */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="font-bold text-sm text-white">Pathao Courier Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pathaoActive"
                    checked={settings.pathaoEnabled ?? true}
                    onChange={(e) => setSettings({ ...settings, pathaoEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-500"
                  />
                  <label htmlFor="pathaoActive" className="text-slate-300 font-bold text-xs cursor-pointer">
                    Enabled
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Pathao Client ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 1234"
                    value={settings.pathaoClientId || ""}
                    onChange={(e) => setSettings({ ...settings, pathaoClientId: e.target.value.trim() })}
                    className="w-full bg-slate-900 text-white rounded-xl p-3 border border-slate-800 font-mono text-xs focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Pathao Client Secret</label>
                  <input
                    type="password"
                    placeholder="Enter Pathao Client Secret"
                    value={settings.pathaoClientSecret || ""}
                    onChange={(e) => setSettings({ ...settings, pathaoClientSecret: e.target.value.trim() })}
                    className="w-full bg-slate-900 text-white rounded-xl p-3 border border-slate-800 font-mono text-xs focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Pathao Registered Email / Username</label>
                  <input
                    type="email"
                    placeholder="merchant@example.com"
                    value={settings.pathaoUsername || ""}
                    onChange={(e) => setSettings({ ...settings, pathaoUsername: e.target.value.trim() })}
                    className="w-full bg-slate-900 text-white rounded-xl p-3 border border-slate-800 text-xs focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Pathao Password</label>
                  <input
                    type="password"
                    placeholder="Enter Pathao account password"
                    value={settings.pathaoPassword || ""}
                    onChange={(e) => setSettings({ ...settings, pathaoPassword: e.target.value.trim() })}
                    className="w-full bg-slate-900 text-white rounded-xl p-3 border border-slate-800 font-mono text-xs focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Pathao Store ID (Pickup Hub)</label>
                  <input
                    type="text"
                    placeholder="e.g. 5678"
                    value={settings.pathaoStoreId || ""}
                    onChange={(e) => setSettings({ ...settings, pathaoStoreId: e.target.value.trim() })}
                    className="w-full bg-slate-900 text-white rounded-xl p-3 border border-slate-800 font-mono text-xs focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="pathaoSandbox"
                    checked={settings.pathaoSandbox ?? false}
                    onChange={(e) => setSettings({ ...settings, pathaoSandbox: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <label htmlFor="pathaoSandbox" className="text-slate-300 font-bold text-xs cursor-pointer">
                    Use Pathao Sandbox (Test Environment)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-slate-400">
                  Pathao Developer / Merchant Portal &gt; API Credentials থেকে ক্লায়েন্ট আইডি ও সিক্রেট সংগ্রহ করুন।
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    showToast("Testing Pathao connection & fetching stores...");
                    try {
                      const res = await fetch("/api/courier/test", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ courier: "pathao", settings }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        const storesCount = data.stores?.length || 0;
                        showToast(`Pathao Connected! Found ${storesCount} stores.`, "success");
                        if (storesCount > 0 && !settings.pathaoStoreId) {
                          setSettings({ ...settings, pathaoStoreId: String(data.stores[0].store_id) });
                        }
                      } else {
                        showToast(data.message || "Failed to connect to Pathao", "error");
                      }
                    } catch {
                      showToast("Error testing Pathao", "error");
                    }
                  }}
                  className="bg-rose-950/80 hover:bg-rose-900 text-rose-400 border border-rose-800/80 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors shrink-0"
                >
                  Test &amp; Fetch Stores
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Global SEO Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-bold text-sm">
            <Globe className="w-4 h-4 text-brand-400" />
            <span>Global SEO & OpenGraph Social Meta Tags</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Global SEO Title</label>
              <input
                type="text"
                value={settings.seoTitle}
                onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
                className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Global Meta Description</label>
              <textarea
                rows={3}
                value={settings.seoDescription}
                onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
                className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 font-medium resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">SEO Target Keywords (Comma separated)</label>
              <input
                type="text"
                value={settings.seoKeywords ? settings.seoKeywords.join(", ") : ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    seoKeywords: e.target.value.split(",").map((k) => k.trim()),
                  })
                }
                className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 font-medium"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
