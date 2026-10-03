import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { db } from "@/lib/db";
import { MediaItem } from "@/lib/types";
import { isSupabaseConfigured, supabaseAdmin, supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const SUPABASE_BUCKET = "product-images";

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    try {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    } catch (e) {
      console.error("Failed to create uploads dir", e);
    }
  }
}

async function uploadToCloudinary(buffer: Buffer, fileName: string): Promise<string | null> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const cleanPublicId = fileName.replace(/\.[^/.]+$/, "");
    const strToSign = `public_id=${cleanPublicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(strToSign).digest("hex");

    const base64File = `data:image/webp;base64,${buffer.toString("base64")}`;
    const form = new URLSearchParams();
    form.append("file", base64File);
    form.append("api_key", apiKey);
    form.append("timestamp", timestamp.toString());
    form.append("public_id", cleanPublicId);
    form.append("signature", signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    if (data.secure_url) {
      return data.secure_url;
    }
    console.error("Cloudinary upload failed response:", data);
    return null;
  } catch (err) {
    console.error("Cloudinary upload exception:", err);
    return null;
  }
}

async function ensureSupabaseBucket(client: any) {
  try {
    const { data: buckets } = await client.storage.listBuckets();
    if (!buckets?.some((b: any) => b.name === SUPABASE_BUCKET)) {
      await client.storage.createBucket(SUPABASE_BUCKET, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
    }
  } catch (e) {
    console.error("Supabase bucket check/creation notice:", e);
  }
}

export async function POST(req: NextRequest) {
  try {
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

    let publicUrl = "";

    // 1. Primary: Upload to Cloudinary (Zero-Card Free Tier, saves Supabase Egress)
    const cloudinaryUrl = await uploadToCloudinary(buffer, fileName);
    if (cloudinaryUrl) {
      publicUrl = cloudinaryUrl;
    }

    // 2. Secondary Fallback: Supabase Storage CDN (only if Cloudinary not configured)
    const client = supabaseAdmin || supabase;
    if (!publicUrl && isSupabaseConfigured && client) {
      try {
        await ensureSupabaseBucket(client);

        const { error: uploadError } = await client.storage
          .from(SUPABASE_BUCKET)
          .upload(fileName, buffer, {
            contentType: "image/webp",
            upsert: true,
          });

        if (!uploadError) {
          const { data } = client.storage
            .from(SUPABASE_BUCKET)
            .getPublicUrl(fileName);
          
          if (data?.publicUrl) {
            publicUrl = data.publicUrl;
          }
        } else {
          console.error("Supabase storage upload error, falling back to local:", uploadError);
        }
      } catch (sbErr) {
        console.error("Supabase storage exception, falling back to local:", sbErr);
      }
    }

    // 2. Fallback: Save to local public/uploads if Supabase upload didn't yield a URL
    if (!publicUrl) {
      ensureUploadsDir();
      const filePath = path.join(UPLOADS_DIR, fileName);
      fs.writeFileSync(filePath, buffer);
      publicUrl = `/uploads/${fileName}`;
    }

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
