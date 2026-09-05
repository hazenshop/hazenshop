import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const mediaItems = await db.getMediaItems();
    const totalStorageBytes = mediaItems.reduce((acc, item) => acc + (item.sizeBytes || 0), 0);
    const totalOriginalBytes = mediaItems.reduce((acc, item) => acc + (item.originalSizeBytes || item.sizeBytes || 0), 0);
    const totalSavedBytes = Math.max(0, totalOriginalBytes - totalStorageBytes);

    return NextResponse.json({
      mediaItems,
      totalCount: mediaItems.length,
      totalStorageBytes,
      totalOriginalBytes,
      totalSavedBytes,
    });
  } catch (error) {
    console.error("Storage GET error:", error);
    return NextResponse.json({ error: "Failed to fetch media storage" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    let url = searchParams.get("url");

    if (!id && !url) {
      try {
        const body = await req.json();
        id = body.id;
        url = body.url;
      } catch (e) {
        // ignore
      }
    }

    if (!id && !url) {
      return NextResponse.json({ error: "Image ID or URL is required" }, { status: 400 });
    }

    let success = false;
    if (id) {
      success = await db.deleteMediaItem(id);
    } else if (url) {
      success = await db.deleteFileByUrl(url);
    }

    return NextResponse.json({ success, message: "Image deleted from storage" });
  } catch (error) {
    console.error("Storage DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete image from storage" }, { status: 500 });
  }
}
