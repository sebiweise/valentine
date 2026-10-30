# Valentine

A small [Next.js](https://nextjs.org/) app that asks the big question: *"Will you be my Valentine?"*
Every click on "No" makes the "Yes" button a little bigger.

## Personalize it

Add a `name` query parameter to address someone directly:

```
https://your-domain.example/?name=Alex
```

## Development

Requires Node.js >= 20.9 and [pnpm](https://pnpm.io/) (the version is pinned in `package.json` → `packageManager`).

```bash
pnpm install
pnpm dev        # start the dev server on http://localhost:3000
pnpm check      # lint + typecheck
pnpm build      # production build
```

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
| `NEXT_OUTPUT` | *(unset)*, `standalone`, `export` | Next.js [output mode](https://nextjs.org/docs/app/api-reference/config/next-config-js/output). Leave unset for Vercel, `standalone` is used by the Dockerfile, `export` creates a static site in `out/` (custom security headers then have to be set by the web server, see below). |

## Security headers

The app only loads resources from its own origin (the illustrations are inline SVGs, the font is self-hosted by `next/font`).

- **Server (unset or `standalone`):** `proxy.ts` sets a strict `Content-Security-Policy` with a fresh nonce per request. Next.js adds the nonce to its inline bootstrap scripts, so pages are rendered per request instead of being prerendered. `next.config.ts` adds the other security headers, including `Strict-Transport-Security`.
- **Static export (`export`):** Static hosts cannot run `proxy.ts`, so `pnpm build` (`scripts/postbuild.mjs`) adds a CSP `<meta>` tag with the SHA-256 hashes of the inline scripts to every exported page. Always build with `pnpm build`, not `next build` directly. A `<meta>` CSP cannot contain `frame-ancestors`, and the other headers cannot be set from HTML. Configure them in the web server: `Strict-Transport-Security: max-age=63072000`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` and `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

The policy itself is defined in `lib/csp.mjs`.
