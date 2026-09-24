# Posting API

Express + Prisma + PostgreSQL backend for the Social Media Publisher UI.

## Stack

- Node.js 22
- Express 5
- Prisma ORM
- PostgreSQL 16 (Docker)

## Auth

<<<<<<< HEAD
| Method | Path              | Description                 |
| ------ | ----------------- | --------------------------- |
| POST   | `/api/auth/login` | Sign in                     |
| GET    | `/api/auth/me`    | Current user (Bearer token) |

Seeded admins (after seed):

| Role            | Email                 | Password      | Area               |
| --------------- | --------------------- | ------------- | ------------------ |
| Super Admin     | `admin@admin.com`     | `password123` | Overall / Platform |
| CMS Admin       | `admin@cms.com`       | `password123` | Website CMS        |
| Marketing Admin | `admin@marketing.com` | `password123` | Marketing          |

Marketing Admin can manage connected accounts and Marketing users.
=======
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Current user (Bearer token) |

Seeded users (after seed):

| Role | Email | Password |
|------|-------|----------|
| Main admin | `mainadmin@posting.local` | `password123` |
| Admin | `admin@posting.local` | `password123` |

Main admins can manage connected accounts and app users; admins cannot.
>>>>>>> origin/main

Facebook / Meta Graph setup: see [`META_FACEBOOK.md`](./META_FACEBOOK.md).

## API

<<<<<<< HEAD
| Method | Path                                            | Description                                   |
| ------ | ----------------------------------------------- | --------------------------------------------- |
| GET    | `/api/health`                                   | Health + DB check                             |
| GET    | `/api/users`                                    | List app users (main admin)                   |
| POST   | `/api/users`                                    | Create app user (main admin)                  |
| PATCH  | `/api/users/:id`                                | Update app user (main admin)                  |
| DELETE | `/api/users/:id`                                | Delete app user (main admin)                  |
| POST   | `/api/social/facebook/connect`                  | Start Facebook OAuth                          |
| GET    | `/api/social/facebook/callback`                 | OAuth redirect callback                       |
| GET    | `/api/social/facebook/pages`                    | List connected Facebook Pages                 |
| DELETE | `/api/social/facebook/pages/:id`                | Disconnect Page                               |
| POST   | `/api/social/facebook/publish`                  | Publish to a Page                             |
| GET    | `/api/social/facebook/posts`                    | List Facebook CMS posts                       |
| GET    | `/api/social/facebook/posts/:id/engagement`     | Reactions / comments                          |
| POST   | `/api/social/tiktok/connect`                    | Start TikTok Login Kit OAuth                  |
| GET    | `/api/social/tiktok/callback`                   | TikTok OAuth redirect callback                |
| GET    | `/api/social/tiktok/accounts`                   | List connected TikTok accounts                |
| DELETE | `/api/social/tiktok/accounts/:id`               | Revoke and disconnect TikTok                  |
| POST   | `/api/social/tiktok/publish`                    | Direct Post a video (private until app audit) |
| GET    | `/api/accounts`                                 | List connected accounts                       |
| POST   | `/api/accounts`                                 | Create account                                |
| PATCH  | `/api/accounts/:id`                             | Update account                                |
| GET    | `/api/posts?status=published\|scheduled\|draft` | List posts                                    |
| GET    | `/api/posts/:id`                                | Get post                                      |
| POST   | `/api/posts`                                    | Create / publish / schedule / draft           |
| DELETE | `/api/posts/:id`                                | Delete post                                   |
=======
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health + DB check |
| GET | `/api/users` | List app users (main admin) |
| POST | `/api/users` | Create app user (main admin) |
| PATCH | `/api/users/:id` | Update app user (main admin) |
| DELETE | `/api/users/:id` | Delete app user (main admin) |
| POST | `/api/social/facebook/connect` | Start Facebook OAuth |
| GET | `/api/social/facebook/callback` | OAuth redirect callback |
| GET | `/api/social/facebook/pages` | List connected Facebook Pages |
| DELETE | `/api/social/facebook/pages/:id` | Disconnect Page |
| POST | `/api/social/facebook/publish` | Publish to a Page |
| GET | `/api/social/facebook/posts` | List Facebook CMS posts |
| GET | `/api/social/facebook/posts/:id/engagement` | Reactions / comments |
| GET | `/api/accounts` | List connected accounts |
| POST | `/api/accounts` | Create account |
| PATCH | `/api/accounts/:id` | Update account |
| GET | `/api/posts?status=published\|scheduled\|draft` | List posts |
| GET | `/api/posts/:id` | Get post |
| POST | `/api/posts` | Create / publish / schedule / draft |
| DELETE | `/api/posts/:id` | Delete post |
>>>>>>> origin/main

## Local (Docker)

From the repo root:

```bash
docker compose up --build db api
```

- API: http://localhost:3001
- Postgres: `localhost:5432` (user/pass/db: `posting`)

## Local (without Docker for API)

```bash
# start only Postgres
docker compose up -d db

cd backend
cp .env.example .env
pnpm install
pnpm prisma:generate
pnpm prisma:migrate:dev
pnpm prisma:seed
pnpm dev
```
