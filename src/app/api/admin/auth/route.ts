import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  generateAdminToken,
  verifyAdminToken,
  checkRateLimit,
  recordFailedLogin,
  resetRateLimit,
} from "@/lib/auth";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "hazen2026";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isValid = await verifyAdminToken(token);
  return NextResponse.json({ authenticated: isValid });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    const minutes = Math.ceil((rateLimit.retryAfterSec || 900) / 60);
    return NextResponse.json(
      {
        error: `অ্যাকাউন্ট সাময়িকভাবে লক রয়েছে। দয়া করে ${minutes} মিনিট পর আবার চেষ্টা করুন। (Account locked. Please try again in ${minutes} minutes.)`,
        locked: true,
        retryAfter: rateLimit.retryAfterSec,
      },
      { status: 429 }
    );
  }

  try {
    const { password } = await req.json();

    if (!password || password !== ADMIN_PASSWORD) {
      const failure = recordFailedLogin(ip);

      if (failure.isLockedOut) {
        return NextResponse.json(
          {
            error: `অতিরিক্ত ভুল পাসওয়ার্ড দেওয়ার কারণে অ্যাকাউন্ট ১৫ মিনিটের জন্য সাময়িকভাবে লক করা হয়েছে। (Maximum attempts exceeded. Account locked for 15 minutes.)`,
            locked: true,
            retryAfter: failure.retryAfterSec,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: `ভুল পাসওয়ার্ড! আর মাত্র ${failure.remainingAttempts} বার চেষ্টা করা যাবে। (Invalid password. ${failure.remainingAttempts} attempts remaining)`,
          remainingAttempts: failure.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // Successful login: reset rate limit attempts
    resetRateLimit(ip);

    const token = await generateAdminToken();
    const response = NextResponse.json({ success: true, message: "Logged in successfully" });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Authentication request failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
