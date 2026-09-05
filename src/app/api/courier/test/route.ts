import { NextRequest, NextResponse } from "next/server";
import { getSteadfastBalance } from "@/lib/courier/steadfast";
import { getPathaoStores, getPathaoToken } from "@/lib/courier/pathao";
import { SiteSettings } from "@/lib/types";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const { courier, settings } = body as { courier: "steadfast" | "pathao"; settings: SiteSettings };

    if (!courier || !settings) {
      return NextResponse.json(
        { success: false, message: "কুরিয়ারের নাম ও সেটিংস প্রদান করা আবশ্যক। (Courier & settings required)" },
        { status: 400 }
      );
    }

    if (courier === "steadfast") {
      const apiKey = (settings.steadfastApiKey || "").trim();
      const secretKey = (settings.steadfastSecretKey || "").trim();

      if (!apiKey || !secretKey) {
        return NextResponse.json({
          success: false,
          endpoint: "https://portal.steadfast.com.bd/api/v1/get_balance",
          durationMs: Date.now() - startTime,
          message: "Steadfast API Key অথবা Secret Key খালি রয়েছে। দয়া করে সেটিংস ইনপুটে কিগুলো প্রবেশ করান।",
          diagnostic: "Missing API Credentials: Api-Key and Secret-Key are required.",
        });
      }

      const balanceRes = await getSteadfastBalance(settings);
      const durationMs = Date.now() - startTime;

      return NextResponse.json({
        ...balanceRes,
        endpoint: "https://portal.steadfast.com.bd/api/v1/get_balance",
        durationMs,
      });
    }

    if (courier === "pathao") {
      const clientId = (settings.pathaoClientId || "").trim();
      const clientSecret = (settings.pathaoClientSecret || "").trim();
      const username = (settings.pathaoUsername || "").trim();
      const password = (settings.pathaoPassword || "").trim();

      if (!clientId || !clientSecret || !username || !password) {
        return NextResponse.json({
          success: false,
          endpoint: settings.pathaoSandbox
            ? "https://courier-api-sandbox.pathao.com"
            : "https://api-hermes.pathao.com",
          durationMs: Date.now() - startTime,
          message: "Pathao Client ID, Client Secret, Email অথবা Password খালি রয়েছে।",
          diagnostic: "Missing Credentials: Client ID, Client Secret, Username, and Password are all required.",
        });
      }

      const tokenRes = await getPathaoToken(settings);
      if (!tokenRes.success) {
        return NextResponse.json({
          ...tokenRes,
          endpoint: settings.pathaoSandbox
            ? "https://courier-api-sandbox.pathao.com/aladdin/api/v1/issue-token"
            : "https://api-hermes.pathao.com/aladdin/api/v1/issue-token",
          durationMs: Date.now() - startTime,
        });
      }

      const storesRes = await getPathaoStores(settings);
      const durationMs = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        message: "Pathao এপিআই কানেকশন সফল হয়েছে এবং টোকেন সক্রিয় আছে!",
        stores: storesRes.stores || [],
        endpoint: settings.pathaoSandbox
          ? "https://courier-api-sandbox.pathao.com/aladdin/api/v1/stores"
          : "https://api-hermes.pathao.com/aladdin/api/v1/stores",
        durationMs,
      });
    }

    return NextResponse.json(
      { success: false, message: "অপ্রত্যাশিত কুরিয়ার রিকোয়েস্ট (Invalid courier)", durationMs: Date.now() - startTime },
      { status: 400 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
