import { NextRequest, NextResponse } from "next/server";
import { getSteadfastBalance } from "@/lib/courier/steadfast";
import { getPathaoStores, getPathaoToken } from "@/lib/courier/pathao";
import { SiteSettings } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courier, settings } = body as { courier: "steadfast" | "pathao"; settings: SiteSettings };

    if (!courier || !settings) {
      return NextResponse.json({ success: false, message: "Courier and settings required" }, { status: 400 });
    }

    if (courier === "steadfast") {
      const balanceRes = await getSteadfastBalance(settings);
      return NextResponse.json(balanceRes);
    }

    if (courier === "pathao") {
      const tokenRes = await getPathaoToken(settings);
      if (!tokenRes.success) {
        return NextResponse.json(tokenRes);
      }

      const storesRes = await getPathaoStores(settings);
      return NextResponse.json({
        success: true,
        message: "Pathao API authentication successful!",
        stores: storesRes.stores || [],
      });
    }

    return NextResponse.json({ success: false, message: "Invalid courier" }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
