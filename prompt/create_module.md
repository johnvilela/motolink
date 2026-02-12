# Create Module Prompt

You are an AI engineering agent working in this repo. Your task is to create **only one module** similar to `src/modules/users` and follow the existing patterns already present in `src/modules/*`.

## Inputs (provided by the user)
- **Module name** (e.g., `users`, `regions`, `groups`)
- **Prisma model name** from `prisma/schema.prisma` (e.g., `User`, `Region`)

## Hard requirements
- **Plan carefully before editing or creating files.**
- **Match existing patterns** in `src/modules/*` (naming, structure, validation, actions, services, history trace conventions, pagination, error handling, etc.).
- **Only create the module** (files under `src/modules/<module>/...`). Do not modify or create anything else.
- **Ask clarifying questions before writing files** if any behavior is ambiguous or missing.
- **Do not invent functionality.** Implement only what the user requests and what is required to follow established patterns.

## Discovery steps (do these before writing files)
1. Inspect existing modules (`users`, `groups`, `regions`, `sessions`, `history-traces`) to copy patterns.
2. Inspect the Prisma model to understand fields, relations, and constraints.
3. Identify which standard files are needed: `*-service.ts`, `*-types.ts`, `*-actions.ts`, and whether `*-queries.ts` is required.

## Clarifying questions (ask before implementation)
Ask the user these questions, concisely:
- **Service functions:** Which functions should the service expose? (e.g., `create`, `update`, `delete`, `getById`, `listAll`, `getAll`, custom methods)
- **History trace:** Which functions should record history traces? (created/updated/deleted, and entity type)
- **Delete behavior:** Hard delete vs soft delete? If soft delete, which flag/field? Any cascade behavior?
- **Validation rules:** Required/optional fields? Any special validations or transforms?
- **List behavior:** Should `listAll` exist? If yes: filters, search fields, pagination, default sorting, includes?
- **Actions:** Should server actions be created? If yes: routes to `revalidatePath`, cookie usage, and any data transforms?
- **Queries:** Do you need module-level query helpers like `users-queries.ts`? If yes, what should they return?
- **Relations:** Any `include`/`select` requirements or constraints to enforce before deletes/updates?

If any answer is missing, **do not proceed**; ask for it.

## Implementation guidelines
- Follow file naming conventions: `src/modules/<module>/<module>-service.ts`, `src/modules/<module>/<module>-types.ts`, `src/modules/<module>/<module>-actions.ts`, optionally `src/modules/<module>/<module>-queries.ts`.
- Follow existing patterns for:
  - `safeAction` usage
  - `AppError` handling
  - `historyTracesService()` usage
  - pagination and `listAll` response shape
  - `revalidatePath` routes
  - `cookies()` access and `cookieConst.USER_ID` when needed
  - `zod` schemas and DTO types
- Keep logic consistent with `users`, `groups`, `regions` modules unless instructed otherwise.
- Keep changes localized to the module directory only.

## Output
- After clarifying questions are answered, implement the module files only.
- Summarize the created files and key decisions.
