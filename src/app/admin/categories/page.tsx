"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FolderTree, Plus, Trash2, Edit2, X, Layers } from "lucide-react";
import { Category } from "@/lib/types";
import { useToast } from "@/context/ToastContext";

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("");
  const [featured, setFeatured] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDesc("");
    setImage("https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=800&auto=format&fit=crop");
    setFeatured(true);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const generatedSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const payload = {
      name: name.trim(),
      slug: generatedSlug,
      description: desc.trim(),
      image: image.trim() || "/logo.jpg",
      featured,
    };

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast("Category saved successfully!");
        fetchCategories();
        setIsModalOpen(false);
      }
    } catch (e) {
      showToast("Failed to save category", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Categories Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize bedsheet types, comforters, and home textile collections
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-brand-500 hover:bg-brand-600 text-brand-dark font-black text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                <Image src={cat.image || "/logo.jpg"} alt={cat.name} fill className="object-cover" />
                {cat.featured && (
                  <span className="absolute top-2 left-2 bg-brand-500 text-brand-dark font-black text-[10px] uppercase px-2 py-0.5 rounded shadow">
                    Featured
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{cat.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">/category/{cat.slug}</p>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{cat.description}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">{cat.productCount || 0} products</span>
              <span className="text-emerald-400 font-bold">Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Create New Category</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Luxury Bedsheets"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 text-white rounded-xl p-3 border border-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">URL Slug</label>
                <input
                  type="text"
                  placeholder="luxury-bedsheets"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-slate-950 text-white rounded-xl p-2.5 border border-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-slate-950 text-white rounded-xl p-2.5 border border-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of products in this department..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-950 text-white rounded-xl p-2.5 border border-slate-800 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featuredCat"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-500"
                />
                <label htmlFor="featuredCat" className="text-slate-300 font-bold">Featured on Home Grid</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-500 hover:bg-brand-600 text-brand-dark font-black py-2.5 rounded-xl shadow-md"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
