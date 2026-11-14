import { NextResponse } from "next/server";
import { auth } from "./auth";

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    const token = req.headers.get("x-internal-token");
    const expectedToken = process.env.NEXT_PUBLIC_INTERNAL_API_SECRET;

    if (token !== expectedToken) {
      console.warn(`[Firewall] Blocked access to ${pathname}: Invalid token`);
      return NextResponse.json(
        { error: "Unauthorized: Invalid internal token" },
        { status: 401 },
      );
    }

    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");

    const allowedOrigin = process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.PRODUCTION_URL;

    const isAllowedOrigin = origin === allowedOrigin;
    const isAllowedReferer = referer && referer.startsWith(allowedOrigin || "");

    if (!isAllowedOrigin && !isAllowedReferer) {
      console.warn(`[Firewall] Blocked access from unauthorized origin`);
      return NextResponse.json(
        { error: "Forbidden: API access restricted" },
        { status: 403 },
      );
    }
  }

  if (pathname.startsWith("/api/sheets") || pathname.startsWith("/api/upload")) {
    if (!req.auth) {
      return NextResponse.json(
        { error: "Unauthorized: Session required" },
        { status: 401 },
      );
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
  }

  if (pathname.startsWith("/login")) {
    if (req.auth) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/api/sheets",
    "/api/sheets/:path*",
    "/api/upload",
    "/api/upload/:path*",
  ],
};
