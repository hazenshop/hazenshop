import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = await verifyAdminToken(token);

  // 1. ADMIN UI ROUTE PROTECTION
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. ADMIN API MUTATION PROTECTION
  // Automatically block unauthorized POST, PATCH, PUT, DELETE requests on administrative API routes
  if (pathname.startsWith("/api/")) {
    // Exceptions: Allow public customer order & draft capture actions
    const isPublicOrderSubmission =
      (pathname === "/api/orders" || pathname === "/api/orders/draft") && method === "POST";
    const isAuthLoginEndpoint = pathname === "/api/admin/auth";
    const isPublicRead = method === "GET" || method === "HEAD" || method === "OPTIONS";

    if (!isPublicRead && !isPublicOrderSubmission && !isAuthLoginEndpoint) {
      if (!isAuthenticated) {
        return NextResponse.json(
          {
            error: "Unauthorized: Admin session required to perform this action.",
            code: "UNAUTHORIZED_ADMIN_ACTION",
          },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
