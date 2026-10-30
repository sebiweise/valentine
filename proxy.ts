import { type NextRequest, NextResponse } from "next/server";

import { contentSecurityPolicy } from "./lib/csp.mjs";

/**
 * Sets a strict Content-Security-Policy with a fresh nonce per request.
 * Next.js reads the nonce from the request header and adds it to its own
 * (inline) scripts, which is why the pages are rendered per request (see
 * app/layout.tsx). Not used for the static export (`NEXT_OUTPUT=export`),
 * where scripts/postbuild.mjs adds a hash-based CSP instead.
 */
export function proxy(request: NextRequest) {
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
      // Static assets need no CSP
      source: "/((?!_next/static|_next/image|favicon.png).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
