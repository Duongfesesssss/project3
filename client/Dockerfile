# Dockerfile build & run Nuxt 3 ở chế độ production (dùng cho CI/CD)

## ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

ARG NUXT_PUBLIC_API_BASE
ARG NUXT_PUBLIC_BASE_URL
ARG NUXT_PUBLIC_API_PREFIX
ARG NUXT_PUBLIC_AUTH_BASE

ENV NUXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NUXT_PUBLIC_API_BASE=${NUXT_PUBLIC_API_BASE}
ENV NUXT_PUBLIC_BASE_URL=${NUXT_PUBLIC_BASE_URL}
ENV NUXT_PUBLIC_API_PREFIX=${NUXT_PUBLIC_API_PREFIX}
ENV NUXT_PUBLIC_AUTH_BASE=${NUXT_PUBLIC_AUTH_BASE}

# Copy file cấu hình workspace trước để cache dependency layer
COPY package.json yarn.lock ./
COPY packages ./packages

RUN yarn install --ignore-engines --frozen-lockfile --production=false

# Copy phần còn lại và build
COPY . .
RUN yarn build

## ---------- Runtime stage ----------
FROM gcr.io/distroless/nodejs20 AS prod
WORKDIR /app

ARG NUXT_PUBLIC_API_BASE
ARG NUXT_PUBLIC_BASE_URL
ARG NUXT_PUBLIC_API_PREFIX
ARG NUXT_PUBLIC_AUTH_BASE

ENV NUXT_TELEMETRY_DISABLED=1
ENV NUXT_PUBLIC_API_BASE=${NUXT_PUBLIC_API_BASE}
ENV NUXT_PUBLIC_BASE_URL=${NUXT_PUBLIC_BASE_URL}
ENV NUXT_PUBLIC_API_PREFIX=${NUXT_PUBLIC_API_PREFIX}
ENV NUXT_PUBLIC_AUTH_BASE=${NUXT_PUBLIC_AUTH_BASE}

COPY --from=build /app/.output /app/.output

EXPOSE 3000

CMD ["/app/.output/server/index.mjs"]