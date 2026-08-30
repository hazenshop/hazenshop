import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "hazen2026";
const AUTH_COOKIE = "hazen_admin_token";

// Deterministic token based on password + secret
function getAuthToken() {
  return Buffer.from(`hazen-auth-${ADMIN_PASSWORD}`).toString("base64");
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const isValid = token === getAuthToken();
  return NextResponse.json({ authenticated: isValid });
}

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, message: "Logged in successfully" });
    response.cookies.set({
      name: AUTH_COOKIE,
      value: getAuthToken(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
