##### DEPENDENCIES

FROM node:26-alpine AS deps
WORKDIR /app

# Keep in sync with the "packageManager" field in package.json
RUN npm install -g pnpm@12.8.1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

##### BUILDER

FROM node:26-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@12.8.1
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
ENV NEXT_OUTPUT=standalone
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=nonroot:nonroot /app/public ./public
COPY --from=builder --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/.next/static ./.next/static

USER nonroot

EXPOSE 3000

CMD ["server.js"]
