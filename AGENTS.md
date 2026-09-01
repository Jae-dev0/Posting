# Agent instructions — Jacliner frontend app

> **Single copy for all Jacliner React + Vite repos.**  
> Edit **`react-ts-vite-template/AGENTS.md` first**, then copy **`.cursor/`** and this file **as-is** into every app repo.

This project's Baseline target is **Baseline 2024**.

## Development

- **Node.js** v22+ (`engines` in `package.json`)
- **Package manager:** pnpm (`packageManager` in `package.json`)
- **Dev:** `pnpm dev` → http://localhost:5173
- **Build:** `pnpm build` (TypeScript project build + Vite → `dist/`)
- **Lint / format:** `pnpm run lint`, `pnpm run format` (Prettier via lint-staged on commit)
- **Preview:** `pnpm preview`
- **Docker (optional):** `docker-compose up --build -d` / `docker-compose down`
- **VS Code Dev Containers (optional):** reopen in container for a preconfigured environment
- Copy `.env.example` → `.env` and set `VITE_APP_*` before local run; use `env` from `@/config/env` — not `import.meta.env` in feature code

## Stack

- React 19, TypeScript, Vite
- MUI 7 (Emotion) — prefer platform-native HTML/CSS when Modern Web Guidance recommends them for **new** work; stay consistent with existing MUI when editing current screens
- React Router 7 — route paths via `paths` in `@/config/paths` (no hardcoded URL strings)
- TanStack React Query — configured in `src/app/` providers; follow `.cursor/rules/api-query-hooks-patterns.mdc`, `api-mutation-hooks-patterns.mdc`, and `react-query-status-handling.mdc`
- Axios, Zod, React Hook Form + `@hookform/resolvers`
- Keycloak (`keycloak-js`); `VITE_APP_AUTH_BYPASS=true` is dev-only
- API clients: use `@jacliner/*-api-ts-client` from `package.json` when this app has a generated client (see `jacliner-api-client-patterns.mdc`)

## Codebase layout

- `@/*` → `src/*` (see `tsconfig.app.json`)
- `src/app/` — routes, app shell, providers
- `src/components/` — shared UI (`ui/`) and layout
- `src/features/` — feature modules
- `src/config/` — validated `env`, centralized `paths`
- `src/lib/` — API client, Keycloak, MUI theme, React Query setup
- `src/types/`, `src/constants/` — shared types and constants when needed
- Named exports; kebab-case file names; feature barrels (`index.ts`); UI in `component-name/component-name.tsx` + `index.ts` re-export

## Cursor rules (`.cursor/rules/`)

Copy the whole `rules/` folder from the template when updating. Rules apply by **description + globs** (not all are always-on).

| Rule                                  | When it applies                                 |
| ------------------------------------- | ----------------------------------------------- |
| `config-patterns.mdc`                 | Always — env vars and `paths`                   |
| `mock-data-patterns.mdc`              | `mock-*.ts`, feature routes — UI before backend |
| `jacliner-api-client-patterns.mdc`    | `api/` hooks, OpenAPI client, query keys        |
| `api-query-hooks-patterns.mdc`        | `src/features/**/api/**/*.ts` (queries)         |
| `api-mutation-hooks-patterns.mdc`     | `src/features/**/api/**/*.ts` (mutations)       |
| `keycloak-auth-patterns.mdc`          | Keycloak, providers, API token wiring           |
| `react-query-status-handling.mdc`     | TS/TSX — pending / error / success              |
| `reusable-component-patterns.mdc`     | `src/components/**`                             |
| `custom-hooks-patterns.mdc`           | `use-*.ts`, `hooks/`                            |
| `consistent-return-shape.mdc`         | TS/TSX component return shape                   |
| `destructure-single-object-props.mdc` | Always — readability                            |
| `no-magic-values.mdc`                 | TS/TSX — named literals                         |

## Cursor skills (`.cursor/skills/`)

| Skill                     | Purpose                                                              |
| ------------------------- | -------------------------------------------------------------------- |
| `jacliner-new-feature`    | Scaffold `src/features/<name>/` (mock vs API, route wiring)           |
| `jacliner-settings-crud`  | Settings lookup CRUD — list page, filters, table, form dialog, API   |
| `jacliner-form-dialog`    | Create/edit dialog — RHF + Zod + mutations + snackbar                |

**Global (your machine):** `modern-web-guidance` in `~/.cursor/skills/` — search/retrieve web platform guides.

## Project conventions

- Handle `pending`, `error`, and `success` explicitly (`Status` prop / query helpers)
- Validate API responses with Zod (`schema.parse`); centralize query keys per feature
- No backend yet → mocks + `mock-data-patterns.mdc`; backend ready → `api/` + Jacliner client rules
- Settings CRUD pages → `EntityListPage` shell with filters **inside** `PagedTableCard` (`jacliner-settings-crud` skill)

## Browser support

- [Baseline 2024](https://web.dev/baseline/) for interoperable features
- Follow Modern Web Guidance fallbacks for features not Widely available (progressive enhancement; conditional polyfills only when a guide requires them)
- No extra polyfills or libraries unless a guide or the user asks

## Modern Web Guidance

For HTML, CSS, client-side JS, accessibility, performance (LCP/INP), forms, dialogs, popovers, view transitions:

1. `npx.cmd -y modern-web-guidance@latest search "<task>"`
2. `npx.cmd -y modern-web-guidance@latest retrieve "<guide-id>"`
3. Implement using the guide; adapt to React + MUI in this repo
