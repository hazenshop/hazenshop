"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  ExternalLink,
  Eye,
  Layers,
} from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id: string, pName: string) => {
    if (!confirm(`Are you sure you want to delete "${pName}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Deleted "${pName}"`);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      showToast("Failed to delete product", "error");
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Product & Inventory Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage bedsheet catalogs, variations, pricing discounts & SEO meta tags
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-brand-500 hover:bg-brand-600 active:scale-95 text-brand-dark font-black text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Search Bar & Count */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search products by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 text-xs text-white rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-brand-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-bold hidden sm:inline">
          {filtered.length} Products Available
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">

              <tr>
                <th className="p-4">Product Image & Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Regular Price</th>
                <th className="p-4">Sale Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Variants</th>
                <th className="p-4">Badge</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Title & Image */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                        <Image src={p.images[0] || "/logo.jpg"} alt={p.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="font-bold text-white hover:text-brand-400 block truncate max-w-xs transition-colors"
                        >
                          {p.name}
                        </Link>
                        <a
                          href={`/products/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-brand-400/80 hover:text-brand-300 font-mono inline-flex items-center gap-1 mt-0.5"
                        >
                          <span>/products/{p.slug}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-4">
                    <span className="bg-slate-800 text-slate-300 font-bold px-2.5 py-1 rounded-lg">
                      {p.categoryName}
                    </span>
                  </td>

                  {/* Regular Price */}
                  <td className="p-4 font-bold text-slate-300">{formatPrice(p.price)}</td>

                  {/* Sale Price */}
                  <td className="p-4 font-black text-brand-400">
                    {p.salePrice ? formatPrice(p.salePrice) : "-"}
                  </td>

                  {/* Stock */}
                  <td className="p-4">
                    <span
                      className={`font-bold px-2.5 py-1 rounded-lg ${
                        p.stock > 5 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      {p.stock} sets
                    </span>
                  </td>

                  {/* Variants */}
                  <td className="p-4">
                    <span className="text-slate-300 font-bold">
                      {p.variants ? p.variants.length : 0} options
                    </span>
                  </td>

                  {/* Badge */}
                  <td className="p-4">
                    {p.badge && (
                      <span className="bg-brand-500/20 text-brand-400 font-bold text-[10px] uppercase px-2 py-0.5 rounded border border-brand-500/30">
                        {p.badge}
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-400 hover:text-white transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
