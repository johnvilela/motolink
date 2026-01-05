
# Task: Implement Client (Cliente) UI Pages

  

You are an AI coding assistant working in a Next.js 16 + Prisma project. Follow the existing patterns and architecture of this repo strictly.

  

## Goal

  

Implement the **Client (Cliente)** UI pages to **list, create, view details, and edit** a client, using the existing backend logic in the clients module.

  

Use the **same patterns** as:

  

- Entregadores pages:

-  `src/app/app/entregadores/page.tsx`

-  `src/app/app/entregadores/novo/page.tsx`

-  `src/app/app/entregadores/[id]/page.tsx`

-  `src/app/app/entregadores/[id]/editar/page.tsx`

- Entregadores components:

-  `src/components/forms/deliveryman-form.tsx`

-  `src/components/tables/deliveryman-table.tsx`

- Clients backend (DO NOT MODIFY):

-  `src/lib/modules/clients/clients-service.ts`

-  `src/lib/modules/clients/clients-actions.ts`

-  `src/lib/modules/clients/clients-types.ts`

-  `src/lib/modules/clients/client-constants.ts`

  

## Routing & Files to Create

  

Create **authenticated** pages under `src/app/app/clientes/` (new route), following the same structure as entregadores:

  

### 1. List page (index)

- File: `src/app/app/clientes/page.tsx`

- Route: `/app/clientes`

- Responsibilities:

- Use `getUserLogged` + `checkUserPermissions` to enforce permission `"manager.view"`.

- If user **cannot** view: `redirect("/app/sem-permissao")`.

- Read `searchParams` (page, search, name, cnpj).

- Use `cookies()` + `cookieNames.CURRENT_BRANCH` to get the current branch.

- Call `clientsService().list({ ... })` with:

-  `page` (default 1)

-  `limit` (10)

- optional filters (`name`, `cnpj`)

-  `branch` from the current branch cookie

- Implement smart search logic (like deliverymen): if `search` param exists and no specific filters:

- If search contains letters: use as `name` filter

- Otherwise: use as `cnpj` filter

- Render:

-  `AppContentHeader` with breadcrumb `"Clientes"`.

-  `Heading` showing `"Clientes ({count})"`.

-  `SearchTextField` tuned for name/cnpj search with `baseUrl="/app/clientes"`.

-  `ClientsTable` component (you will create it, see below).

-  `TablePagination` with `baseUrl="/app/clientes"`.

- If user has `"manager.create"` permission, show "Novo Cliente" button linking to `/app/clientes/novo`.

  

### 2. Create page

- File: `src/app/app/clientes/novo/page.tsx`

- Route: `/app/clientes/novo`

- Responsibilities:

- Use `getUserLogged` + `checkUserPermissions(user, ["manager.create"])`.

- If user **cannot** create: `redirect("/app/sem-permissao")`.

- Load **regions** and **groups** server-side:

- Use `regionsService().listAll({ page: 1, limit: 100, branch: currentBranch })` from `src/lib/modules/regions/regions-service.ts`

- Use `groupsService().listAll({ page: 1, limit: 100, branch: currentBranch })` from `src/lib/modules/groups/groups-service.ts`

- Get `currentBranch` from `cookieNames.CURRENT_BRANCH` cookie

- Render:

-  `AppContentHeader` with breadcrumb:

-  `"Clientes"` → `/app/clientes`

-  `"Novo Cliente"`

-  `Heading`  `"Cadastrar Cliente"`.

-  `ClientForm` component (you will create it), in **create** mode:

- Props: `loggedUser`, `regions` list, `groups` list.

  

### 3. Details page

- File: `src/app/app/clientes/[id]/page.tsx`

- Route: `/app/clientes/:id`

- Responsibilities:

- Receive `params: Promise<{ id: string }>`.

- Use `getUserLogged` + `checkUserPermissions(user, ["manager.view"])`.

- If user **cannot** view: `redirect("/app/sem-permissao")`.

- Fetch the client via `clientsService().getById(id)`.

- Handle not-found with simple fallback: `"Cliente não encontrado"`.

