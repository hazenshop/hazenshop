"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function NewCategoryPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(
    "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=800&auto=format&fit=crop"
  );
  const [featured, setFeatured] = useState(true);

  // Quick Preset Categories for Bedsheets & Window Curtains
  const presets = [
    {
      name: "Luxury Bedsheets (বিছানার চাদর)",
      slug: "luxury-bedsheets",
      description: "100% Egyptian Cotton & Organic Combed Cotton 300+ TC bedsheet sets with matching pillow & bolster covers.",
      image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=800&auto=format&fit=crop",
    },
    {
      name: "Window Curtains & Porda (জানালার পর্দা)",
      slug: "window-curtains",
      description: "Premium Jacquard, textured drapery, and velvet window drapes with rust-free brass eyelet rings.",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop",
    },
    {
      name: "100% Blackout Curtains (ব্ল্যাকআউট পর্দা)",
      slug: "blackout-curtains",
      description: "Triple-weave thermal insulated room-darkening curtains for deep peaceful sleep and room cooling.",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop",
    },
    {
      name: "Comforters & AC Quilts (কমফোর্টার ও এসি কুইল্ট)",
      slug: "comforters-quilts",
      description: "All-season 350 GSM cloud microfiber quilts and reversible luxury duvet bedding sets.",
      image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800&auto=format&fit=crop",
    },
    {
      name: "Fitted Elastic Bedsheets (ফিটেড চাদর)",
      slug: "fitted-bedsheets",
      description: "360-degree all-around deep pocket elastic grip bedsheets that stay wrinkle-free on any mattress.",
      image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=800&auto=format&fit=crop",
    },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setName(preset.name);
    setSlug(preset.slug);
    setDescription(preset.description);
    setImage(preset.image);
    showToast(`Applied preset: ${preset.name}`);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, "-")) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Please enter a category name", "error");
      return;
    }

    setIsSubmitting(true);
    const finalSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: finalSlug,
          description: description.trim(),
          image: image.trim() || "/logo.jpg",
          featured,
        }),
      });

      if (res.ok) {
        showToast("Category created successfully!");
        router.push("/admin/categories");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to create category", "error");
      }
    } catch (err) {
      showToast("Network error. Could not create category.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/categories"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Create New Category</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Add a department for Bedsheets, Curtains, Comforters, or Living textiles
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 active:scale-95 text-brand-dark font-black text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 min-h-[44px]"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? "Saving Category..." : "Save Category"}</span>
        </button>
      </div>

      {/* Preset Quick Fill Pills */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Quick Department Presets (এক ক্লিকে পূরণ করুন):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              className="bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl border border-slate-800 transition-all active:scale-95 min-h-[40px]"
            >
              + {preset.name.split("(")[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Form Grid: 2 columns */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Details */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-lg">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Category Name (বিভাগের নাম) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Luxury Bedsheets (বিছানার চাদর)"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-slate-950 text-white rounded-xl p-3.5 border border-slate-800 focus:border-brand-500 focus:outline-none font-bold text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              URL Slug (URL পাথমাপ) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="luxury-bedsheets"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-slate-950 text-brand-300 rounded-xl p-3 border border-slate-800 focus:border-brand-500 focus:outline-none font-mono text-xs"
            />
            <span className="text-[11px] text-slate-500 mt-1 block font-mono">
              Live link: /category/{slug || "category-slug"}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Description (বিবরণ)
            </label>
            <textarea
              rows={4}
              placeholder="Detailed description of products in this department for SEO & customer guidance..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 rounded-xl p-3.5 border border-slate-800 focus:border-brand-500 focus:outline-none text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Cover Image URL (কভার ছবি)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 focus:border-brand-500 focus:outline-none text-xs font-mono"
            />
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-5 h-5 rounded bg-slate-950 text-brand-500 border-slate-800 focus:ring-0"
              />
              <div>
                <span className="text-xs font-bold text-white block">Feature on Homepage Grid</span>
                <span className="text-[11px] text-slate-400">Display this category in the signature collection carousel</span>
              </div>
            </label>
          </div>
        </div>

        {/* Right Column: Live Card Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Live Card Preview
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Storefront View
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center flex flex-col items-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3.5 bg-slate-900 border border-slate-800">
                <Image
                  src={image || "/logo.jpg"}
                  alt={name || "Category Preview"}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-heading font-bold text-sm text-white leading-tight">
                {name || "Category Name (বিভাগের নাম)"}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {description || "Category description will appear here..."}
              </p>
              {featured && (
                <span className="mt-3 bg-brand-500/20 text-brand-300 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-brand-500/30">
                  Featured on Home
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-500 space-y-1 pt-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Responsive on mobile, tablet & desktop</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Auto-creates category filter URL</span>
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
