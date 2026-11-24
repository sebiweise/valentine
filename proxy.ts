import { type NextRequest, NextResponse } from "next/server";

import { contentSecurityPolicy } from "./lib/csp.mjs";
import { isObservabilityPath } from "./lib/insights";

/**
 * Sets a strict Content-Security-Policy with a fresh nonce per request.
 * Next.js reads the nonce from the request header and adds it to its own
 * (inline) scripts, which is why the pages are rendered per request (see
 * app/layout.tsx). Not used for the static export (`NEXT_OUTPUT=export`),
 * where scripts/postbuild.mjs adds a hash-based CSP instead.
 *
 * Requests to Vercel Analytics and Speed Insights pass through untouched
 * (app/insights.tsx): `/_vercel` is excluded in the matcher, and the
 * randomized path Vercel may set in NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH
 * at build time cannot be part of the static matcher, hence the early return.
 */
export function proxy(request: NextRequest) {
  // Written out in full so that Next.js inlines the value at build time
  if (isObservabilityPath(request.nextUrl.pathname, process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH)) {
    return NextResponse.next();
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = contentSecurityPolicy({
    scriptSources: [`'nonce-${nonce}'`, "'strict-dynamic'"],
    isDev: process.env.NODE_ENV === "development",
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Static assets need no CSP. /_vercel: scripts and endpoints of Vercel
      // Analytics and Speed Insights (app/insights.tsx).
      source: "/((?!_vercel|_next/static|_next/image|favicon.png).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
