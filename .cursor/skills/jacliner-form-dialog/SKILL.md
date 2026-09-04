---
name: jacliner-form-dialog
description: Create or edit a Jacliner form dialog with React Hook Form, Zod, and create/update mutations. Use when adding a create/edit dialog, form modal, or entity form in React + Vite + MUI apps.
---

# Jacliner form dialog

Use when the user asks to add a create/edit dialog, form modal, or entity form tied to API mutations.

## File layout

```
components/<entity>-form-dialogs/
├── <entity>-form-dialogs.tsx
├── schemas.ts
└── index.ts
```

## Schema (`schemas.ts`)

Co-locate Zod schema with the form; infer form values from schema:

```ts
import { z } from 'zod'

export const brandFormSchemas = z.object({
  name: z.string().min(1, 'Brand name is required'),
  is_active: z.boolean(),
})

export type BrandFormValues = z.infer<typeof brandFormSchemas>
```

## Component structure

### Props

```ts
export type BrandFormDialogProps = {
  open: boolean
  onClose: () => void
  brand?: Brands | null
  dialogProps?: Omit<DialogProps, 'open' | 'onClose'>
}
```

- `brand` (or entity prop) present → edit mode; absent → create mode.
- `isEditMode = Boolean(brand)`.

### Mutations with snackbar feedback

Wire `useCreate*` and `useUpdate*` at the top of the component. Handle success/error in hook options:

```ts
const { showSuccess, showError } = useSnackbar()

const { mutate: createBrand, isPending: isCreatePending } = useCreateBrands({
  onSuccess: (data) => {
    onClose()
    showSuccess(getSuccessMessage(data.name, 'created', 'Brand'))
  },
  onError: (error) => {
    showError(
      'Creation Failed!',
      getErrorMessage(error, 'Could not create brand. Try again.'),
    )
  },
})
```

Use `getSuccessMessage` and `getErrorMessage` from `@/utils`.

### Form setup

```ts
const emptyFormValues: BrandFormValues = { name: '', is_active: true }

const formValues = useMemo((): BrandFormValues => {
  if (!open) return emptyFormValues
  if (brand) {
    return {
      name: brand.name ?? '',
      is_active: brand.is_active ?? true,
    }
  }
  return emptyFormValues
}, [open, brand])

const {
  handleSubmit,
  control,
  reset,
  formState: { isDirty },
} = useForm<BrandFormValues>({
  mode: 'onChange',
  defaultValues: emptyFormValues,
  values: formValues,
  resolver: zodResolver(brandFormSchemas),
})
```

### Dialog as form

Use `Dialog` from `@/components/ui` with `paper.component: 'form'` and `onSubmit` on the paper slot:

```tsx
<Dialog
  fullWidth
  open={open}
  onClose={onClose}
  slotProps={{
    paper: {
      component: 'form',
      onSubmit: (e: React.FormEvent<HTMLDivElement>) => {
        e.preventDefault()
        void handleFormSubmit()
      },
    },
    transition: {
      onEntered: () => nameInputRef.current?.focus(),
      onExited: () => reset(emptyFormValues),
    },
  }}
>
  <FormDialogTitle title={title} subtitle={subtitle} onClose={onClose} />
  <DialogContent>...</DialogContent>
  <DialogActions>...</DialogActions>
</Dialog>
```

### Submit routing

```ts
const handleFormSubmit = handleSubmit((data) => {
  if (isEditMode) onUpdateSubmit(data)
  else onCreateSubmit(data)
})
```

### Actions

- **Cancel**: `variant="outlined"`, disabled while `isSubmitting`.
- **Submit**: `type="submit"`, `loading={isSubmitting}`, disabled when edit mode and `!isDirty`.
- Labels: `'Create Brand'` / `'Update Brand'` based on `isEditMode`.

## Field patterns

- Use `Controller` from `react-hook-form` for each field.
- Use `FormLabelText` for labels; mark required fields.
- First text input: `inputRef={nameInputRef}` for focus on open.
- Boolean status fields: `TextField select` with Active/Inactive menu items.

## Imports

```ts
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  FormDialogTitle,
  FormLabelText,
} from '@/components/ui'
import { useSnackbar } from '@/lib/mui'
import { getErrorMessage, getSuccessMessage } from '@/utils'
```

Mutation hooks come from the feature's `api/` barrel.

## Rules to follow

- `api-mutation-hooks-patterns.mdc` — hooks invalidate cache; dialog handles UI feedback.
- Do not call the OpenAPI client directly in the dialog — use `useCreate*` / `useUpdate*`.
- Named export; kebab-case filename (`brand-form-dialogs.tsx`).

## Output

When done, summarize: dialog path, fields added, and which mutations it calls.
