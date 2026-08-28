import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { db } from "@/lib/db";
import { MediaItem } from "@/lib/types";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    try {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    } catch (e) {
      console.error("Failed to create uploads dir", e);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    ensureUploadsDir();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const productId = (formData.get("productId") as string) || undefined;
    const productName = (formData.get("productName") as string) || undefined;
    const categorySlug = (formData.get("categorySlug") as string) || undefined;
    const originalSizeBytes = Number(formData.get("originalSizeBytes")) || (file ? file.size : 0);
    const width = Number(formData.get("width")) || undefined;
    const height = Number(formData.get("height")) || undefined;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Clean filename and ensure .webp extension
    const baseName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-");

    const uniqueId = `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const fileName = `${baseName || "image"}-${uniqueId}.webp`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;
    const compressedSizeBytes = buffer.length;
    const percentSaved =
      originalSizeBytes > compressedSizeBytes
        ? Math.round(((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100)
        : 0;

    const mediaItem: MediaItem = {
      id: uniqueId,
      name: file.name,
      url: publicUrl,
      sizeBytes: compressedSizeBytes,
      originalSizeBytes: originalSizeBytes > 0 ? originalSizeBytes : compressedSizeBytes,
      format: "webp",
      width,
      height,
      productId,
      productName,
      categorySlug,
      createdAt: new Date().toISOString(),
    };

    await db.createMediaItem(mediaItem);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      mediaItem,
      originalSizeBytes: mediaItem.originalSizeBytes,
      compressedSizeBytes,
      percentSaved,
    });
  } catch (error) {
    console.error("Storage upload error:", error);
    return NextResponse.json({ error: "Failed to upload and process image" }, { status: 500 });
  }
}
