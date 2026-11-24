"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { publicEvent } from "@/lib/insights";

/**
 * Vercel Web Analytics (page views) and Speed Insights (Web Vitals), without
 * cookies or local storage and without a consent banner (see "Analytics" in
 * README.md). Rendered only on Vercel (app/layout.tsx).
 *
 * The scripts come from the own origin (`/_vercel/…` or the path in
 * `NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH`) and are added by this bundle,
 * which `'self'` (static export) or the nonce and `'strict-dynamic'` (proxy.ts)
 * of the CSP allow; they report to the same origin (`connect-src 'self'`).
 * Only "/" is reported, without the `?name=` query string.
 */
export function Insights() {
  return (
    <>
      <Analytics beforeSend={(event) => publicEvent(event)} />
      <SpeedInsights beforeSend={(event) => publicEvent(event)} />
    </>
  );
}
