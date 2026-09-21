# Bun only installs and builds; the shipped runtime is Node, which is what Next standalone expects.
# Cache mounts live in BuildKit storage, so rebuilds are fast without bloating the image.
FROM oven/bun:1.3-slim AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache,sharing=locked \
    bun install --frozen-lockfile

FROM deps AS build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Cache Components needs a stable deployment id so the build cache is reusable.
ARG RELEASE_ID=local
ENV NEXT_DEPLOYMENT_ID=$RELEASE_ID
RUN bun run build

FROM node:24-bookworm-slim AS runner
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    apt-get update && apt-get upgrade -y && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
# standalone carries server.js + the traced node_modules (pg included), so the
# migration script can run inside this same image.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/db ./db
USER node
EXPOSE 3000
CMD ["node", "server.js"]
