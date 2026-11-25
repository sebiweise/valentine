# Valentine

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=sebiweise_valentine&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=sebiweise_valentine)

A small [Next.js](https://nextjs.org/) app that asks the big question: *"Will you be my Valentine?"*
Every click on "No" makes the "Yes" button a little bigger.

## Personalize it

Add a `name` query parameter to address someone directly:

```
https://sebiweise.github.io/valentine/?name=Alex
```

## Development

Requires Node.js >= 26 (see `.nvmrc`, also used by Docker, the devcontainer and CI) and [pnpm](https://pnpm.io/) (the version is pinned in `package.json` → `packageManager`).

```bash
pnpm install
pnpm dev        # start the dev server on http://localhost:3000
pnpm check      # lint + typecheck
pnpm build      # production build
```

## Deployment (GitHub Pages)

Production is the static export on [GitHub Pages](https://docs.github.com/pages) as a project site: <https://sebiweise.github.io/valentine/>. The `?name=` parameter is read in the browser, so the exported page works for every name.

`.github/workflows/pages.yml` deploys on every push to `master` (and manually via *Run workflow*): it builds with `NEXT_OUTPUT=export` and `BASE_PATH=/<repository name>`, uploads `out/` with `actions/upload-pages-artifact` and publishes it with `actions/deploy-pages`. The repository setting *Settings → Pages → Source* has to be *GitHub Actions*.

Build and check the export locally under the same path:

```bash
NEXT_OUTPUT=export BASE_PATH=/valentine pnpm build
```

In Git Bash on Windows, prefix the command with `MSYS_NO_PATHCONV=1`, otherwise `/valentine` is turned into a Windows path. Serve `out/` with any static file server so that it is reachable under `/valentine/` (for example by copying it into a `valentine/` folder below the server root).

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
| `NEXT_OUTPUT` | *(unset)*, `standalone`, `export` | Next.js [output mode](https://nextjs.org/docs/app/api-reference/config/next-config-js/output). Leave unset for the default Next.js server (`next start`), `standalone` is used by the Dockerfile, `export` creates a static site in `out/` (used for GitHub Pages, see above). |
| `BASE_PATH` | *(unset)*, e.g. `/valentine` | Path prefix the app is served under (Next.js `basePath` and `assetPrefix`). Set by the Pages workflow to `/<repository name>`. Must start with `/`; one trailing slash is ignored. Leave unset to serve the app at the root of the domain. |

## Security headers

The app only loads resources from its own origin (the illustrations are inline SVGs, the font is self-hosted by `next/font`).

- **Server (unset or `standalone`):** `proxy.ts` sets a strict `Content-Security-Policy` with a fresh nonce per request. Next.js adds the nonce to its inline bootstrap scripts, so pages are rendered per request instead of being prerendered. `next.config.ts` adds the other security headers, including `Strict-Transport-Security`.
- **Static export (`export`, GitHub Pages):** Static hosts cannot run `proxy.ts`, so `pnpm build` (`scripts/postbuild.mjs`) adds a CSP `<meta>` tag with the SHA-256 hashes of the inline scripts to every exported page. Always build with `pnpm build`, not `next build` directly. The referrer policy is also set as `<meta name="referrer" content="strict-origin-when-cross-origin">`. GitHub Pages cannot send custom response headers, so the export has **no** clickjacking protection (`frame-ancestors` is not allowed in a `<meta>` CSP, and there is no `X-Frame-Options`), no `X-Content-Type-Options: nosniff` and no `Permissions-Policy`. HTTPS and HSTS are handled by `github.io` itself. Use the Docker image or a host that can set headers if you need them.

The policy itself is defined in `lib/csp.mjs`, the other headers in `lib/security-headers.mjs`.
