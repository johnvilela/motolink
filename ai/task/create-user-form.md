# Task

  Recreate the **exact same user form behavior** that exists today by analyzing these files and mirroring them precisely:

- `src/modules/users/users-actions.ts`
- `src/components/forms/user-form.tsx`

  Use the existing server action:

- `mutateUserAction` from `src/modules/users/users-actions.ts`

  Do **not** invent a new action, do **not** change the action contract, and do **not** redesign the UX. The goal is to reproduce
  the same form behavior with the same create/update flow, the same validation behavior, the same side effects, and the same
  feedback patterns.

# Requirements

## Use the same action flow

  Use `useAction(mutateUserAction)` from `next-safe-action/hooks`.

  The form must support both:

- creating a user when there is no `id`
- updating a user when `id` exists

  Keep the same success/error behavior expected by the action:

- success returns `result.data?.success`
- server/business error returns `result.data?.error`

  Do not change `mutateUserAction`.

## Preserve the current mutate action semantics

  Mirror the current behavior of `mutateUserAction` exactly:

- it uses `userMutateSchema`
- it reads the logged user id from cookies
- it transforms:
  - `phone` with `cleanMask`
  - `document` with `cleanMask`
  - `birthDate` from `DD/MM/YYYY` to ISO using `dayjs`
- it sends only:
  - `name`
  - `email`
  - `phone`
  - `document`
  - `birthDate`
  - `branches`
  - `role`
  - `permissions`
- it creates when `id` is absent
- it updates when `id` is present
- it revalidates `/gestao/colaboradores`
- it also revalidates `/gestao/colaboradores/${id}` on update

  Important:

- do **not** add new server-side persistence behavior for `files`
- do **not** add new server-side handling for `password`
- if the form uploads files client-side and passes `files` into `execute(...)`, preserve that behavior exactly, even though the
  current action does not forward `files`

## Recreate the same form structure and behavior

  Build a client component with the same shape as the current form:

### Props

  Use the same prop design:

- `branches: { id: string; name: string; code: string }[]`
- `defaultValues?: Partial<UserMutateInput>`
- `isEditing?: boolean`
- `onSuccess?: () => void`
- `redirectTo?: string`

### Form setup

  Use:

- `react-hook-form`
- `zodResolver(userMutateSchema)`
- `useForm<UserMutateInput>(...)`

  Initialize default values exactly like the current form for:

- `id`
- `name`
- `email`
- `phone`
- `birthDate`
- `document`
- `branches`
- `role`
- `permissions`

  Keep `files` in local component state, initialized from `defaultValues?.files ?? []`.

## Fields to render

  Recreate the same visible fields and labels:

### Personal information section

- `Nome`
- `E-mail`
- `Telefone`
- `Data de Nascimento`
- `CPF/RG`
- `Documentos`

### Permissions/access section

- `Filiais`
- `Cargo`
- `Permissões`

  Use the same Portuguese labels/placeholders as the current form.

## Keep the same field components/patterns

  Use the same UI/component approach already used in the current form:

- `FieldSet`
- `FieldLegend`
- `FieldGroup`
- `Field`
- `FieldLabel`
- `FieldDescription`
- `FieldError`
- `Input`
- `Button`
- `Checkbox`
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- `BadgeSelect`
- `FileInput`

## Keep the same masks

  Apply the same input masking behavior:

- phone: `applyPhoneMask`
- birth date: `applyDateMask`
- document: `applyCpfMask`

## Keep the same permissions behavior

  Recreate the permissions table behavior exactly:

- use `PERMISSION_MODULES`
- use `PERMISSION_ACTIONS`
- use `buildPermissionKey(...)`
- when a role is selected, load the matching permissions from `ROLE_PERMISSIONS`
- when role is `ADMIN`:
  - all permissions should appear checked
  - permission checkboxes should be disabled
- otherwise:
  - toggling a checkbox adds/removes that permission from the array

## Keep the same branch selector behavior

  Use `BadgeSelect` with:

- `multiple`
- options mapped from `branches` as:
  - `value: branch.id`
  - `label: branch.name`

## Keep the same file upload flow

  Preserve the exact current upload behavior:

- maintain `isUploading` local state
- maintain `formFiles` local state
- split files into:
  - existing URL strings
  - new file objects using `isFileObject`
- upload new files through `fileManagement().upload({ files: newFiles, path: "users" })`
- if upload fails:
  - show toast error
  - stop submission
- submit `execute({ ...data, files: allFileUrls })`
- always reset `isUploading` in `finally`

## Feedback requirements

  Use both feedback systems, with the same split of responsibilities:

### Alert feedback

  Use `src/components/ui/alert.tsx` for inline persistent error feedback under the form.

  Render a destructive alert when `result.data?.error` exists, using:

- `Alert`
- `AlertDescription`

  This inline alert must remain visible in the form, matching the current behavior.

### Sonner feedback

  Use the existing toast system that is rendered by `src/components/ui/sonner.tsx`.

  Important:

- use toast notifications compatible with the existing shared Sonner setup
- do not introduce another toast library
- assume the app already renders the shared `Toaster` from `src/components/ui/sonner.tsx`

  Use Sonner to show:

- success toast after successful create/update
- error toast for action errors
- error toast for file validation errors
- error toast for file upload failure

  Keep the same messages:

- success create: `Colaborador criado.`
- success update: `Colaborador atualizado.`
- upload failure: `Erro ao enviar arquivos. Tente novamente.`

  For file validation errors, show each validation message individually.

## Success side effects

  On successful mutation:

- show success toast
- call `onSuccess?.()`
- if `redirectTo` exists, call `router.push(redirectTo)`

## Submit button behavior

  Keep the same loading and label behavior:

- loading when `isExecuting || isUploading`
- label:
  - `Enviando arquivos...` when uploading
  - `Salvar Alterações` when editing
  - `Criar Colaborador` otherwise

## Important constraints

- Reproduce the current behavior exactly, not an improved version
- Do not add extra fields that are not rendered in the current form
- Do not add password UI unless it already exists in the source you are mirroring
- Do not change validation schema behavior
- Do not change the server action
- Do not change the user flow
- Do not remove the inline `Alert` even if a toast is also shown
- Do not replace Sonner with another notification system

# Deliverable

  Implement the recreated form so that it behaves the same as the current one in both create and update modes, using the existing
  `mutateUserAction`, `Alert` from `src/components/ui/alert.tsx`, and the app’s Sonner-based toast system from `src/components/ui/
  sonner.tsx`.
