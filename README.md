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

The app is built as a [standalone](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) Next.js server and runs as a non-root user on a distroless image:

```bash
docker build -t valentine .
docker run --rm -p 3000:3000 valentine
```
