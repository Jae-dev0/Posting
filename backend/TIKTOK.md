# TikTok Content Posting API setup

The API uses TikTok Login Kit for account authorization and the Content Posting
API for Direct Post video publishing. Client secrets and user tokens never reach
the browser; access and refresh tokens are encrypted in `social_accounts`.

## TikTok developer portal

1. Add **Login Kit** and **Content Posting API** to the TikTok app.
2. Register the exact HTTPS callback configured as `TIKTOK_REDIRECT_URI`, for
   example `https://api.example.com/api/social/tiktok/callback`.
3. Request approval for `video.publish`. The app also requests
   `user.info.basic` to label the connected account.
4. Verify the public domain or URL prefix that hosts scheduled-post videos.
   TikTok requires this when it pulls video from a URL.
5. Complete TikTok's audit before production launch. Direct Posts from an
   unaudited client are restricted to `SELF_ONLY` visibility.

TikTok calls its application identifier a **Client key**. Put it in
`TIKTOK_CLIENT_KEY`; put the Client secret in `TIKTOK_CLIENT_SECRET`.

## Environment

```dotenv
TIKTOK_CLIENT_KEY=your-client-key
TIKTOK_CLIENT_SECRET=your-client-secret
TIKTOK_REDIRECT_URI=https://api.example.com/api/social/tiktok/callback
TIKTOK_OAUTH_SCOPES=user.info.basic,video.publish
```

For Docker Compose, set these in the repository `.env`. For direct backend
development, provide them in the backend process environment. Never prefix them
with `VITE_APP_`.

Apply the database migration before connecting an account:

```sh
pnpm --dir backend prisma:migrate
```

Then open **Posting → Connected Accounts → Connect TikTok**. Immediate posts
accept an MP4 upload from the composer. Scheduled posts use TikTok's
`PULL_FROM_URL` flow, so their public media URL must be served from the verified
domain or URL prefix.
