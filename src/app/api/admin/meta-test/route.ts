import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendMetaTestEvent } from "@/lib/metaConversionsApi";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const settings = await db.getSettings();

    const pixelId = (body.pixelId || settings.facebookPixelId || "").trim();
    const accessToken = (body.accessToken || settings.facebookAccessToken || "").trim();
    const testEventCode = (body.testEventCode || settings.facebookTestEventCode || "").trim();

    if (!pixelId) {
      return NextResponse.json(
        { success: false, error: "Facebook Pixel ID is missing." },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Meta Conversions API Access Token is missing. Generate one from Meta Events Manager > Settings.",
        },
        { status: 400 }
      );
    }

    const result = await sendMetaTestEvent(pixelId, accessToken, testEventCode);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Meta API rejected the test event.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Meta Conversions API test event sent successfully! Check Meta Events Manager (Test Events tab).",
      eventsReceived: result.data?.events_received || 1,
      fbTraceId: result.data?.fbtrace_id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
