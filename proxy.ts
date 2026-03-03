import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.headers.get("x-internal-token");
  const expectedToken = process.env.NEXT_PUBLIC_INTERNAL_API_SECRET;

  if (token !== expectedToken) {
    console.warn(
      `[Firewall] Blocked access to ${request.nextUrl.pathname}: Invalid token`,
    );
    return NextResponse.json(
      { error: "Unauthorized: Invalid internal token" },
      { status: 401 },
    );
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  const allowedOrigin =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.PRODUCTION_URL;

  const isAllowedOrigin = origin === allowedOrigin;
  const isAllowedReferer = referer && referer.startsWith(allowedOrigin || "");

  if (!isAllowedOrigin && !isAllowedReferer) {
    console.warn(
      `[Firewall] Blocked access from unauthorized origin: ${origin || "Unknown"}`,
    );
    return NextResponse.json(
      { error: "Forbidden: API access restricted to host application" },
      { status: 403 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
