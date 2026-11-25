// @ts-check
// Plain JavaScript (with JSDoc types), so that both the TypeScript code
// (next.config.ts) and the Node.js postbuild script can import it

/**
 * Security headers of the app, except the Content-Security-Policy (see lib/csp.mjs).
 *
 * The Next.js server sets them via next.config.ts. For the static export,
 * scripts/postbuild.mjs writes them into the `_headers` file of `out/`, which
 * Cloudflare Workers Static Assets applies to the static responses.
 *
 * @type {{ key: string, value: string }[]}
 */
export const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    // Browsers ignore this header on plain HTTP, so local development is not affected.
    // Without includeSubDomains/preload, so other subdomains of the domain are not affected.
    key: "Strict-Transport-Security",
    value: "max-age=63072000",
  },
];
