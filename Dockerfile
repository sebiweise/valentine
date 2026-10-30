# Keep in sync with the "packageManager" field in package.json
ARG PNPM_VERSION=12.8.1

##### DEPENDENCIES

# Build stages use Debian (glibc) to match the distroless Debian runtime, so
# platform-specific native modules traced into the standalone output load there
FROM node:26-trixie-slim AS deps
ARG PNPM_VERSION
WORKDIR /app

RUN npm install -g --ignore-scripts pnpm@${PNPM_VERSION}

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

##### BUILDER

FROM node:26-trixie-slim AS builder
ARG PNPM_VERSION
WORKDIR /app
RUN npm install -g --ignore-scripts pnpm@${PNPM_VERSION}
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_OUTPUT=standalone

RUN pnpm run build

##### RUNNER

FROM gcr.io/distroless/nodejs26-debian13:nonroot AS runner
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
