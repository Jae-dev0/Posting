FROM node:22-bookworm AS base

FROM base AS deps
WORKDIR /app

RUN apt-get update && apt-get install --no-install-recommends --yes libvips-dev && rm -rf /var/lib/apt/lists/*

COPY .npmrc .
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
RUN --mount=type=secret,id=npm-token \
  if [ -s /run/secrets/npm-token ]; then \
    printf '\n//npm.pkg.github.com/:_authToken=%s\n' "$(tr -d '\n' < /run/secrets/npm-token)" >> .npmrc; \
  fi && \
  corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app

ARG VITE_APP_API_URL=
ARG VITE_APP_KEYCLOAK_URL=http://localhost:8080
ARG VITE_APP_KEYCLOAK_REALM=master
ARG VITE_APP_KEYCLOAK_CLIENT_ID=dev-client
ARG VITE_APP_AUTH_BYPASS=false

ENV VITE_APP_API_URL=$VITE_APP_API_URL
ENV VITE_APP_KEYCLOAK_URL=$VITE_APP_KEYCLOAK_URL
ENV VITE_APP_KEYCLOAK_REALM=$VITE_APP_KEYCLOAK_REALM
ENV VITE_APP_KEYCLOAK_CLIENT_ID=$VITE_APP_KEYCLOAK_CLIENT_ID
ENV VITE_APP_AUTH_BYPASS=$VITE_APP_AUTH_BYPASS

COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html ./
COPY public ./public
COPY src ./src

RUN corepack enable pnpm && pnpm run build

FROM nginx:1.28-alpine-slim
WORKDIR /usr/share/nginx/html

COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
