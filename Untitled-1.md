# File Tree: Posting

**Generated:** 9/4/2026, 8:16:11 AM
**Root Path:** `c:\Users\CARL\Desktop\Posting`

```
├── 📁 .devcontainer
│   └── ⚙️ devcontainer.json
├── 📁 .github
│   └── 📁 workflows
│       ├── ⚙️ action.yml
│       ├── ⚙️ deploy-development.yml
│       ├── ⚙️ deploy-production.yml
│       └── ⚙️ deploy-staging.yml
├── 📁 .husky
│   ├── 📁 _
│   │   ├── ⚙️ .gitignore
│   │   ├── 📄 applypatch-msg
│   │   ├── 📄 commit-msg
│   │   ├── 📄 h
│   │   ├── 📄 husky.sh
│   │   ├── 📄 post-applypatch
│   │   ├── 📄 post-checkout
│   │   ├── 📄 post-commit
│   │   ├── 📄 post-merge
│   │   ├── 📄 post-rewrite
│   │   ├── 📄 pre-applypatch
│   │   ├── 📄 pre-auto-gc
│   │   ├── 📄 pre-commit
│   │   ├── 📄 pre-merge-commit
│   │   ├── 📄 pre-push
│   │   ├── 📄 pre-rebase
│   │   └── 📄 prepare-commit-msg
│   └── 📄 pre-commit
├── 📁 backend
│   ├── 📁 docker
│   │   └── 📄 entrypoint.sh
│   ├── 📁 prisma
│   │   ├── 📁 migrations
│   │   │   ├── 📁 20260903000000_init
│   │   │   │   └── 📄 migration.sql
│   │   │   ├── 📁 20260903120000_add_users
│   │   │   │   └── 📄 migration.sql
│   │   │   ├── 📁 20260903130000_add_user_roles
│   │   │   │   └── 📄 migration.sql
│   │   │   ├── 📁 20260903140000_facebook_social_accounts
│   │   │   │   └── 📄 migration.sql
│   │   │   ├── 📁 20260904080000_scheduling_team_audit
│   │   │   │   └── 📄 migration.sql
│   │   │   └── ⚙️ migration_lock.toml
│   │   ├── 📄 schema.prisma
│   │   └── 📄 seed.ts
│   ├── 📁 src
│   │   ├── 📁 config
│   │   │   └── 📄 env.ts
│   │   ├── 📁 lib
│   │   │   ├── 📄 audit.ts
│   │   │   ├── 📄 facebook-oauth-state.ts
│   │   │   ├── 📄 instagram-login.ts
│   │   │   ├── 📄 jwt.ts
│   │   │   ├── 📄 mappers.ts
│   │   │   ├── 📄 media-store.ts
│   │   │   ├── 📄 meta-graph.ts
│   │   │   ├── 📄 password.ts
│   │   │   ├── 📄 post-scheduler.ts
│   │   │   ├── 📄 prisma.ts
│   │   │   ├── 📄 token-crypto.ts
│   │   │   └── 📄 user-mapper.ts
│   │   ├── 📁 middleware
│   │   │   ├── 📄 auth.ts
│   │   │   ├── 📄 facebook-image-upload.ts
│   │   │   └── 📄 require-main-admin.ts
│   │   ├── 📁 routes
│   │   │   ├── 📄 accounts.ts
│   │   │   ├── 📄 auth.ts
│   │   │   ├── 📄 health.ts
│   │   │   ├── 📄 media.ts
│   │   │   ├── 📄 posts.ts
│   │   │   ├── 📄 social-facebook.ts
│   │   │   ├── 📄 social-instagram.ts
│   │   │   └── 📄 users.ts
│   │   ├── 📁 schemas
│   │   │   ├── 📄 auth.ts
│   │   │   ├── 📄 facebook.ts
│   │   │   ├── 📄 instagram.ts
│   │   │   ├── 📄 posting.ts
│   │   │   └── 📄 users.ts
│   │   ├── 📄 app.ts
│   │   └── 📄 index.ts
│   ├── ⚙️ .dockerignore
│   ├── ⚙️ .env.example
│   ├── ⚙️ .gitignore
│   ├── 🐳 Dockerfile
│   ├── 📝 META_FACEBOOK.md
│   ├── 📝 README.md
│   ├── ⚙️ package-lock.json
│   ├── ⚙️ package.json
│   └── ⚙️ tsconfig.json
├── 📁 docker
│   ├── 📁 nginx
│   │   └── ⚙️ nginx.conf
│   └── 📁 node
│       └── 📄 npm-token.txt
├── 📁 public
│   ├── 🖼️ favicon.svg
│   └── 🌐 silent-check-sso.html
├── 📁 src
│   ├── 📁 app
│   │   ├── 📁 routes
│   │   │   ├── 📁 auth
│   │   │   │   ├── 📄 index.ts
│   │   │   │   └── 📄 login.tsx
│   │   │   ├── 📁 dashboard
│   │   │   │   ├── 📄 dashboard.tsx
│   │   │   │   └── 📄 index.ts
│   │   │   ├── 📁 posting
│   │   │   │   ├── 📄 connected-accounts.tsx
│   │   │   │   ├── 📄 create-post.tsx
│   │   │   │   ├── 📄 index.ts
│   │   │   │   ├── 📄 post-history.tsx
│   │   │   │   ├── 📄 scheduled-posts.tsx
│   │   │   │   └── 📄 user-accounts.tsx
│   │   │   └── 📄 root.tsx
│   │   ├── 📄 index.tsx
│   │   ├── 📄 provider.tsx
│   │   └── 📄 router.tsx
│   ├── 📁 assets
│   │   ├── 🖼️ jac-liner-logo.svg
│   │   └── 🖼️ react.svg
│   ├── 📁 components
│   │   ├── 📁 errors
│   │   │   ├── 📄 index.ts
│   │   │   └── 📄 main.tsx
│   │   ├── 📁 layout
│   │   │   ├── 📁 center-layout
│   │   │   │   ├── 📄 center-layout.tsx
│   │   │   │   └── 📄 index.ts
│   │   │   ├── 📁 content-layout
│   │   │   │   ├── 📄 content-layout.tsx
│   │   │   │   └── 📄 index.ts
│   │   │   ├── 📁 content-section
│   │   │   │   ├── 📄 content-section.tsx
│   │   │   │   └── 📄 index.ts
│   │   │   ├── 📁 dashboard-layout
│   │   │   │   ├── 📄 dashboard-layout.tsx
│   │   │   │   └── 📄 index.ts
│   │   │   ├── 📁 public-layout
│   │   │   │   ├── 📄 index.ts
│   │   │   │   └── 📄 public-layout.tsx
│   │   │   └── 📄 index.ts
│   │   ├── 📁 seo
│   │   │   ├── 📄 head.tsx
│   │   │   └── 📄 index.ts
│   │   └── 📁 ui
│   │       ├── 📁 notification-menu
│   │       │   ├── 📄 index.ts
│   │       │   ├── 📄 notification-menu.tsx
│   │       │   └── 📄 types.ts
│   │       ├── 📁 page-not-found
│   │       │   ├── 📄 index.ts
│   │       │   └── 📄 page-not-found.tsx
│   │       ├── 📁 pwa-badge
│   │       │   ├── 📄 index.ts
│   │       │   └── 📄 pwa-badge.tsx
│   │       ├── 📁 user-menu
│   │       │   ├── 📄 index.ts
│   │       │   └── 📄 user-menu.tsx
│   │       └── 📄 index.ts
│   ├── 📁 config
│   │   ├── 📄 env.ts
│   │   └── 📄 paths.ts
│   ├── 📁 features
│   │   ├── 📁 auth
│   │   │   ├── 📁 components
│   │   │   │   └── 📁 auth-card
│   │   │   │       ├── 📄 auth-card.tsx
│   │   │   │       └── 📄 index.ts
│   │   │   └── 📄 index.ts
│   │   ├── 📁 posting
│   │   │   ├── 📁 api
│   │   │   │   ├── 📄 index.ts
│   │   │   │   ├── 📄 query-keys.ts
│   │   │   │   ├── 📄 use-connect-facebook.ts
│   │   │   │   ├── 📄 use-connect-instagram.ts
│   │   │   │   ├── 📄 use-connected-accounts.ts
│   │   │   │   ├── 📄 use-disconnect-facebook-page.ts
│   │   │   │   ├── 📄 use-disconnect-instagram-account.ts
│   │   │   │   ├── 📄 use-facebook-pages.ts
│   │   │   │   ├── 📄 use-facebook-post-engagement.ts
│   │   │   │   ├── 📄 use-facebook-posts.ts
│   │   │   │   ├── 📄 use-instagram-accounts.ts
│   │   │   │   ├── 📄 use-instagram-post-engagement.ts
│   │   │   │   ├── 📄 use-instagram-posts.ts
│   │   │   │   ├── 📄 use-publish-facebook-post.ts
│   │   │   │   └── 📄 use-publish-instagram-post.ts
│   │   │   ├── 📁 components
│   │   │   │   ├── 📁 connected-accounts-list
│   │   │   │   │   ├── 📄 connected-accounts-list.tsx
│   │   │   │   │   └── 📄 index.ts
│   │   │   │   ├── 📁 create-post-form
│   │   │   │   │   ├── 📄 create-post-form.tsx
│   │   │   │   │   └── 📄 index.ts
│   │   │   │   ├── 📁 facebook-engagement-dialog
│   │   │   │   │   ├── 📄 facebook-engagement-dialog.tsx
│   │   │   │   │   └── 📄 index.ts
│   │   │   │   ├── 📁 facebook-pages-panel
│   │   │   │   │   ├── 📄 facebook-pages-panel.tsx
│   │   │   │   │   └── 📄 index.ts
│   │   │   │   ├── 📁 instagram-accounts-panel
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   └── 📄 instagram-accounts-panel.tsx
│   │   │   │   ├── 📁 instagram-engagement-dialog
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   └── 📄 instagram-engagement-dialog.tsx
│   │   │   │   ├── 📁 platform-account-card
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   └── 📄 platform-account-card.tsx
│   │   │   │   ├── 📁 post-history-table
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   └── 📄 post-history-table.tsx
│   │   │   │   ├── 📁 post-preview
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   └── 📄 post-preview.tsx
│   │   │   │   ├── 📁 posting-layout
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   └── 📄 posting-layout.tsx
│   │   │   │   ├── 📁 posting-sidebar
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   └── 📄 posting-sidebar.tsx
│   │   │   │   ├── 📁 posting-top-nav
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   └── 📄 posting-top-nav.tsx
│   │   │   │   ├── 📁 scheduled-posts-table
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   └── 📄 scheduled-posts-table.tsx
│   │   │   │   ├── 📄 mock-posting-data.ts
│   │   │   │   └── 📄 platform-utils.ts
│   │   │   ├── 📄 constants.ts
│   │   │   ├── 📄 index.ts
│   │   │   └── 📄 types.ts
│   │   └── 📁 users
│   │       ├── 📁 api
│   │       │   ├── 📄 index.ts
│   │       │   ├── 📄 query-keys.ts
│   │       │   ├── 📄 use-create-user.ts
│   │       │   ├── 📄 use-delete-user.ts
│   │       │   ├── 📄 use-list-users.ts
│   │       │   └── 📄 use-update-user.ts
│   │       ├── 📁 components
│   │       │   ├── 📁 user-form-dialog
│   │       │   │   ├── 📄 index.ts
│   │       │   │   ├── 📄 schemas.ts
│   │       │   │   └── 📄 user-form-dialog.tsx
│   │       │   └── 📁 users-table
│   │       │       ├── 📄 index.ts
│   │       │       └── 📄 users-table.tsx
│   │       ├── 📁 lib
│   │       │   └── 📄 get-api-error-message.ts
│   │       ├── 📄 constants.ts
│   │       └── 📄 index.ts
│   ├── 📁 hooks
│   │   └── 📄 use-disclosure.ts
│   ├── 📁 lib
│   │   ├── 📁 auth
│   │   │   ├── 📄 api.ts
│   │   │   ├── 📄 context.tsx
│   │   │   ├── 📄 dev-provider.tsx
│   │   │   ├── 📄 hooks.ts
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 provider.tsx
│   │   │   ├── 📄 schemas.ts
│   │   │   ├── 📄 token-storage.ts
│   │   │   └── 📄 types.ts
│   │   ├── 📁 keycloak
│   │   │   ├── 📄 constants.ts
│   │   │   ├── 📄 context.ts
│   │   │   ├── 📄 dev-provider.tsx
│   │   │   ├── 📄 hooks.ts
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 keycloak.ts
│   │   │   ├── 📄 logout-to-login.ts
│   │   │   ├── 📄 provider.tsx
│   │   │   ├── 📄 schema.ts
│   │   │   ├── 📄 session-constants.ts
│   │   │   └── 📄 use-session-lifecycle.ts
│   │   ├── 📁 mui
│   │   │   ├── 📁 providers
│   │   │   │   ├── 📄 confirm-provider.tsx
│   │   │   │   ├── 📄 index.ts
│   │   │   │   ├── 📄 snackbar-provider.tsx
│   │   │   │   └── 📄 theme-provider.tsx
│   │   │   ├── 📁 theme
│   │   │   │   ├── 📄 base-theme.ts
│   │   │   │   ├── 📄 dark-theme.ts
│   │   │   │   ├── 📄 index.ts
│   │   │   │   └── 📄 light-theme.ts
│   │   │   ├── 📄 confirm-hooks.ts
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 provider.tsx
│   │   │   ├── 📄 snackbar-context.tsx
│   │   │   ├── 📄 snackbar-hooks.ts
│   │   │   ├── 📄 theme-context.tsx
│   │   │   └── 📄 theme-hooks.ts
│   │   ├── 📁 schemas
│   │   │   ├── 📄 data-response.ts
│   │   │   ├── 📄 index.ts
│   │   │   └── 📄 paginated-response.ts
│   │   ├── 📄 api-client.ts
│   │   ├── 📄 openapi-client.ts
│   │   └── 📄 react-query.ts
│   ├── 📁 types
│   │   ├── 📄 common.ts
│   │   └── 📄 index.ts
│   ├── 🎨 index.css
│   ├── 📄 main.tsx
│   └── 📄 vite-env.d.ts
├── ⚙️ .dockerignore
├── ⚙️ .editorconfig
├── ⚙️ .env.example
├── ⚙️ .gitattributes
├── ⚙️ .gitignore
├── ⚙️ .npmrc
├── ⚙️ .prettierignore
├── ⚙️ .prettierrc
├── 📝 AGENTS.md
├── 🐳 Dockerfile
├── 📝 README.md
├── ⚙️ docker-compose.yml
├── 📄 eslint.config.js
├── 🌐 index.html
├── ⚙️ package.json
├── ⚙️ pnpm-lock.yaml
├── ⚙️ pnpm-workspace.yaml
├── 📄 pwa-assets.config.ts
├── ⚙️ tsconfig.app.json
├── ⚙️ tsconfig.json
├── ⚙️ tsconfig.node.json
└── 📄 vite.config.ts
```

---
*Generated by FileTree Pro Extension*