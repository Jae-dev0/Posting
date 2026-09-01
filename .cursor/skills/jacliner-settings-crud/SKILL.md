---
name: jacliner-settings-crud
description: Scaffold a settings lookup CRUD module — list page, filters, table, form dialog, and API hooks. Use when adding a settings module, lookup table, or admin CRUD screen in Jacliner React + Vite + MUI apps.
---

# Jacliner settings CRUD

Use when the user asks to add a settings module, lookup table, or CRUD admin screen under `src/features/settings/` (or similar settings area).

## Before coding

1. Check `package.json` for `@jacliner/*-api-ts-client` and identify the list/create/update/delete API methods.
2. Check if `@/components/layout` exports `EntityListPage` and `PagedTableCard`. If not, use manual `ContentLayout` + `ListPageToolbar` + `PagedTableCard` composition.
3. Follow `.cursor/rules/jacliner-api-client-patterns.mdc`, `api-query-hooks-patterns.mdc`, and `api-mutation-hooks-patterns.mdc`.

## Folder structure

```
src/features/settings/<group>/<entity>/
├── api/
│   ├── use-list-<entities>.ts
│   ├── use-create-<entities>.ts
│   ├── use-update-<entities>.ts
│   ├── use-delete-<entities>.ts   # when API supports delete
│   └── index.ts
├── components/
│   ├── <entity>-filters.tsx
│   ├── <entity>-tables/
│   │   ├── <entity>-tables.tsx
│   │   ├── <entity>-loading-skeletons.tsx
│   │   └── index.ts
│   ├── <entity>-form-dialogs/
│   │   ├── <entity>-form-dialogs.tsx
│   │   ├── schemas.ts
│   │   └── index.ts
│   └── index.ts
└── index.ts
```

Route page lives under `src/app/routes/settings/...` — not inside the feature folder.

## Page layout — EntityListPage + in-card filters

Use `EntityListPage` for the page shell. **Place filters inside `PagedTableCard`**, not in `EntityListPage`'s `filters` prop.

```tsx
<EntityListPage
  layoutTitle="Brand Lists"
  toolbarTitle="Brand Lists"
  toolbarDescription={
    <ListPageShowingCount count={totalItems}>
      brands available.
    </ListPageShowingCount>
  }
  toolbarPrimaryAction={{
    label: 'New Brand',
    onClick: handleOpenAddDialog,
    startIcon: <ListPagePrimaryAddIcon />,
  }}
  pagedTable={
    <PagedTableCard
      count={totalItems}
      page={currentPage}
      rowsPerPage={rowsPerPage}
      onPageChange={(_, page) =>
        setPagination((prev) => ({ ...prev, page: page + 1 }))
      }
      onRowsPerPageChange={(e) => {
        setPagination((prev) => ({
          ...prev,
          page: 1,
          perPage: parseInt(e.target.value),
        }))
      }}
    >
      <BrandFilters
        filters={{ q: search, filter }}
        onFilterChange={handleFilterChange}
      />
      <BrandTables
        data={data}
        status={status}
        onEditItem={handleOpenEditDialog}
        onToggleStatus={handleToggleStatus}
      />
    </PagedTableCard>
  }
  footer={
    <BrandFormDialogs
      open={isDialogCreateOpen}
      onClose={handleCloseCreateDialog}
      brand={selectedItem}
    />
  }
/>
```

**Do not** pass filters via `EntityListPage.filters` — filters belong inside the card, above the table.

## Page state (route owns all data wiring)

| State                        | Purpose                                                  |
| ---------------------------- | -------------------------------------------------------- |
| `search` + `debouncedSearch` | `useDebouncedValue(search, { wait: 350 })` for `q` param |
| `filter`                     | API `filter` object                                      |
| `pagination`                 | `page`, `perPage`, `sort`                                |
| `isDialogCreateOpen`         | Create/edit dialog visibility                            |
| `selectedItem`               | Entity being edited (`undefined` for create)             |

Derive display values from query result:

```ts
const data = status === 'success' ? res.data : []
const totalItems = status === 'success' ? res.meta.total : 0
const currentPage = status === 'success' ? res.meta.current_page - 1 : 0
```

Use the API client's list request type for `QueryParams` (e.g. `SettingsFleetsApiListFleetMakesRequest`).

## Handlers checklist

- `handleOpenAddDialog` — clear `selectedItem`, open dialog
- `handleOpenEditDialog(item)` — set `selectedItem`, open dialog
- `handleCloseCreateDialog` — close dialog, clear `selectedItem`
- `handleFilterChange` — merge `q`, `filter`, and pagination from filter component
- `handleToggleStatus` (when applicable) — call `useUpdate*` with toggled `is_active`

## Table and filter components

- **Filters**: presentational; accept `filters` + `onFilterChange`; no internal `useQuery`.
- **Tables**: accept `data`, `status`, and action callbacks; handle `pending` / `error` / `success` per `react-query-status-handling.mdc`.
- **Loading skeletons**: separate file in `<entity>-tables/`.

## Route wiring

- Register route in `src/app/` using `paths` from `@/config/paths` (`config-patterns.mdc`).
- Import feature exports from `@/features/settings/<group>/<entity>`.

## Form dialogs

For create/edit dialog implementation, follow the `jacliner-form-dialog` skill.

## Output

When done, summarize: feature path, route path, API hooks created, and any env or `paths` entries the user must verify.
