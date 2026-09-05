"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HardDrive,
  Upload,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
  Database,
  Image as ImageIcon,
  Sparkles,
  Layers,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { MediaItem } from "@/lib/types";
import { optimizeAndConvertToWebP, formatBytes, CompressionResult } from "@/lib/imageOptimizer";
import { useToast } from "@/context/ToastContext";

export default function AdminStoragePage() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/storage", { cache: "no-store", headers: { "Cache-Control": "no-cache" } });
      const data = await res.json();
      if (data.mediaItems) {
        setMediaList(data.mediaItems);
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to load storage media", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Optimizing ${file.name} to WebP (${i + 1}/${files.length})...`);

        const result: CompressionResult = await optimizeAndConvertToWebP(file, {
          maxDimension: 1600,
          quality: 0.82,
        });

        setUploadProgress(`Uploading ${formatBytes(result.compressedSizeBytes)} WebP...`);

        const formData = new FormData();
        formData.append("file", result.file);
        formData.append("originalSizeBytes", result.originalSizeBytes.toString());
        formData.append("width", result.width.toString());
        formData.append("height", result.height.toString());

        const res = await fetch("/api/storage/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          successCount++;
        }
      }

      showToast(`Successfully converted & uploaded ${successCount} image(s) to WebP!`, "success");
      fetchMedia();
    } catch (err) {
      console.error(err);
      showToast("Failed to upload image(s)", "error");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteMedia = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" from storage?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/storage?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Image deleted permanently from storage", "info");
        setMediaList((prev) => prev.filter((m) => m.id !== id));
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to delete media", "error");
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    showToast("Image URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Calculations
  const totalStorageBytes = mediaList.reduce((acc, m) => acc + (m.sizeBytes || 0), 0);
  const totalOriginalBytes = mediaList.reduce(
    (acc, m) => acc + (m.originalSizeBytes || m.sizeBytes || 0),
    0
  );
  const totalSavedBytes = Math.max(0, totalOriginalBytes - totalStorageBytes);
  const overallSavingsPercent =
    totalOriginalBytes > 0
      ? Math.round(((totalOriginalBytes - totalStorageBytes) / totalOriginalBytes) * 100)
      : 0;

  const filteredMedia = mediaList.filter((m) => {
    const q = search.toLowerCase();
    return (
      !search ||
      m.name.toLowerCase().includes(q) ||
      m.url.toLowerCase().includes(q) ||
      (m.productName && m.productName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <HardDrive className="w-7 h-7 text-brand-400" />
            <span>Media & Storage Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Auto-compress multi-MB photos to WebP format, inspect file sizes, and manage product cascade cleanup.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchMedia}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-brand-500 hover:bg-brand-600 active:scale-95 text-brand-dark font-black text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-2 shadow-md"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Upload & Convert WebP</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/avif"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Images</span>
          <p className="text-xl sm:text-2xl font-black text-white">{mediaList.length}</p>
          <p className="text-[10px] text-brand-400 font-medium">Auto-Optimized WebP</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Storage Consumed</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400">{formatBytes(totalStorageBytes)}</p>
          <p className="text-[10px] text-slate-400">Total disk footprint</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bandwidth Saved</span>
          <p className="text-xl sm:text-2xl font-black text-brand-400">{formatBytes(totalSavedBytes)}</p>
          <p className="text-[10px] text-emerald-400 font-semibold">-{overallSavingsPercent}% smaller files</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cascade Integrity</span>
          <p className="text-xl sm:text-2xl font-black text-white">Active</p>
          <p className="text-[10px] text-slate-400">Auto-clean on product delete</p>
        </div>
      </div>

      {/* Progress banner during batch uploads */}
      {isUploading && (
        <div className="p-4 rounded-2xl bg-brand-950/60 border border-brand-800/80 flex items-center justify-between text-xs text-brand-200">
          <div className="flex items-center gap-2.5">
            <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
            <span className="font-bold">{uploadProgress}</span>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search media by name or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 text-xs text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 placeholder:text-slate-500"
          />
        </div>

        <span className="text-xs text-slate-400">
          Showing {filteredMedia.length} of {mediaList.length} media files
        </span>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-2 bg-slate-900 rounded-3xl border border-slate-800">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-400" />
          <p className="text-sm font-semibold">Loading media storage library...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="py-20 text-center text-slate-500 space-y-3 bg-slate-900 rounded-3xl border border-slate-800 p-6">
          <ImageIcon className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-slate-300">No media found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload new high-res photos to convert them into ultra-compact WebP files.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 bg-brand-500 text-brand-dark font-black text-xs px-5 py-2.5 rounded-xl"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              {/* Image Preview */}
              <div className="relative aspect-[4/3] w-full bg-slate-950 overflow-hidden">
                <Image src={item.url} alt={item.name} fill className="object-cover" />
                <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md text-emerald-400 font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded border border-emerald-500/30">
                  {item.format.toUpperCase()}
                </span>
                <span className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md text-white font-mono text-[9px] px-2 py-0.5 rounded">
                  {formatBytes(item.sizeBytes)}
                </span>
              </div>

              {/* Info & Metadata */}
              <div className="p-3.5 space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-white truncate" title={item.name}>
                    {item.name}
                  </h4>
                  {item.productName && (
                    <p className="text-[10px] text-brand-400 truncate mt-0.5">
                      Attached: {item.productName}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleCopyUrl(item.url, item.id)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-bold py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                    title="Copy URL"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleDeleteMedia(item.id, item.name)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors"
                    title="Delete permanently"
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
