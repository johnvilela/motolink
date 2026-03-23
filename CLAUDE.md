# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Test

```sh
pnpm install          # install deps
pnpm dev              # dev server (localhost:3000)
pnpm build            # production build
pnpm lint             # biome check --write
pnpm format           # biome format --write
pnpm test             # vitest (requires test DB — see below)
pnpm db:dev           # start Postgres via Docker (port 5432)
pnpm seed             # seed dev database
```

Tests run against a real Postgres instance (Docker, port 5433). Global setup handles container start, `prisma generate`, and `prisma migrate deploy`. Each test truncates all tables via `cleanDatabase()` in `beforeEach`. Run a single test file with `pnpm test test/modules/{name}/{name}-service.spec.ts`.

## Architecture

```
src/
  app/            # Next.js App Router — (public)/ and (private)/ route groups
  modules/        # Feature modules — types, service, actions (see below)
  components/
    ui/           # shadcn primitives (do not hand-edit)
    composite/    # App-level reusable components
    forms/        # Entity form components
    tables/       # Entity table components
  lib/            # Shared infra — database.ts, auth helpers, cn.ts
  constants/      # Plain `as const` objects
  utils/          # Masks, formatting, helpers
  hooks/          # React hooks
generated/prisma/ # Prisma generated client (do not hand-edit)
ai/skills/        # Codegen skill docs for module, test, and CRUD scaffolding
test/             # Integration tests mirroring src/modules/
```

### Module Pattern (`src/modules/{name}/`)

Each module has up to 3 files (no barrel `index.ts`):

| File | Role |
|---|---|
| `{name}-types.ts` | Zod schemas → inferred TS types (`*MutateDTO`, `*ListQueryDTO`, `*FormSchema`) |
| `{name}-service.ts` | Functional factory returning an object of async methods |
| `{name}-actions.ts` | `"use server"` actions (only for UI-facing modules) |

### Service conventions

- **Functional factory** — `export function widgetsService() { return { … } }`
- Every method returns `okAsync(value)` or `errAsync({ reason, statusCode })` (neverthrow)
- `reason` strings in **Portuguese**; `console.error` messages in English
- Direct `db.*` Prisma calls (no repository layer)
- Soft-delete filter: `isDeleted: false`
- Pagination: return `{ data, pagination: { page, pageSize, total, totalPages } }`
- History traces: fire-and-forget `historyTracesService().create(...).catch(() => {})`

### Server action conventions

- Wrap with `safeAction.inputSchema(schema).action(…)` (next-safe-action)
- Auth via cookies: `USER_ID`, `SELECTED_BRANCH`, `SESSION_TOKEN`, `SESSION_EXPIRES_AT`
- On error: `return { error: result.error.reason }`
- On success: `revalidatePath(...)` then `return { success: true }`

## Conventions

- **Language**: User-facing strings and Zod messages in **Portuguese**; logs/comments in English
- **File naming**: kebab-case for files and folders; PascalCase for component exports
- **No barrel exports** — always import from the specific file path
- **Path alias**: `@/*` maps to `./src/*`
- **Formatting**: Biome — 2-space indent, 120 line width (do not use ESLint/Prettier)
- **IDs**: UUID v7 (`@default(uuid(7))`) in all Prisma models
- **Auth**: Custom cookie-based sessions (no NextAuth); see `src/proxy.ts` for middleware
- **Passwords**: argon2 with SHA-256 pepper from `AUTH_SECRET`
- **UI**: shadcn/ui + radix-ui primitives; `cn()` for className merging
- **Routing**: Portuguese URL segments (`/gestao/colaboradores`, `/gestao/clientes`)

## Versioning

After completing a task, update the `version` field in `package.json`:
- **Patch** (e.g. 1.0.0 → 1.0.1): bug fixes, refactors, small changes
- **Minor** (e.g. 1.0.0 → 1.1.0): new features or significant enhancements
- The **major** version is updated manually

## AI Skills

Detailed scaffolding guides live in `ai/skills/`:
- `create-module.md` — new module (types + service + actions)
- `create-test-suite.md` — Vitest integration test for a service
- `create-crud-interface.md` — CRUD pages, form, and table components

Reference these before scaffolding new features.

## Test Conventions

- File: `test/modules/{name}/{name}-service.spec.ts`
- Inline `createTest*()` factory helpers per file
- Assert with `result.isOk()`, `result._unsafeUnwrap()`, `result._unsafeUnwrapErr()`
- Set `process.env.AUTH_SECRET ??= "test-secret"` before `src/` imports
- No mocking of the database — all tests hit the real test Postgres
