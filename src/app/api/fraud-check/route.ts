import { NextRequest, NextResponse } from "next/server";
import { performFraudCheck } from "@/lib/fraudChecker";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number query parameter is required." },
        { status: 400 }
      );
    }

    const result = await performFraudCheck(phone);
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    console.error("Fraud check GET error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Failed to perform fraud check." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Handle Blacklist toggle action
    if (body.action === "toggle_blacklist") {
      const { phone } = body;
      if (!phone) {
        return NextResponse.json({ success: false, message: "Phone is required." }, { status: 400 });
      }

      const clean = phone.replace(/[^0-9]/g, "");
      const settings = await db.getSettings();
      const blacklisted = settings.blacklistedPhones || [];

      const exists = blacklisted.some((p) => p.replace(/[^0-9]/g, "").includes(clean));
      let updatedList: string[];

      if (exists) {
        updatedList = blacklisted.filter((p) => !p.replace(/[^0-9]/g, "").includes(clean));
      } else {
        updatedList = [...blacklisted, clean];
      }

      await db.updateSettings({ blacklistedPhones: updatedList });

      return NextResponse.json({
        success: true,
        isBlacklisted: !exists,
        blacklistedPhones: updatedList,
        message: !exists ? `Phone ${clean} added to Blacklist.` : `Phone ${clean} removed from Blacklist.`,
      });
    }

    // Default: Check order details
    const { phone, customerName, customerAddress } = body;
    if (!phone) {
      return NextResponse.json({ success: false, message: "Phone is required." }, { status: 400 });
    }

    const result = await performFraudCheck(phone, {
      customerName,
      customerAddress,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    console.error("Fraud check POST error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Failed to perform fraud check." },
      { status: 500 }
    );
  }
}
