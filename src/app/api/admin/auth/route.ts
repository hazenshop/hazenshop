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
    return NextResponse.json(
      {
        error: `Too many failed login attempts. Please try again in ${rateLimit.retryAfterSec} seconds.`,
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
            error: `Maximum login attempts exceeded. Account locked for 15 minutes.`,
            locked: true,
            retryAfter: failure.retryAfterSec,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: `Invalid admin password. (${failure.remainingAttempts} attempts remaining)`,
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
