"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, Image as ImageIcon, CheckCircle2, Loader2 } from "lucide-react";
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

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [featured, setFeatured] = useState(true);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    async function loadCategory() {
      try {
        const res = await fetch(`/api/categories/${categoryId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.category) {
            const c: Category = data.category;
            setName(c.name);
            setSlug(c.slug);
            setDescription(c.description || "");
            setImage(c.image || "");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Please enter a category name", "error");
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
          featured,
        }),
      });

      if (res.ok) {
        showToast("Category updated successfully!");
        router.push("/admin/categories");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to update category", "error");
      }
    } catch (err) {
      showToast("Network error. Could not update category.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Category deleted successfully");
        router.push("/admin/categories");
      } else {
        showToast("Failed to delete category", "error");
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

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Category Cover Image & WebP Compressor (কভার ছবি)
            </label>
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
                {name || "Category Name"}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {description || "Category description..."}
              </p>
              {featured && (
                <span className="mt-3 bg-brand-500/20 text-brand-300 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-brand-500/30">
                  Featured on Home
                </span>
              )}
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
    </div>
  );
}
