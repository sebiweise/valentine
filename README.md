# Valentine

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=sebiweise_valentine&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=sebiweise_valentine)

A small [Next.js](https://nextjs.org/) app that asks the big question: *"Will you be my Valentine?"*
Every click on "No" makes the "Yes" button a little bigger.

## Personalize it

Add a `name` query parameter to address someone directly:

```
https://your-domain.example/?name=Alex
```

## Development

Requires Node.js >= 26 (see `.nvmrc`, also used by Docker, the devcontainer and CI) and [pnpm](https://pnpm.io/) (the version is pinned in `package.json` → `packageManager`).

```bash
pnpm install
pnpm dev        # start the dev server on http://localhost:3000
pnpm check      # lint + typecheck
pnpm build      # production build
```

## Deployment (Cloudflare Workers)

Production runs as a static export on [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) (`wrangler.jsonc`). There is no Worker script, so every request is served directly from `out/` without invoking a Worker (no server CPU). The `?name=` parameter is read in the browser, so the exported page works for every name.

Build and serve the export locally with [Wrangler](https://developers.cloudflare.com/workers/wrangler/) (no Cloudflare login needed):

```bash
NEXT_OUTPUT=export pnpm build
pnpm wrangler dev   # http://localhost:8787
```

Deployments run through [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/) (Cloudflare's Git integration), not GitHub Actions. Settings in the Cloudflare dashboard (Workers & Pages → Create → Import a repository, later under Settings → Build):

| Setting | Value |
|---|---|
| Worker name | `valentine` (must match `name` in `wrangler.jsonc`) |
| Production branch | `master` |
| Root directory | `/` |
| Build command | `NEXT_OUTPUT=export pnpm build` |
| Deploy command | `npx wrangler deploy` |
| Non-production branch builds | enabled |
| Non-production branch deploy command | `npx wrangler versions upload` (preview URL per branch) |
| Build variables | none required (Node.js from `.nvmrc`, pnpm from `packageManager`) |
| Runtime variables and secrets | none |

## Docker

The Dockerfile sets `NEXT_OUTPUT=standalone`, so the app is built as a [standalone](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) Next.js server and runs as a non-root user on a distroless image:

```bash
docker build -t valentine .
docker run --rm -p 3000:3000 valentine
```

## Environment variables

Environment variables are validated with [`@t3-oss/env-nextjs`](https://env.t3.gg/) (see `env.ts`, example in `.env.example`).
Set `SKIP_ENV_VALIDATION=1` to skip the validation.

| Variable | Values | Description |
|---|---|---|
| `NEXT_OUTPUT` | *(unset)*, `standalone`, `export` | Next.js [output mode](https://nextjs.org/docs/app/api-reference/config/next-config-js/output). Leave unset for the default Next.js server (`next start`), `standalone` is used by the Dockerfile, `export` creates a static site in `out/` (used for Cloudflare, see above). |

## Security headers

The app only loads resources from its own origin (the illustrations are inline SVGs, the font is self-hosted by `next/font`).

- **Server (unset or `standalone`):** `proxy.ts` sets a strict `Content-Security-Policy` with a fresh nonce per request. Next.js adds the nonce to its inline bootstrap scripts, so pages are rendered per request instead of being prerendered. `next.config.ts` adds the other security headers, including `Strict-Transport-Security`.
- **Static export (`export`):** Static hosts cannot run `proxy.ts`, so `pnpm build` (`scripts/postbuild.mjs`) adds a CSP `<meta>` tag with the SHA-256 hashes of the inline scripts to every exported page. A `<meta>` CSP cannot contain `frame-ancestors`, and the other headers cannot be set from HTML, so the script also writes them into `out/_headers`, which Cloudflare applies to every static response: `Strict-Transport-Security: max-age=63072000`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Content-Security-Policy: frame-ancestors 'none'`, `Referrer-Policy: strict-origin-when-cross-origin` and `Permissions-Policy: camera=(), microphone=(), geolocation=()`. Always build with `pnpm build`, not `next build` directly. Other static hosts have to set these headers themselves.

The policy itself is defined in `lib/csp.mjs`, the other headers in `lib/security-headers.mjs`.
