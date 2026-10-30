// Runs after `next build` (see the "build" script in package.json).
//
// Only does something for the static export (NEXT_OUTPUT=export): static hosts
// cannot run proxy.ts, so there is no per-request nonce. Instead, every
// exported HTML page gets a CSP <meta> tag that allows exactly the inline
// scripts of that page (by SHA-256 hash). For all other output modes the CSP
// header is set by proxy.ts.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

import { contentSecurityPolicy } from "../lib/csp.mjs";

// Only written by `next build` for the static export
const exportDetailFile = path.join(".next", "export-detail.json");

/** @param {string} dir @returns {string[]} */
function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const file = path.join(dir, name);
    if (statSync(file).isDirectory()) return htmlFiles(file);
    return name.endsWith(".html") ? [file] : [];
  });
}

/** @param {string} file */
function addCsp(file) {
  const html = readFileSync(file, "utf8");
  if (html.includes('http-equiv="Content-Security-Policy"')) {
    throw new Error(`${file}: already has a CSP meta tag`);
  }

  const hashes = new Set();
  for (const [, attributes, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=/.test(attributes) || body === "") continue;
    hashes.add(`'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`);
  }

  const csp = contentSecurityPolicy({ scriptSources: [...hashes], meta: true });
  const meta = `<meta http-equiv="Content-Security-Policy" content="${csp}"/>`;

  // The CSP only applies to content after the tag, so it has to come first in <head>
  let added = false;
  const result = html.replace(/<head>(<meta charSet="utf-8"\/>)?/, (head) => {
    added = true;
    return head + meta;
  });
  if (!added) throw new Error(`${file}: no <head> found for the CSP meta tag`);
  writeFileSync(file, result);
}

if (existsSync(exportDetailFile)) {
  const { outDirectory, success } = JSON.parse(readFileSync(exportDetailFile, "utf8"));
  if (!success) throw new Error("CSP: static export was not successful");

  const files = htmlFiles(outDirectory);
  files.forEach(addCsp);
  console.log(`CSP: added hash-based CSP meta tags to ${files.length} exported pages`);
}
