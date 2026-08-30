"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FolderTree, Plus, Trash2, Edit2, Layers, ExternalLink, Sparkles } from "lucide-react";
import { Category } from "@/lib/types";
import { useToast } from "@/context/ToastContext";

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Category deleted successfully");
        fetchCategories();
      } else {
        showToast("Failed to delete category", "error");
      }
    } catch (e) {
      showToast("Error deleting category", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Categories Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize bedsheet types, window porda, comforters, and home drapery collections
          </p>
        </div>

        <Link
          href="/admin/categories/new"
          className="bg-brand-500 hover:bg-brand-600 active:scale-95 text-brand-dark font-black text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </Link>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
          <div className="max-w-sm mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Plus className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold text-sm">No Categories Yet</h4>
            <p className="text-xs text-slate-400">
              Create categories like Bedsheets or Curtains to organize your store items.
            </p>
            <Link
              href="/admin/categories/new"
              className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-brand-dark font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Category</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 flex flex-col justify-between group hover:border-slate-700 transition-all"
            >
              <div className="space-y-3">
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                  <Image src={cat.image || "/logo.jpg"} alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  {cat.featured && (
                    <span className="absolute top-2 left-2 bg-brand-500 text-brand-dark font-black text-[10px] uppercase px-2 py-0.5 rounded shadow">
                      Featured
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{cat.name}</h3>
                  <p className="text-xs text-brand-400 font-mono mt-0.5">/category/{cat.slug}</p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{cat.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold">{cat.productCount || 0} products</span>
                  <span className="text-emerald-400 font-bold">Active</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={`/admin/categories/${cat.id}/edit`}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 min-h-[40px]"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <Link
                    href={`/category/${cat.slug}`}
                    target="_blank"
                    className="p-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                    title="View on Storefront"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-2.5 bg-rose-950/40 hover:bg-rose-900 text-rose-400 rounded-xl border border-rose-900/60 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

