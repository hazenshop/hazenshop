"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, Image as ImageIcon, CheckCircle2, Loader2, ExternalLink, Grid, AlertTriangle } from "lucide-react";
import { Category } from "@/lib/types";
import { useToast } from "@/context/ToastContext";
import ImageUploader from "@/components/admin/ImageUploader";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [featured, setFeatured] = useState(true);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    async function loadCategory() {
      try {
        const res = await fetch(`/api/categories/${categoryId}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.category) {
            const c: Category = data.category;
            setName(c.name);
            setSlug(c.slug);
            setDescription(c.description || "");
            setImage(c.image || "");
            setCoverImage(c.coverImage || c.image || "");
            setFeatured(c.featured ?? true);
            setProductCount(c.productCount || 0);
          }
        } else {
          showToast("Category not found", "error");
          router.push("/admin/categories");
        }
      } catch (err) {
        showToast("Error loading category", "error");
      } finally {
        setIsLoading(false);
      }
    }
    if (categoryId) loadCategory();
  }, [categoryId, router, showToast]);

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (!name.trim()) {
      showToast("Please enter a category name (ক্যাটাগরির নাম দিন)", "error");
      return;
    }

    setIsSubmitting(true);
    const finalSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: finalSlug,
          description: description.trim(),
          image: image.trim() || "/logo.jpg",
          coverImage: coverImage.trim() || image.trim() || "/logo.jpg",
          featured,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setShowSuccessModal(true);
        showToast("ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে! (Category updated)", "success");
      } else {
        showToast(data?.error || "ক্যাটাগরি আপডেট করা যায়নি", "error");
      }
    } catch (err) {
      showToast("Network error. Could not update category.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast(`ক্যাটাগরি "${name}" মুছে ফেলা হয়েছে`, "info");
        setShowDeleteModal(false);
        router.push("/admin/categories");
      } else {
        showToast("ক্যাটাগরি মোছা যায়নি", "error");
      }
    } catch (err) {
      showToast("Network error while deleting category", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

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
            <h1 className="text-xl sm:text-2xl font-black text-white">Edit Category</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Modify department details, cover banner, and homepage display status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/80 font-bold text-xs px-4 py-3 rounded-xl transition-all flex items-center gap-2 min-h-[44px]"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? "Deleting..." : "Delete"}</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-brand-500 hover:bg-brand-600 active:scale-95 text-brand-dark font-black text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Form Grid */}
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
              onChange={(e) => setName(e.target.value)}
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
              placeholder="Detailed description of products in this department..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 rounded-xl p-3.5 border border-slate-800 focus:border-brand-500 focus:outline-none text-xs leading-relaxed"
            />
          </div>

          {/* 16:9 Category Cover Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                16:9 Category Cover Banner (১৬:৯ কভার ব্যানার)
              </label>
              <span className="text-[10px] text-brand-400 font-mono bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                16:9 Widescreen
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              ক্যাটাগরি পেজের শীর্ষে ১৬:৯ অনুপাতে কভার ব্যানার হিসেবে প্রদর্শিত হবে।
            </p>
            <ImageUploader
              images={coverImage ? [coverImage] : []}
              onChange={(imgs) => setCoverImage(imgs[0] || image || "/logo.jpg")}
              categorySlug={slug}
              maxImages={1}
            />
          </div>

          {/* Category Icon / Thumbnail */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Category Icon / Thumbnail (ছোট আইকন/থাম্বনেইল)
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              ফিল্টার ও নেভিগেশন লিস্টের জন্য ছোট ইমেজ
            </p>
            <ImageUploader
              images={image ? [image] : []}
              onChange={(imgs) => setImage(imgs[0] || "/logo.jpg")}
              categorySlug={slug}
              maxImages={1}
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

        {/* Right Column: Live Card Preview & Metrics */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Live Previews
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Storefront View
              </span>
            </div>

            {/* 16:9 Cover Banner Preview */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400">16:9 Category Page Banner Preview:</span>
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col justify-end p-4 text-white shadow-md">
                <Image
                  src={coverImage || image || "/logo.jpg"}
                  alt={name || "Cover Preview"}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-1">
                  <span className="inline-block bg-brand-maroon-700/90 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded">
                    Category Banner
                  </span>
                  <h4 className="font-heading font-black text-sm text-white line-clamp-1">
                    {name || "Category Name"}
                  </h4>
                  <p className="text-[10px] text-slate-300 line-clamp-1">
                    {description || "Category description will appear here..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Thumbnail Preview */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400">Grid Card Icon Preview:</span>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-center flex flex-col items-center">
                <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2 bg-slate-900 border border-slate-800">
                  <Image
                    src={image || "/logo.jpg"}
                    alt={name || "Category Preview"}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-heading font-bold text-xs text-white leading-tight">
                  {name || "Category Name"}
                </h3>
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Associated Products:</span>
                <span className="font-bold text-white">{productCount} items</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Category ID:</span>
                <span className="font-mono text-[10px] text-slate-500">{categoryId}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1 pt-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Changes update across storefront instantly</span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center relative overflow-hidden">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-white">Category Updated!</h2>
              <p className="text-xs text-slate-400">
                <strong className="text-emerald-400 font-bold">{name}</strong> has been successfully updated in database and store navigation.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-xl bg-slate-900 relative overflow-hidden shrink-0 border border-slate-800">
                <Image src={image || "/logo.jpg"} alt={name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{name}</p>
                <p className="text-[10px] text-slate-500 font-mono truncate">/category/{slug}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <a
                href={`/category/${slug}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-700 min-h-[44px]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Live</span>
              </a>
              <Link
                href="/admin/categories"
                className="w-full bg-brand-500 hover:bg-brand-600 text-brand-dark font-black text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md min-h-[44px]"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>All Categories</span>
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Continue Editing
            </button>
          </div>
        </div>
      )}

      {/* Danger Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center relative">
            <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/40 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-white">Delete Category?</h2>
              <p className="text-xs text-slate-400">
                Are you sure you want to permanently delete <strong className="text-rose-400 font-bold">{name}</strong>?
                {productCount > 0 && (
                  <span className="block mt-1 text-amber-400">
                    Warning: There are {productCount} products assigned to this category.
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 px-4 rounded-xl transition-colors border border-slate-700 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-3 px-4 rounded-xl transition-colors shadow-lg shadow-rose-900/30 flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Category</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
