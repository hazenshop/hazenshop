"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Check,
  Copy,
  Loader2,
  Sparkles,
  Layers,
  ArrowUpRight,
  Eye,
  Star,
  CheckCircle2,
  Database,
  X,
} from "lucide-react";
import { optimizeAndConvertToWebP, formatBytes, CompressionResult } from "@/lib/imageOptimizer";
import { MediaItem } from "@/lib/types";
import { useToast } from "@/context/ToastContext";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  productId?: string;
  productName?: string;
  categorySlug?: string;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onChange,
  productId,
  productName,
  categorySlug,
  maxImages = 10,
}: ImageUploaderProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    originalSize: string;
    compressedSize: string;
    percentSaved: number;
  } | null>(null);

  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [manualUrl, setManualUrl] = useState("");

  const fetchMediaLibrary = async () => {
    setLoadingMedia(true);
    try {
      const res = await fetch("/api/storage");
      const data = await res.json();
      if (data.mediaItems) {
        setMediaList(data.mediaItems);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    setStats(null);

    const uploadedUrls: string[] = [];
    let totalOrig = 0;
    let totalComp = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCompressionProgress(`Compressing & converting ${file.name} to WebP (${i + 1}/${files.length})...`);

        // 1. Client-Side WebP Compression
        const result: CompressionResult = await optimizeAndConvertToWebP(file, {
          maxDimension: 1600,
          quality: 0.82,
        });

        totalOrig += result.originalSizeBytes;
        totalComp += result.compressedSizeBytes;

        setCompressionProgress(`Uploading optimized WebP (${formatBytes(result.compressedSizeBytes)})...`);

        // 2. Upload to Storage API
        const formData = new FormData();
        formData.append("file", result.file);
        formData.append("originalSizeBytes", result.originalSizeBytes.toString());
        formData.append("width", result.width.toString());
        formData.append("height", result.height.toString());
        if (productId) formData.append("productId", productId);
        if (productName) formData.append("productName", productName);
        if (categorySlug) formData.append("categorySlug", categorySlug);

        const res = await fetch("/api/storage/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.url) {
          uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        const percentSaved =
          totalOrig > 0 ? Math.round(((totalOrig - totalComp) / totalOrig) * 100) : 0;

        setStats({
          originalSize: formatBytes(totalOrig),
          compressedSize: formatBytes(totalComp),
          percentSaved,
        });

        onChange([...images, ...uploadedUrls]);
        showToast(
          `Converted to WebP & Saved ${percentSaved}% storage (${formatBytes(totalOrig - totalComp)} reduced)!`,
          "success"
        );
      }
    } catch (err) {
      console.error(err);
      showToast("Error compressing/uploading image", "error");
    } finally {
      setIsCompressing(false);
      setCompressionProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async (index: number) => {
    const urlToRemove = images[index];
    const newImages = images.filter((_, idx) => idx !== index);
    onChange(newImages);

    // If it's a local upload, delete it from storage
    if (urlToRemove && urlToRemove.startsWith("/uploads/")) {
      try {
        await fetch(`/api/storage?url=${encodeURIComponent(urlToRemove)}`, {
          method: "DELETE",
        });
        showToast("Image removed and storage freed.", "info");
      } catch (err) {
        console.error("Storage delete error", err);
      }
    }
  };

  const handleSetMainCover = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    onChange([target, ...rest]);
    showToast("Main cover image updated!");
  };

  const handleAddManualUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    onChange([...images, manualUrl.trim()]);
    setManualUrl("");
    showToast("Image URL added!");
  };

  const handleSelectFromLibrary = (item: MediaItem) => {
    if (images.includes(item.url)) {
      showToast("Image is already in the list", "info");
      return;
    }
    onChange([...images, item.url]);
    setShowMediaLibrary(false);
    showToast("Selected image from Media Library!");
  };

  return (
    <div className="space-y-4">
      {/* Upload Box & Dropzone */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`md:col-span-8 border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
            isCompressing
              ? "border-brand-500 bg-brand-500/10"
              : "border-slate-700 hover:border-brand-500/60 bg-slate-900/50 hover:bg-slate-900"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/avif,image/heic"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400">
            {isCompressing ? (
              <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">
              {isCompressing ? "Compressing & Converting to WebP..." : "Click or Drop Photos to Upload"}
            </h4>
            <p className="text-xs text-slate-400">
              Auto-converts to high-efficiency <span className="text-brand-400 font-bold">.WebP</span> (reduces 5MB images to ~150KB)
            </p>
            {compressionProgress && (
              <p className="text-xs font-mono text-brand-300 animate-pulse pt-1">
                {compressionProgress}
              </p>
            )}
          </div>
        </div>

        {/* Media Library & URL Options */}
        <div className="md:col-span-4 flex flex-col justify-between gap-2.5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
              Alternative Sources
            </span>
            <button
              type="button"
              onClick={() => {
                setShowMediaLibrary(true);
                fetchMediaLibrary();
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-3.5 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 text-xs"
            >
              <Database className="w-4 h-4 text-brand-400" />
              <span>Media Storage Library</span>
            </button>
          </div>

          <form onSubmit={handleAddManualUrl} className="space-y-1.5 pt-1">
            <input
              type="url"
              placeholder="Paste image URL (https://...)"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="w-full bg-slate-950 text-xs rounded-xl px-3 py-2 border border-slate-800 text-white focus:outline-none focus:border-brand-500 placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!manualUrl.trim()}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold py-1.5 px-3 rounded-xl text-xs transition-colors"
            >
              + Add URL
            </button>
          </form>
        </div>
      </div>

      {/* Compression Stats Notification */}
      {stats && (
        <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-xs flex items-center justify-between text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              WebP Compression: <strong className="text-white">{stats.originalSize}</strong> reduced to{" "}
              <strong className="text-emerald-400">{stats.compressedSize}</strong>
            </span>
          </div>
          <span className="font-extrabold text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded-full">
            -{stats.percentSaved}% Saved
          </span>
        </div>
      )}

      {/* Image Gallery Thumbnails */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Product Gallery ({images.length} photos)</span>
            <span className="text-[11px] text-slate-500">First photo is the main storefront cover</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((url, idx) => (
              <div
                key={idx}
                className={`group relative aspect-square rounded-2xl overflow-hidden border transition-all bg-slate-900 ${
                  idx === 0
                    ? "border-brand-500 ring-2 ring-brand-500/40"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <Image src={url} alt={`Gallery ${idx}`} fill className="object-cover" />

                {/* Main Cover Badge */}
                {idx === 0 && (
                  <span className="absolute top-2 left-2 bg-brand-500 text-brand-dark text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md z-10 flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-brand-dark" />
                    Cover
                  </span>
                )}

                {/* WebP Format Badge */}
                {url.endsWith(".webp") && (
                  <span className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md text-emerald-400 font-mono text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border border-emerald-500/30 z-10">
                    WEBP
                  </span>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-20">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-600 transition-colors"
                      title="Delete Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetMainCover(idx)}
                      className="w-full py-1.5 px-2 rounded-lg bg-white/90 hover:bg-white text-slate-900 text-[10px] font-bold transition-all text-center shadow-md"
                    >
                      Set as Cover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-4xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-brand-400" />
                <h3 className="font-bold text-base">Media Storage Library (WebP Files)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaLibrary(false)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              {loadingMedia ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-400" />
                  <p className="text-xs">Loading storage files...</p>
                </div>
              ) : mediaList.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <ImageIcon className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-sm font-semibold text-slate-400">No media uploaded yet</p>
                  <p className="text-xs text-slate-500">Upload your first photo to populate the library.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mediaList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectFromLibrary(item)}
                      className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-800 hover:border-brand-500 cursor-pointer bg-slate-950 transition-all p-1"
                    >
                      <Image src={item.url} alt={item.name} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                        <p className="text-[11px] font-bold text-white truncate">{item.name}</p>
                        <p className="text-[10px] font-mono text-emerald-400">
                          {formatBytes(item.sizeBytes)} • WebP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMediaLibrary(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl"
              >
                Close Library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
