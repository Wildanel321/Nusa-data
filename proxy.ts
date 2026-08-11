import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Content Security Policy (CSP)
  // Allows OpenStreetMap tile images, self scripts/styles, and dynamic font requests
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.tile.openstreetmap.org https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, " ").trim();

  response.headers.set("Content-Security-Policy", cspHeader);

  // 2. Strict-Transport-Security (HSTS)
  // Enforce HTTPS for 2 years (63072000 seconds) including subdomains
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  // 3. X-Frame-Options (Clickjacking Protection)
  // Prevent the site from being framed inside iframe/frame tags
  response.headers.set("X-Frame-Options", "DENY");

  // 4. X-Content-Type-Options (MIME Sniffing Protection)
  // Blocks executing scripts from files with incorrect MIME types
  response.headers.set("X-Content-Type-Options", "nosniff");

  // 5. Referrer-Policy
  // Send referrer only for same-origin requests or strict secure connections
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // 6. Permissions-Policy
  // Disable browser features not needed by the application (Camera, Mic)
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self)"
  );

  // 7. CORS / CSRF Protection on API Write Routes
  // Block writing actions from cross-origin requests
  const isWriteMethod = ["POST", "PUT", "DELETE", "PATCH"].includes(request.method);
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  if (isWriteMethod && isApiRoute) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    if (origin && host) {
      const normalizedHost = host.replace(/:\d+$/, ""); // remove port if present
      const normalizedOrigin = origin.replace(/^https?:\/\//, "").replace(/:\d+$/, "");

      if (normalizedOrigin !== normalizedHost) {
        return new NextResponse(
          JSON.stringify({ message: "Forbidden: Cross-Origin Request Blocked" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }

  return response;
}

// Apply proxy to all pages and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
export default proxy;
