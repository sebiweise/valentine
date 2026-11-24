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
| `VERCEL` | *(set by Vercel)* | System variable of Vercel (`1`). Vercel Web Analytics and Speed Insights are only loaded when it is set, see [Analytics](#analytics). Do not set it elsewhere. |

## Security headers

The app only loads resources from its own origin (the illustrations are inline SVGs, the font is self-hosted by `next/font`, Vercel Analytics and Speed Insights come from `/_vercel`, see [Analytics](#analytics)).

- **Server (unset or `standalone`):** `proxy.ts` sets a strict `Content-Security-Policy` with a fresh nonce per request. Next.js adds the nonce to its inline bootstrap scripts, so pages are rendered per request instead of being prerendered. `next.config.ts` adds the other security headers, including `Strict-Transport-Security`.
- **Static export (`export`):** Static hosts cannot run `proxy.ts`, so `pnpm build` (`scripts/postbuild.mjs`) adds a CSP `<meta>` tag with the SHA-256 hashes of the inline scripts to every exported page. Always build with `pnpm build`, not `next build` directly. A `<meta>` CSP cannot contain `frame-ancestors`, and the other headers cannot be set from HTML. Configure them in the web server: `Strict-Transport-Security: max-age=63072000`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` and `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

The policy itself is defined in `lib/csp.mjs`.

## Analytics

[Vercel Web Analytics](https://vercel.com/docs/analytics) (page views) and [Vercel Speed Insights](https://vercel.com/docs/speed-insights) (Web Vitals) via `@vercel/analytics` and `@vercel/speed-insights`, mounted once in `app/layout.tsx` (`app/insights.tsx`, helpers in `lib/insights.ts`). Enable both in the Vercel project (tabs *Analytics* and *Speed Insights*); without that the scripts under `/_vercel` answer with 404.

- Loaded only in a production build on Vercel (`VERCEL=1`, `insightsEnabled()`): previews count as well, local development, Docker and other hosts load nothing.
- Only `/` is reported, always without query string and fragment (`publicEvent()`): `?name=` contains the name of the person being asked and never leaves the browser. 404s and every other path are dropped. A new page has to be added to `PUBLIC_PATHS`.
- The scripts come from `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js` and report to `/_vercel/…`. If Vercel sets `NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH` at build time, both packages use that randomized same-origin path instead (`<basePath>/insights/…`, `<basePath>/speed-insights/…`). `proxy.ts` passes both through untouched (`/_vercel` excluded in the matcher, the base path via an early return, `isObservabilityPath()`). The CSP allows them via `'self'` or nonce and `'strict-dynamic'`; `connect-src 'self'` is enough. A client config with a `dsn` would load Speed Insights from `va.vercel-scripts.com`, which the CSP blocks.

Privacy, a deliberate decision without a consent banner:

- Neither package sets cookies or stores anything in the browser; Vercel counts visitors with a hash of the request that changes daily and is discarded after 24 hours. Legal basis is legitimate interest (Art. 6(1)(f) GDPR): reach and loading times of the site.
- § 25 TDDDG: the scripts read information from the browser (URL, referrer, user agent, connection type, Web Vitals via the Performance API). No consent is obtained for that, also not under § 25(1) TDDDG, and the exception in § 25(2) no. 2 is not relied on. Supervisory authorities (DSK, *Orientierungshilfe Digitale Dienste*) treat reading via JavaScript as access to the terminal device and reach measurement as not strictly necessary; under that reading an opt-in would be required. This residual risk is accepted. To switch to opt-in, render `<Insights />` only after consent and base the privacy policy on Art. 6(1)(a) GDPR in conjunction with § 25(1) TDDDG.
- Objection: individual visitors cannot be excluded for lack of an identifier; content blockers stop the scripts.
- Retention according to the Vercel docs: the reporting window of the plan (Web Analytics one month on Hobby up to 24 months, Speed Insights 7 to 90 days). Data goes to Vercel Inc. (USA) under the EU-US Data Privacy Framework and standard contractual clauses.
- Provider: Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA. Privacy policy: https://vercel.com/legal/privacy-policy.
- Data processed: page URL or route without query string and fragment (only `/`), referrer, browser, operating system and device type, country (derived from the IP address, which is not stored), connection type, Web Vitals including the page element they refer to, time of the visit and SDK version.
- The app has no privacy policy page of its own. The privacy policy linked for the deployment has to describe Vercel Web Analytics and Speed Insights with the facts above: provider and address, data processed, no cookies and nothing stored on the device, the daily-rotating visitor hash discarded after 24 hours, what the scripts read from the browser, that only `/` is reported, legal basis (no consent, also not under § 25(1) TDDDG), retention, USA transfer under the EU-US Data Privacy Framework and standard contractual clauses, the link to Vercel's privacy policy and the right to object. If what is collected changes (custom events, another service), update it and this section.
