import { type NextRequest, NextResponse } from "next/server";

const DEFAULT_ALLOWED_HEADERS = "Content-Type, Authorization, X-Requested-With";
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/([a-z0-9-]+\.)*pro-track\.app$/i,
  /^http:\/\/localhost(?::\d+)?$/i,
  /^https:\/\/localhost(?::\d+)?$/i,
  /^http:\/\/127\.0\.0\.1(?::\d+)?$/i,
  /^https:\/\/127\.0\.0\.1(?::\d+)?$/i,
];

function isAllowedOrigin(origin: string): boolean {
  return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
}

function applyCorsHeaders(response: NextResponse, request: NextRequest): void {
  const origin = request.headers.get("origin");

  if (!origin || !isAllowedOrigin(origin)) {
    return;
  }

  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    request.headers.get("access-control-request-headers") ??
      DEFAULT_ALLOWED_HEADERS,
  );
  const varyHeader = response.headers.get("Vary");
  response.headers.set("Vary", varyHeader ? `${varyHeader}, Origin` : "Origin");
}

export function proxy(request: NextRequest) {
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    applyCorsHeaders(response, request);
    return response;
  }

  const response = NextResponse.next();
  applyCorsHeaders(response, request);
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
