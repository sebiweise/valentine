# CLAUDE.md

A small Next.js app that asks "Will you be my Valentine?"; every click on "No" makes the "Yes" button bigger. A `?name=` query parameter addresses someone directly. Overview in `README.md`.

## Stack

- Next.js 16 (App Router, `app/`), React 19, TypeScript, Tailwind CSS v4, zod.
- Environment variables are validated with `@t3-oss/env-nextjs` in `env.ts` (example in `.env.example`, `SKIP_ENV_VALIDATION=1` skips it).
- Node.js version from `.nvmrc` (also used by Docker, the devcontainer and CI), pnpm version from `packageManager` in `package.json`.

## Commands

- `pnpm dev`: dev server on http://localhost:3000.
- `pnpm check`: eslint + `next typegen` + `tsc --noEmit`. CI: `pages.yml` builds the static export on `master`, `security.yml` runs the security scan. No CI job runs `pnpm check` or `docker build .`, so run them locally.
- `pnpm build`: production build, followed by `scripts/postbuild.mjs`. Always build with `pnpm build`, never `next build` directly.
- Output mode via `NEXT_OUTPUT`: unset for the default Next.js server, `standalone` (set by the Dockerfile), `export` for a static site in `out/` (`NEXT_OUTPUT=export pnpm build`).
- `BASE_PATH`: path prefix (Next.js `basePath`/`assetPrefix`), e.g. `NEXT_OUTPUT=export BASE_PATH=/valentine pnpm build` like the Pages workflow (in Git Bash prefix `MSYS_NO_PATHCONV=1`). Absolute paths to files in `public/` are not prefixed by Next.js: write them as `${env.BASE_PATH}/file` (see the favicon in `app/layout.tsx`).

## Hosting

Production is the static export on GitHub Pages as a project site (https://sebiweise.github.io/valentine/). `.github/workflows/pages.yml` builds with `NEXT_OUTPUT=export` and `BASE_PATH=/<repository name>` on every push to `master` (or manually) and deploys `out/` with `actions/upload-pages-artifact` + `actions/deploy-pages`; Settings → Pages → Source must be "GitHub Actions". Keep the app free of server-only features (API routes, per-request data), since the export cannot run them, and keep every absolute URL working under the base path. The Docker image (`standalone`) stays a supported alternative.

## Content Security Policy

The app loads resources only from its own origin (inline SVG illustrations, font self-hosted by `next/font`). Keep it that way: no CDNs, hotlinked images or external scripts. The policy lives in `lib/csp.mjs`.

- Server (unset or `standalone`): `proxy.ts` sets a strict CSP with a fresh nonce per request, so pages render per request instead of being prerendered. `next.config.ts` adds the other security headers (`lib/security-headers.mjs`), including HSTS.
- Static export (`export`): `proxy.ts` does not run, so `scripts/postbuild.mjs` adds a CSP `<meta>` tag with SHA-256 hashes of the inline scripts to every exported page; `app/layout.tsx` sets the referrer policy as `<meta>` too. GitHub Pages cannot send response headers, so `frame-ancestors`/`X-Frame-Options`, `nosniff` and `Permissions-Policy` are missing there (documented in `README.md`); HSTS comes from `github.io`. Do not add a `_headers` file, Pages ignores it.

## graphify (code graph)

[graphify](https://github.com/Graphify-Labs/graphify) (PyPI `graphifyy`) keeps a knowledge graph of this codebase in `graphify-out/` (gitignored: a build product, rewritten whole on every build, so it is never committed). `.claude/hooks/graphify-session-start.sh` builds it at the start of every session: AST-only (`--code-only`, local tree-sitter, no API key, seconds), so it always matches the checkout. Cloud sessions install the pinned `graphifyy` themselves (wheels only); locally the hook only runs if graphify is already on your `PATH` (`uv tool install graphifyy`) and never installs anything.

Rules:
- When `graphify-out/graph.json` exists, ask the graph before your first grep or source-file read for a codebase question (`graphify explain "<symbol>"`, `graphify query "<question>"`, `graphify path "<A>" "<B>"`), and put this rule in every subagent prompt that explores code. The codebase is small, so reading a file directly is fine once the graph has located it.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review. Its communities are unnamed (`--no-label`).
- After modifying code, run `graphify update .` so later queries see the change. Never commit `graphify-out/`.
- The `PreToolUse` hooks (`.claude/hooks/graphify-guard.sh`) only add a reminder to a Grep/Read call; they never block one, and do nothing where graphify is not installed.