- Render:

-  `AppContentHeader` breadcrumb:

-  `"Clientes"` → `/app/clientes`

- Client name or `"Detalhes do Cliente"`.

- Main content sections (similar to deliveryman details):

-  **Informações gerais**: name, cnpj, contactName, region, group, createdAt

-  **Endereço**: cep, street, number, complement, neighborhood, city, uf

- If user has `"manager.edit"` permission, show "Editar" button linking to `/app/clientes/${id}/editar`.

  

### 4. Edit page

- File: `src/app/app/clientes/[id]/editar/page.tsx`

- Route: `/app/clientes/:id/editar`

- Responsibilities:

- Use `params` pattern with `Promise<{ id: string }>`.

- Use `getUserLogged` + `checkUserPermissions(user, ["manager.edit"])`.

- If user **cannot** edit: `redirect("/app/sem-permissao")`.

- Fetch the client via `clientsService().getById(id)`.

- If not found, simple fallback: `"Cliente não encontrado"`.

- Load **regions** and **groups** server-side (same as create page).

- Render:

-  `AppContentHeader` with breadcrumb:

-  `"Clientes"` → `/app/clientes`

-  `"Editar Cliente"`

-  `Heading`  `"Editar Cliente"`.

-  `ClientForm` component in **edit** mode:

- Props: `loggedUser`, `regions`, `groups`, `clientToBeEdited`.

  

## New UI Components to Create

  

Follow the existing patterns in `deliveryman-form.tsx` and `deliveryman-table.tsx`.

  

### 1. Client form

  

Create a form component:

  

- File: `src/components/forms/client-form.tsx`

- Type: Client component (`"use client";`)

- Responsibilities:

- Implement a form for `MutateClientSchema` fields from `clients-types.ts`:

- Basic info: `name`, `cnpj`, `contactName`

- Address: `cep`, `street`, `number`, `complement`, `neighborhood`, `city`, `uf`

- Relations: `regionId` (optional, nullable), `groupId` (optional, nullable)

-  **DO NOT** include `commercialCondition` field - this will be implemented in a future task.

- Use `react-hook-form` + Zod resolver.

- Use `cnpjMask` from `@/lib/masks/cnpj-mask` for the CNPJ field (similar to how deliveryman-form uses cpfMask).

- Use `cepMask` from `@/lib/masks/cep-mask` for the CEP field.

- Props:

-  `loggedUser` (for permissions).

-  `regions: Array<{ id: string; name: string }>`.

-  `groups: Array<{ id: string; name: string }>`.

- Optional `clientToBeEdited` with type derived from `clientsService().getById` result.

- Use `useAction(mutateClientAction)` from `clients-actions.ts` via `next-safe-action/hooks`.

- For `regionId` and `groupId`, use `Select` inputs listing the passed options.

- Form sections (use `Heading` variant h4 + `Separator`):

- "Informações Básicas" (name, cnpj, contactName)

- "Endereço" (cep, street, number, complement, neighborhood, city, uf)

- "Relacionamentos" (regionId, groupId)

- All labels, button texts, and validations must be in **Portuguese**.

- Submit button text:

-  `"Cadastrar"` in create mode.

-  `"Salvar alterações"` in edit mode.

- Display server-side/validation errors using `Alert` component.

  

### 2. Clients table

  

Create a table component:

  

- File: `src/components/tables/client-table.tsx`

- Responsibilities:

- Present the list returned from `clientsService().list`.

- Type the `clients` prop using:

-  `ListClientsServiceResponse["data"]` (derive from `clientsService().list` return type).

- Columns (responsive, follow `DeliverymenTable` pattern):

- Nome

- CNPJ (use `cnpjMask` from `@/lib/masks/cnpj-mask`)

- Cidade/UF (format as "Cidade - UF")

- Contato

- Data de criação

- Ações

- Actions column:

- View details: link to `/app/clientes/${id}`.

- Edit: link to `/app/clientes/${id}/editar`, only if `checkUserPermissions(loggedUser, ["manager.edit"])` is true.

- Delete:

