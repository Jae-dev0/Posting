---
name: jacliner-new-feature
description: Scaffold a new Jacliner feature module (folders, barrel, mock data or api/, presentational components). Use when adding a feature area, screen, or settings module in React + Vite + MUI apps.
---

# Jacliner new feature scaffold

Use when the user asks to add a new feature, settings section, or module under `src/features/`.

## Which workflow?

| User intent | Follow |
|-------------|--------|
| Settings lookup / admin CRUD (list + filters + table + create/edit dialog) | `jacliner-settings-crud` skill |
| Create/edit form dialog only | `jacliner-form-dialog` skill |
| General feature (dashboard, operations, procurement, etc.) | This skill |
| No API client yet | `mock-data-patterns.mdc` below |

## Before coding

1. Check `package.json` for `@jacliner/*-api-ts-client`.
2. **Has client** → plan `api/` hooks (see `jacliner-api-client-patterns.mdc`, `api-query-hooks-patterns.mdc`, `api-mutation-hooks-patterns.mdc`).
3. **No client yet** → plan `mock-*.ts` + `Status` UI (see `mock-data-patterns.mdc`).

## Folder structure

```
src/features/<feature-name>/
├── components/
│   ├── <feature>-tables.tsx      # or main UI; props: data, status, handlers
│   ├── <feature>-filters.tsx
│   └── mock-<feature>-data.ts      # only if no API yet
├── api/                            # only when Jacliner client exists
│   ├── use-list-*.ts
│   ├── use-create-*.ts             # when mutations exist
│   └── index.ts
├── index.ts                        # barrel exports
└── types.ts                        # optional shared types
```

- `<feature-name>`: kebab-case, matches route/domain wording.
- Re-export public components and hooks from `index.ts`.

## Route wiring

- Add route in `src/app/` using `paths` from `@/config/paths` (see `config-patterns.mdc`).
- Page component lives under `src/app/routes/...`; it imports from `@/features/<feature-name>`.
- Page owns data: mocks + `status` **or** `useQuery` at page level — not inside deep presentational children.

## UI checklist

- MUI 7 + existing layout primitives (`ContentLayout`, `EntityListPage`, `PagedTableCard`, `ListPageToolbar` when present).
- Settings CRUD pages: use `EntityListPage` with filters **inside** `PagedTableCard` (see `jacliner-settings-crud` skill).
- Handle `pending`, `error`, `success` explicitly (`react-query-status-handling.mdc`).
- Named exports; kebab-case filenames (`reusable-component-patterns.mdc` for shared primitives only).

## Modern Web Guidance

For new UI behavior (dialogs, forms, motion), run MWG search/retrieve before implementing custom JS/CSS.

## Output

When done, summarize: paths created, mock vs API choice, which skill/workflow was followed, and what the user must add next (env, route registration, backend).
