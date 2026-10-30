# Keep in sync with the "packageManager" field in package.json
ARG PNPM_VERSION=12.8.1

##### DEPENDENCIES

# Build stages use Debian (glibc) to match the distroless Debian runtime, so
# platform-specific native modules traced into the standalone output load there.
# Base images are pinned by digest (multi-platform index), Dependabot updates
# tag and digest together.
FROM node:26-trixie-slim@sha256:e4db4c914bf8ad241bd24804fc25d272d89bad97e68cdc8a1414862790a02c39 AS deps
ARG PNPM_VERSION
WORKDIR /app

RUN npm install -g --ignore-scripts pnpm@${PNPM_VERSION}

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

##### BUILDER

FROM node:26-trixie-slim@sha256:e4db4c914bf8ad241bd24804fc25d272d89bad97e68cdc8a1414862790a02c39 AS builder
ARG PNPM_VERSION
WORKDIR /app
RUN npm install -g --ignore-scripts pnpm@${PNPM_VERSION}
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_OUTPUT=standalone

RUN pnpm run build

##### RUNNER

FROM gcr.io/distroless/nodejs26-debian13:nonroot@sha256:a51c5d631b90e1b298e17a88a307b77f0b959b47de942d033acce0c96be3fb83 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=nonroot:nonroot /app/public ./public
COPY --from=builder --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/.next/static ./.next/static

USER nonroot

EXPOSE 3000

CMD ["server.js"]
