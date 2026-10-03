import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendTelegramTestNotification } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const settings = await db.getSettings();

    const token = (body.botToken || settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || "").trim();
    const chatId = (body.chatId || settings.telegramChatId || process.env.TELEGRAM_CHAT_ID || "").trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Telegram Bot Token is missing. Please enter your Bot Token." },
        { status: 400 }
      );
    }

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: "Telegram Chat ID is missing. Please enter your Chat ID." },
        { status: 400 }
      );
    }

    const result = await sendTelegramTestNotification(token, chatId, settings.siteName || "HAZEN SHOP BD");

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send test notification to Telegram.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test message sent successfully! Please check your Telegram app.",
      messageId: result.messageId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
