FROM node:22-bookworm AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy .npmrc
COPY .npmrc .

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN --mount=type=secret,id=npm-token \
  printf '\n//npm.pkg.github.com/:_authToken=%s\n' "$(cat /run/secrets/npm-token | tr -d '\n')" >> .npmrc && \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi
  
# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN \
    if [ -f yarn.lock ]; then yarn run build; \
    elif [ -f package-lock.json ]; then npm run build; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Production image, copy build files and run nginx
FROM nginx:1.28-alpine-slim
WORKDIR /usr/share/nginx/html

COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
