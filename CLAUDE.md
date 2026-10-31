# CLAUDE.md

A small Next.js app that asks "Will you be my Valentine?"; every click on "No" makes the "Yes" button bigger. A `?name=` query parameter addresses someone directly. Overview in `README.md`.

## Stack

- Next.js 16 (App Router, `app/`), React 19, TypeScript, Tailwind CSS v4, zod.
- Environment variables are validated with `@t3-oss/env-nextjs` in `env.ts` (example in `.env.example`, `SKIP_ENV_VALIDATION=1` skips it).
- Node.js version from `.nvmrc` (also used by Docker, the devcontainer and CI), pnpm version from `packageManager` in `package.json`.

## Commands

- `pnpm dev`: dev server on http://localhost:3000.
- `pnpm check`: eslint + `next typegen` + `tsc --noEmit`. CI runs `pnpm check`, `pnpm build` and `docker build .`.
- `pnpm build`: production build, followed by `scripts/postbuild.mjs`. Always build with `pnpm build`, never `next build` directly.
- Output mode via `NEXT_OUTPUT`: unset for Vercel, `standalone` (set by the Dockerfile), `export` for a static site in `out/` (`NEXT_OUTPUT=export pnpm build`).

## Content Security Policy

The app loads resources only from its own origin (inline SVG illustrations, font self-hosted by `next/font`). Keep it that way: no CDNs, hotlinked images or external scripts. The policy lives in `lib/csp.mjs`.

- Server (unset or `standalone`): `proxy.ts` sets a strict CSP with a fresh nonce per request, so pages render per request instead of being prerendered. `next.config.ts` adds the other security headers, including HSTS.
- Static export (`export`): `proxy.ts` does not run, so `scripts/postbuild.mjs` adds a CSP `<meta>` tag with SHA-256 hashes of the inline scripts to every exported page. `frame-ancestors` and the other headers must then be set by the web server (list in `README.md`).

## Commits

No `Co-Authored-By` lines in commit messages.

## graphify (code graph)

[graphify](https://github.com/Graphify-Labs/graphify) (PyPI `graphifyy`) keeps a knowledge graph of this codebase in `graphify-out/` (gitignored: a build product, rewritten whole on every build, so it is never committed). `.claude/hooks/graphify-session-start.sh` builds it at the start of every session: AST-only (`--code-only`, local tree-sitter, no API key, seconds), so it always matches the checkout. Cloud sessions install the pinned `graphifyy` themselves (wheels only); locally the hook only runs if graphify is already on your `PATH` (`uv tool install graphifyy`) and never installs anything.

Rules:
- When `graphify-out/graph.json` exists, ask the graph before your first grep or source-file read for a codebase question (`graphify explain "<symbol>"`, `graphify query "<question>"`, `graphify path "<A>" "<B>"`), and put this rule in every subagent prompt that explores code. The codebase is small, so reading a file directly is fine once the graph has located it.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review. Its communities are unnamed (`--no-label`).
- After modifying code, run `graphify update .` so later queries see the change. Never commit `graphify-out/`.
- The `PreToolUse` hooks (`.claude/hooks/graphify-guard.sh`) only add a reminder to a Grep/Read call; they never block one, and do nothing where graphify is not installed.
