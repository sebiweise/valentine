// @ts-check
// Plain JavaScript (with JSDoc types), so that both the TypeScript code
// (proxy.ts) and the Node.js postbuild script can import it

/**
 * Builds the Content-Security-Policy of the app.
 *
 * Only same-origin resources are allowed. Inline scripts (the Next.js
 * bootstrap scripts) are only allowed via `scriptSources`: a per-request nonce
 * (proxy.ts) or the SHA-256 hashes of the exported pages (scripts/postbuild.mjs).
 *
 * @param {object} options
 * @param {string[]} options.scriptSources Additional `script-src` sources, e.g. `'nonce-…'` or `'sha256-…'`
 * @param {boolean} [options.isDev] Adds `'unsafe-eval'`, which React needs in development for debugging
 * @param {boolean} [options.meta] Omits directives that are not supported in a `<meta>` tag (`frame-ancestors`)
 * @returns {string}
 */
export function contentSecurityPolicy({ scriptSources, isDev = false, meta = false }) {
  /** @type {Record<string, string[]>} */
  const directives = {
    "default-src": ["'self'"],
    "script-src": ["'self'", ...scriptSources, ...(isDev ? ["'unsafe-eval'"] : [])],
    // React renders the size of the Yes button as an inline style attribute,
    // which nonces and hashes cannot allow
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'"],
    "font-src": ["'self'"],
    "connect-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    ...(meta ? {} : { "frame-ancestors": ["'none'"] }),
  };

  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
    .join("; ");
}
