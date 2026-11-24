/**
 * Helpers for Vercel Web Analytics and Speed Insights (app/insights.tsx) and
 * for proxy.ts. Kept free of imports and path aliases, so they stay plain
 * functions that need neither a browser nor Next.js.
 */

/** The only page of the app. Every other path (404s) is not reported. */
export const PUBLIC_PATHS: readonly string[] = ["/"];

/**
 * Whether to load the scripts: only in a production build on Vercel, which
 * serves them from the own origin. Elsewhere (Docker, other static hosts)
 * they would 404, and in development the packages load a debug script from
 * va.vercel-scripts.com, which the CSP blocks.
 */
export function insightsEnabled(vercel: string | undefined, nodeEnv: string | undefined): boolean {
  return vercel === "1" && nodeEnv === "production";
}

/**
 * `beforeSend` for `<Analytics />` and `<SpeedInsights />`: the event with its
 * address reduced to origin and path, or `null` (not sent) for anything but a
 * public page. The query string is always dropped, because `?name=` carries
 * the name of the person being asked; the fragment as well.
 */
export function publicEvent<T extends { url: string }>(
  event: T,
  publicPaths: readonly string[] = PUBLIC_PATHS,
): T | null {
  let url: URL;
  try {
    url = new URL(event.url);
  } catch {
    return null;
  }
  const path = url.pathname.length > 1 ? trimTrailingSlashes(url.pathname) : url.pathname;
  if (!publicPaths.includes(path)) return null;
  return { ...event, url: `${url.origin}${path}` };
}

/**
 * Whether a request goes to the scripts and endpoints of Vercel Analytics and
 * Speed Insights, which proxy.ts has to pass through untouched: `/_vercel/…`
 * or, if Vercel set `NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH` at build time,
 * the randomized same-origin path the packages then use instead
 * (`${basePath}/insights/…`, `${basePath}/speed-insights/…`).
 */
export function isObservabilityPath(pathname: string, basePath: string | undefined): boolean {
  if (pathname === "/_vercel" || pathname.startsWith("/_vercel/")) return true;
  if (!basePath) return false;
  // The packages prefix a missing leading slash themselves
  const prefix = `/${trimSlashes(basePath)}`;
  if (prefix === "/") return false;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * The value without trailing slashes. A loop instead of `/\/+$/`, which
 * backtracks super-linearly on long runs of slashes.
 */
function trimTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1] === "/") end--;
  return value.slice(0, end);
}

/** The value without leading and trailing slashes (see trimTrailingSlashes). */
function trimSlashes(value: string): string {
  let start = 0;
  while (start < value.length && value[start] === "/") start++;
  return trimTrailingSlashes(value.slice(start));
}