- Hook into `deleteClientAction` from `clients-actions.ts`.

- Wrap in confirmation `AlertDialog` with Portuguese text.

- Only show if `checkUserPermissions(loggedUser, ["manager.delete"])` is true.

- Props:

-  `clients: ListClientsServiceResponse["data"]`

-  `loggedUser` (to check permissions).

- Use `Tooltip` components for action buttons.

  

## Permissions

  

Use the permissions defined in `src/lib/modules/users/users-constants.ts`:

  

- View list and details: `checkUserPermissions(user, ["manager.view"])`

- Create: `checkUserPermissions(user, ["manager.create"])`

- Edit: `checkUserPermissions(user, ["manager.edit"])`

- Delete: `checkUserPermissions(user, ["manager.delete"])`

  

Behavior:

  

- If the user does **not** have the required permission for a **page**, redirect to `/app/sem-permissao` early in the server component.

- If the user lacks permission for a **button/action**, hide the button/action (do not render it).

  

## Regions and Groups Loading (Server-Side)

  

For both **create** and **edit** pages:

  

- Use `regionsService().listAll({ ... })` from `src/lib/modules/regions/regions-service.ts`.

- Use `groupsService().listAll({ ... })` from `src/lib/modules/groups/groups-service.ts`.

- Derive `branch` from cookies:

```ts

const  cookieStore  =  await  cookies();

const  currentBranch  = cookieStore.get(cookieNames.CURRENT_BRANCH)?.value;

- Call both services:

```ts

const  regions  =  await  regionsService().listAll({

page: 1,

limit: 100,

branch: currentBranch,

});

  

const  groups  =  await  groupsService().listAll({

page: 1,

limit: 100,

branch: currentBranch,

});

```
-   Pass  `regions.data`  and  `groups.data`  (mapped to  `{ id, name }`) down to  `ClientForm`.

## Important Notes

-   **DO NOT**  modify any backend logic in  `clients-service.ts`,  `clients-actions.ts`,  `clients-types.ts`, or  `client-constants.ts`.
-   **DO NOT**  implement the  `commercialCondition`  field in the form - this will be done in a future task. The form should only handle the basic client fields.
-   The  `mutateClientAction`  redirects to  `/app/comercial/clientes`, but we're creating pages at  `/app/clientes`. You may need to be aware of this discrepancy - follow the task instruction to create at  `/app/clientes`  and document this if needed.
-   Use the  `@/*`  import alias for imports under  `src/`.
-   Follow  **Portuguese**  for all user-facing text.
-   Use existing UI components:  `AppContentHeader`,  `Heading`,  `Text`,  `Button`,  `AlertDialog`,  `SearchTextField`,  `TablePagination`,  `Separator`, etc.
-   Keep code style consistent with  `DeliverymanForm`  and  `DeliverymenTable`.
-   Ensure all new components/pages are  **type-safe**  with existing Zod schemas and Prisma types.

## Required Masks

Ensure these masks exist and use them:

-   `cnpjMask`  from  `@/lib/masks/cnpj-mask`  for CNPJ field
-   `cepMask`  from  `@/lib/masks/cep-mask`  for CEP field

If they don't exist, check similar mask implementations (like  `cpfMask`,  `phoneMask`) and create them following the same pattern.

## What to Actually Do

1.  Create the four pages:
    
    -   `src/app/app/clientes/page.tsx`
    -   `src/app/app/clientes/novo/page.tsx`
    -   `src/app/app/clientes/[id]/page.tsx`
    -   `src/app/app/clientes/[id]/editar/page.tsx`
2.  Create the shared components:
    
    -   `src/components/forms/client-form.tsx`
    -   `src/components/tables/client-table.tsx`
3.  Wire all pages to:
    
    -   `clientsService`  and  `clients-actions`
    -   `regionsService`  and  `groupsService`  for server-side data loading
    -   `getUserLogged`  and  `checkUserPermissions`
    -   `cookieNames.CURRENT_BRANCH`  for branch-aware queries
4.  Ensure everything compiles and follows the patterns used in the Entregadores module.
