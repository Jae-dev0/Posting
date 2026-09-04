# Meta / Facebook Graph API setup

This CMS integrates with the **Meta Graph API** for Facebook Page connect, publish, and engagement.

Default API version: **`v22.0`** (override with `META_GRAPH_API_VERSION`).

## Fix "(#200) The permission(s) pages_manage_posts are not available"

This happens when you **connected** without `pages_manage_posts`, then tried to **publish**.

Do this in order:

1. Meta → **Use cases** → **Manage everything on your Page** → **Customize**
2. Set `pages_manage_posts` to **Ready for testing** (and ideally `pages_read_user_content` too)
3. Update env:

```env
META_OAUTH_SCOPES=public_profile,pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content
```

4. Restart/rebuild the API (`docker compose up -d --build api`)
5. In the CMS: **Disconnect** the Page, then **Connect Facebook** again (old tokens lack the permission)
6. Publish again

App Review is only required for **Live** mode / non-tester users. In **Development** mode, admins/developers/testers can use Ready-for-testing permissions without review.

## Fix "Invalid Scopes: pages_manage_posts, pages_read_user_content"

Meta only accepts scopes that are **Ready for testing** on your app.

1. Meta app dashboard → **Use cases**
2. Add / open **Manage everything on your Page** (or similar Pages management use case)
3. **Customize** → **Permissions and features**
4. Add each permission until status is **Ready for testing**:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts` (required to publish)
   - `pages_read_user_content` (required for comment text)
   - `public_profile`
5. Then set in `backend/.env`:

```env
META_OAUTH_SCOPES=public_profile,pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content
```

6. Restart the API and try **Connect Facebook** again.

If your app was created as a **Consumer** type, Page permissions may never appear — create a **Business** app (or remove the app type under App Review) so `pages_*` permissions are available.

Default scopes (without publish) are safer for first login:

```env
META_OAUTH_SCOPES=public_profile,pages_show_list,pages_read_engagement
```

## Environment variables (API only)

Never put `META_APP_SECRET` or Page access tokens in Vite/`VITE_APP_*` client env.

Put Meta vars in **`backend/.env`** when running `npm run dev` in `backend/`.  
Root `.env` is used by Docker Compose for the `api` service.

| Variable | Purpose |
|----------|---------|
| `META_APP_ID` | Meta App ID |
| `META_APP_SECRET` | Meta App Secret (server only) |
| `META_REDIRECT_URI` | Must match Meta Dashboard exactly, e.g. `http://localhost:3001/api/social/facebook/callback` |
| `META_GRAPH_API_VERSION` | e.g. `v22.0` |
| `META_OAUTH_SCOPES` | Comma-separated scopes (must be Ready for testing) |
| `META_INSTAGRAM_APP_ID` | Instagram app ID from Instagram API setup (not Facebook App ID) |
| `META_INSTAGRAM_APP_SECRET` | Instagram app secret (server only) |
| `META_INSTAGRAM_REDIRECT_URI` | e.g. `http://localhost:3001/api/social/instagram/callback` |
| `META_INSTAGRAM_OAUTH_SCOPES` | `instagram_business_*` scopes matching Meta Instagram setup |
| `PUBLIC_API_BASE_URL` | Public HTTPS base for Instagram local uploads (e.g. ngrok). Meta cannot fetch localhost. |
| `FRONTEND_URL` | Where OAuth redirects after callback, e.g. `http://localhost:5173` |
| `TOKEN_ENCRYPTION_KEY` | Optional 64-char hex (32 bytes). If omitted, derived from `JWT_SECRET` (dev only). |

## Meta Developer Dashboard steps

1. Create an app at [developers.facebook.com](https://developers.facebook.com/) — prefer **Business** type for Page APIs.
2. Add **Facebook Login for Business** (or Facebook Login).
3. **App settings → Basic**: copy App ID and App Secret into API env.
4. **Facebook Login for Business → Settings**:
   - Valid OAuth Redirect URIs: your `META_REDIRECT_URI`
   - Client OAuth login: Yes
   - Web OAuth login: Yes
5. Enable Page permissions under **Use cases** (see section above).
6. Restart the API after setting env vars.

| Permission | Used for | App Review (Live) |
|------------|----------|-------------------|
| `pages_show_list` | List Pages the user manages | Often needed for Live |
| `pages_manage_posts` | Publish to Page feed / photos | **Required** for Live |
| `pages_read_engagement` | Reactions / comment counts | **Required** for Live |
| `pages_read_user_content` | Read comment text | **Required** for Live |
| `public_profile` | Basic user identity | Standard Login |

**Development mode:** app admins/developers/testers can use Ready-for-testing permissions without full App Review.

## OAuth + publish flow

1. CMS user clicks **Connect Facebook**.
2. `POST /api/social/facebook/connect` returns `authUrl` (App Secret never sent to browser).
3. User authorizes; Meta redirects to `GET /api/social/facebook/callback`.
4. API exchanges code → long-lived user token → `/me/accounts` Page tokens.
5. Page tokens are **encrypted** and stored on `social_accounts` (company-scoped).
6. `POST /api/social/facebook/publish` publishes via Graph.
7. `GET /api/social/facebook/posts/:id/engagement` loads reactions/comments.

## API endpoints

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/social/facebook/connect` | JWT |
| GET | `/api/social/facebook/callback` | OAuth `state` JWT |
| GET | `/api/social/facebook/pages` | JWT + company scope |
| DELETE | `/api/social/facebook/pages/:id` | JWT + company scope |
| POST | `/api/social/facebook/publish` | JWT + company scope |
| GET | `/api/social/facebook/posts` | JWT + company scope |
| GET | `/api/social/facebook/posts/:id/engagement` | JWT + company scope |

## Local notes

- Local image files (JPEG/PNG/GIF/WebP, max 10 MB) are uploaded as multipart `image` to `POST /api/social/facebook/publish` and forwarded to Meta `/{page-id}/photos`.
- Browser `blob:` URLs are only for preview — the real file bytes go through the API.
- Restart the API after any `.env` change.
- Multi-company isolation: social accounts/posts are filtered by `req.user.companyId`.

---

# Instagram via Facebook Login

Use **API setup with Facebook login** in Meta (not Instagram Login).

## Scopes (match Use cases → Manage content on Instagram)

```env
META_INSTAGRAM_OAUTH_SCOPES=instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,business_management,public_profile
```

Important: OAuth scope is `instagram_content_publish` (no **-ing**). The Meta UI label may say “publishing.”

## Flow

1. CMS → **Connect Instagram**
2. Facebook OAuth (same Meta app / redirect as Facebook Pages)
3. API stores IG Business accounts linked to Pages you manage
4. Publish uses Page access token → `graph.facebook.com` media container → publish

## Prerequisites

1. Instagram Professional account linked to a Facebook Page
2. Permissions Ready for testing under Instagram API → API setup with Facebook login
3. Restart API after env changes → Connect Instagram again

## Publish constraints

- Needs a public image URL (Meta cannot fetch localhost)
- Set `PUBLIC_API_BASE_URL` (ngrok) for local uploads, or paste a public https URL
