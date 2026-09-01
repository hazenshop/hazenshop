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
  Image as ImageIcon,
  Share2,
} from "lucide-react";
import { SiteSettings } from "@/lib/types";
import { useToast } from "@/context/ToastContext";
import ImageUploader from "@/components/admin/ImageUploader";

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
        showToast("Site settings & SEO meta updated successfully!");
      } else {
        throw new Error("Failed to update");
      }
    } catch (e) {
      showToast("Error updating settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="py-20 text-center text-slate-400">Loading store settings...</div>;
  }

  const hero = settings.heroBanners?.[0] || {
    id: "hero-1",
    title: "Luxury Bedsheets & Designer Window Curtains",
    subtitle: "Export-grade 100% Egyptian cotton bedsheet sets, 100% blackout window drapes, and cloud comforters delivered with Cash on Delivery nationwide across Bangladesh.",
    buttonText: "Explore Collections",
    buttonLink: "/products",
    image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=1200&auto=format&fit=crop",
    badge: "Seasonal Home Living Edition",
  };

  const updateHero = (field: string, value: string) => {
    const updatedHero = { ...hero, [field]: value };
    setSettings({
      ...settings,
      heroBanners: [updatedHero],
    });
  };

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

        {/* Homepage Hero Banner Editor */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-bold text-sm">
            <ImageIcon className="w-4 h-4 text-brand-400" />
            <span>Homepage Hero Banner & Promotions</span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Hero Promotion Badge</label>
                <input
                  type="text"
                  placeholder="Seasonal Home Living Edition"
                  value={hero.badge || ""}
                  onChange={(e) => updateHero("badge", e.target.value)}
                  className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">CTA Button Text & Link</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Explore Collections"
                    value={hero.buttonText || ""}
                    onChange={(e) => updateHero("buttonText", e.target.value)}
                    className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 font-medium"
                  />
                  <input
                    type="text"
                    placeholder="/products"
                    value={hero.buttonLink || ""}
                    onChange={(e) => updateHero("buttonLink", e.target.value)}
                    className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 font-medium font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Hero Main Heading Title</label>
              <input
                type="text"
                value={hero.title || ""}
                onChange={(e) => updateHero("title", e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Hero Subtitle / Description</label>
              <textarea
                rows={3}
                value={hero.subtitle || ""}
                onChange={(e) => updateHero("subtitle", e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 font-medium resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-2">Hero Cover Image (Upload or URL)</label>
              <ImageUploader
                images={hero.image ? [hero.image] : []}
                onChange={(imgs) => updateHero("image", imgs[0] || "/logo.jpg")}
                maxImages={1}
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
