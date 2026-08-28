"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Image as ImageIcon,
  Sparkles,
  Package,
  Layers,
  Globe,
  Loader2,
  DollarSign,
  CheckCircle2,
  Eye,
  Shirt,
  Leaf,
  BedDouble,
} from "lucide-react";
import { Category, Product, ProductVariant } from "@/lib/types";
import { useToast } from "@/context/ToastContext";
import { formatPrice } from "@/lib/utils";
import ImageUploader from "@/components/admin/ImageUploader";


export default function ProductForm({
  categories,
  initialProduct,
}: {
  categories: Category[];
  initialProduct?: Product;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEditing = Boolean(initialProduct);

  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState(initialProduct?.name || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [category, setCategory] = useState(
    initialProduct?.category || (categories[0]?.slug || "mens-panjabi-fashion")
  );
  const [price, setPrice] = useState(initialProduct?.price ? initialProduct.price.toString() : "");
  const [salePrice, setSalePrice] = useState(
    initialProduct?.salePrice ? initialProduct.salePrice.toString() : ""
  );
  const [stock, setStock] = useState(
    initialProduct?.stock !== undefined ? initialProduct.stock.toString() : "20"
  );
  const [badge, setBadge] = useState<Product["badge"]>(initialProduct?.badge || "Best Seller");
  const [featured, setFeatured] = useState(initialProduct?.featured ?? true);
  const [flashSale, setFlashSale] = useState(initialProduct?.flashSale ?? false);
  const [variantType, setVariantType] = useState<Product["variantType"]>(
    initialProduct?.variantType || "size"
  );

  // Images list
  const [images, setImages] = useState<string[]>(
    initialProduct?.images && initialProduct.images.length > 0
      ? initialProduct.images
      : [
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
        ]
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  // Descriptions
  const [shortDescription, setShortDescription] = useState(
    initialProduct?.shortDescription || ""
  );
  const [description, setDescription] = useState(initialProduct?.description || "");

  // Variants list
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialProduct?.variants && initialProduct.variants.length > 0
      ? initialProduct.variants
      : [
          {
            id: "v-1",
            name: "Size 40 (M)",
            price: Number(price) || 2450,
            salePrice: Number(salePrice) || 1750,
            stock: 10,
            color: "Signature",
            colorCode: "#7A1C2C",
            material: "100% Combed Cotton",
          },
        ]
  );

  // Quick Preset Generators for Bedsheets & Window Curtains (Porda)
  const applyBedsheetPreset = () => {
    const baseP = Number(price) || 2650;
    const saleP = Number(salePrice) || 1890;
    setVariantType("dimension");
    setVariants([
      { id: `v-king-${Date.now()}`, name: "King Size (7.5ft x 8.5ft / 90x102 in) + 2 Pillow Covers", price: baseP, salePrice: saleP, stock: 16, color: "Signature Gold", colorCode: "#b8873f", material: "100% Egyptian Cotton (350 TC)" },
      { id: `v-queen-${Date.now()}`, name: "Queen Size (7ft x 8ft / 84x96 in) + 2 Pillow Covers", price: baseP - 200, salePrice: saleP - 140, stock: 10, color: "Signature Gold", colorCode: "#b8873f", material: "100% Egyptian Cotton (350 TC)" },
      { id: `v-single-${Date.now()}`, name: "Single Size (5ft x 7.5ft / 60x90 in) + 1 Pillow Cover", price: baseP - 800, salePrice: saleP - 540, stock: 6, color: "Signature Gold", colorCode: "#b8873f", material: "100% Egyptian Cotton (350 TC)" },
    ]);
    showToast("Applied Bedsheet Preset (King, Queen, Single)!");
  };

  const applyCurtainPreset = () => {
    const baseP = Number(price) || 2450;
    const saleP = Number(salePrice) || 1750;
    setVariantType("dimension");
    setVariants([
      { id: `v-win-${Date.now()}`, name: "Standard Window Size (4ft x 5ft / 48x60 in) - 1 Panel", price: baseP - 600, salePrice: saleP - 400, stock: 12, color: "Royal Emerald", colorCode: "#047857", material: "Triple-Weave Heavy Blackout" },
      { id: `v-door-${Date.now()}`, name: "Standard Door / Long Window (4ft x 7ft / 48x84 in) - 1 Panel", price: baseP, salePrice: saleP, stock: 15, color: "Royal Emerald", colorCode: "#047857", material: "Triple-Weave Heavy Blackout" },
      { id: `v-balcony-${Date.now()}`, name: "Balcony / Ceiling Drop (4ft x 9ft / 48x108 in) - 1 Panel", price: baseP + 500, salePrice: saleP + 400, stock: 8, color: "Royal Emerald", colorCode: "#047857", material: "Triple-Weave Heavy Blackout" },
    ]);
    showToast("Applied Window Curtain / Porda Preset (5ft, 7ft, 9ft)!");
  };

  const applyComforterPreset = () => {
    const baseP = Number(price) || 3850;
    const saleP = Number(salePrice) || 2750;
    setVariantType("dimension");
    setVariants([
      { id: `v-cf-king-${Date.now()}`, name: "Double King Size (7.5ft x 8.5ft / 90x102 in)", price: baseP, salePrice: saleP, stock: 14, color: "Charcoal & Sand", colorCode: "#27272a", material: "350 GSM Cloud Microfiber" },
      { id: `v-cf-single-${Date.now()}`, name: "Single AC Quilt (5ft x 7.5ft / 60x90 in)", price: baseP - 900, salePrice: saleP - 600, stock: 8, color: "Charcoal & Sand", colorCode: "#27272a", material: "350 GSM Cloud Microfiber" },
    ]);
    showToast("Applied Comforter & AC Quilt Dimensions Preset!");
  };

  const applyFittedSheetPreset = () => {
    const baseP = Number(price) || 2550;
    const saleP = Number(salePrice) || 1790;
    setVariantType("dimension");
    setVariants([
      { id: `v-ft-king-${Date.now()}`, name: "King Fitted (6ft x 7ft x 12in) + 2 Pillow Covers", price: baseP, salePrice: saleP, stock: 15, color: "Ivory Pearl", colorCode: "#FDFBF7", material: "100% Combed Cotton Fitted" },
      { id: `v-ft-queen-${Date.now()}`, name: "Queen Fitted (5ft x 7ft x 12in) + 2 Pillow Covers", price: baseP - 200, salePrice: saleP - 140, stock: 10, color: "Ivory Pearl", colorCode: "#FDFBF7", material: "100% Combed Cotton Fitted" },
    ]);
    showToast("Applied 360° Fitted Elastic Sheet Preset!");
  };


  // SEO
  const [seoTitle, setSeoTitle] = useState(initialProduct?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialProduct?.seoDescription || "");

  // Handlers for images
  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
    showToast("Image added to gallery!");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSetMainImage = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    setImages([target, ...rest]);
    showToast("Main cover image updated!");
  };

  // Handlers for variants
  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: `v-${Date.now()}`,
      name: variantType === "weight" ? "500g Pack" : "Standard",
      price: Number(price) || 1500,
      salePrice: Number(salePrice) || 1200,
      stock: 10,
      color: "Standard",
      colorCode: "#F59E0B",
      material: "Export Quality",
    };
    setVariants((prev) => [...prev, newVariant]);
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("Product name is required", "error");
      return;
    }
    if (!price || Number(price) <= 0) {
      showToast("Please enter a valid product price", "error");
      return;
    }

    setSaving(true);
    const catObj = categories.find((c) => c.slug === category);
    const autoSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const payload = {
      name: name.trim(),
      slug: autoSlug,
      category,
      categoryName: catObj?.name || category,
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : undefined,
      stock: Number(stock) || 0,
      badge,
      featured,
      flashSale,
      variantType,
      images: images.length > 0 ? images : ["/logo.jpg"],
      shortDescription: shortDescription.trim() || name,
      description: description.trim() || name,
      variants,
      seoTitle: seoTitle.trim() || name,
      seoDescription: seoDescription.trim() || shortDescription,
      rating: initialProduct?.rating || 5.0,
      reviewCount: initialProduct?.reviewCount || 42,
    };

    try {
      let res;
      if (isEditing && initialProduct) {
        res = await fetch(`/api/products/${initialProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Failed to save");

      showToast(`Product "${name}" saved successfully!`, "success");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error(err);
      showToast("Error saving product. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-24">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isEditing ? "Edit Product" : "Create New Product"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {name || "Untitled Product"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/admin/products"
            className="flex-1 sm:flex-none text-center px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Discard
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="flex-1 sm:flex-none bg-brand-500 hover:bg-brand-600 active:scale-95 text-brand-dark font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isEditing ? "Update Product" : "Publish Product"}</span>
          </button>
        </div>
      </div>

      {/* Main Form Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Basic Information */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-bold text-sm">
              <Package className="w-4 h-4 text-brand-400" />
              <span>General Information & Department</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Product Title (পণ্যের নাম) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Maroon Semi-Fit Cotton Panjabi or 100% Pure Sundarban Honey"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!isEditing && !slug) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }
                  }}
                  className="w-full bg-slate-950 text-white font-bold text-sm rounded-xl p-3.5 border border-slate-800 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Category Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 text-white font-bold text-xs rounded-xl p-3 border border-slate-800 focus:outline-none focus:border-brand-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Custom URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="product-unique-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-slate-950 text-slate-300 font-mono text-xs rounded-xl p-3 border border-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Short Highlights (সংক্ষিপ্ত বিবরণ)
                </label>
                <input
                  type="text"
                  placeholder="Key selling points, material quality, or organic freshness"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Full Description & Package Details
                </label>
                <textarea
                  rows={5}
                  placeholder={`Detailed product descriptions, sizing, purity certifications, and specifications...`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-800 focus:outline-none focus:border-brand-500 resize-none font-sans leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Media Gallery & WebP Compressor */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <ImageIcon className="w-4 h-4 text-brand-400" />
                <span>Product Image Gallery & WebP Compressor</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                Auto WebP Compression Active
              </span>
            </div>

            <ImageUploader
              images={images}
              onChange={setImages}
              productId={initialProduct?.id}
              productName={name}
              categorySlug={category}
            />
          </div>


          {/* Card 3: Variants & Quick Presets */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Layers className="w-4 h-4 text-brand-400" />
                <span>Variants, Sizes & Weights ({variants.length})</span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={applyBedsheetPreset}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-400 text-[11px] font-bold border border-slate-700 flex items-center gap-1"
                >
                  <BedDouble className="w-3 h-3" />
                  <span>+ Bedsheet Sizes</span>
                </button>
                <button
                  type="button"
                  onClick={applyCurtainPreset}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-bold border border-slate-700 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>+ Window Curtains (Porda)</span>
                </button>
                <button
                  type="button"
                  onClick={applyComforterPreset}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 text-[11px] font-bold border border-slate-700 flex items-center gap-1"
                >
                  <Package className="w-3 h-3" />
                  <span>+ Comforter / Quilt</span>
                </button>
                <button
                  type="button"
                  onClick={applyFittedSheetPreset}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 text-[11px] font-bold border border-slate-700 flex items-center gap-1"
                >
                  <Layers className="w-3 h-3" />
                  <span>+ Fitted Elastic</span>
                </button>
              </div>
            </div>

            {/* Variant Type Selector */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-4 text-xs">
              <span className="text-slate-300 font-bold">Variant Dimension Type:</span>
              <select
                value={variantType}
                onChange={(e) => setVariantType(e.target.value as any)}
                className="bg-slate-900 text-brand-400 font-bold px-3 py-1.5 rounded-lg border border-slate-800"
              >
                <option value="dimension">Bedding & Curtain Dimensions (King, Window 5ft, Door 7ft)</option>
                <option value="size">Size Options (Standard, Long)</option>
                <option value="weight">Fill Weight (350 GSM, 450 GSM)</option>
                <option value="custom">General / Custom Option</option>
              </select>
            </div>


            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={v.id || idx}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Option / Size Name</label>
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => handleUpdateVariant(idx, "name", e.target.value)}
                        placeholder="e.g. Size 40 (M) or 1kg Glass Jar"
                        className="w-full bg-slate-900 text-white rounded-lg p-2 border border-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Regular Price (৳)</label>
                      <input
                        type="number"
                        value={v.price}
                        onChange={(e) => handleUpdateVariant(idx, "price", Number(e.target.value))}
                        className="w-full bg-slate-900 text-white rounded-lg p-2 border border-slate-800 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Sale Price (৳)</label>
                      <input
                        type="number"
                        value={v.salePrice || ""}
                        onChange={(e) =>
                          handleUpdateVariant(
                            idx,
                            "salePrice",
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        className="w-full bg-slate-900 text-brand-400 rounded-lg p-2 border border-slate-800 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Color / Flavor & Hex</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={v.colorCode || "#7A1C2C"}
                          onChange={(e) => handleUpdateVariant(idx, "colorCode", e.target.value)}
                          className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={v.color || ""}
                          onChange={(e) => handleUpdateVariant(idx, "color", e.target.value)}
                          placeholder="Royal Maroon"
                          className="w-full bg-slate-900 text-white rounded-lg p-2 border border-slate-800 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Material / Quality</label>
                      <input
                        type="text"
                        value={v.material || ""}
                        onChange={(e) => handleUpdateVariant(idx, "material", e.target.value)}
                        placeholder="100% Combed Cotton"
                        className="w-full bg-slate-900 text-white rounded-lg p-2 border border-slate-800 text-xs"
                      />
                    </div>

                    <div className="flex items-end justify-between gap-2">
                      <div className="flex-1">
                        <label className="block text-slate-400 font-bold mb-1">Stock Units</label>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => handleUpdateVariant(idx, "stock", Number(e.target.value))}
                          className="w-full bg-slate-900 text-white rounded-lg p-2 border border-slate-800 text-xs"
                        />
                      </div>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg shrink-0 mb-0.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddVariant}
              className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 pt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Single Variant</span>
            </button>
          </div>
        </div>

        {/* Right 4 Cols: Pricing, Badges, SEO */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 4: Pricing & Stock */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-bold text-sm">
              <DollarSign className="w-4 h-4 text-brand-400" />
              <span>Base Pricing & Stock</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Regular Price (৳) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="2450"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-950 text-white font-black text-base rounded-xl p-3 border border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Discount Sale Price (৳)
                </label>
                <input
                  type="number"
                  placeholder="1750"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full bg-slate-950 text-brand-400 font-black text-base rounded-xl p-3 border border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Total Stock Available
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full bg-slate-950 text-white font-bold text-sm rounded-xl p-3 border border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Card 5: Badges & Promotions */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-bold text-sm">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Promotion & Badges</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Promotional Badge</label>
                <select
                  value={badge}
                  onChange={(e) => setBadge(e.target.value as any)}
                  className="w-full bg-slate-950 text-white font-bold text-xs rounded-xl p-3 border border-slate-800"
                >
                  <option value="Best Seller">Best Seller</option>
                  <option value="Hot Deal">Hot Deal</option>
                  <option value="Trending">Trending</option>
                  <option value="New Arrival">New Arrival</option>
                  <option value="Limited Stock">Limited Stock</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-500"
                  />
                  <span className="text-slate-300 font-bold">Featured on Home Page</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={flashSale}
                    onChange={(e) => setFlashSale(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-500"
                  />
                  <span className="text-slate-300 font-bold">Show in Flash Sale Banner</span>
                </label>
              </div>
            </div>
          </div>

          {/* Card 6: SEO & OpenGraph */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-bold text-sm">
              <Globe className="w-4 h-4 text-brand-400" />
              <span>Search Engine & SEO Meta</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Custom SEO Title</label>
                <input
                  type="text"
                  placeholder="Buy Product in Bangladesh"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full bg-slate-950 text-white rounded-xl p-2.5 border border-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Meta Description</label>
                <textarea
                  rows={3}
                  placeholder="Shop online with 100% Cash on Delivery across Bangladesh..."
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="w-full bg-slate-950 text-white rounded-xl p-2.5 border border-slate-800 resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
