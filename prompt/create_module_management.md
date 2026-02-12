# Prompt: Create Module Management UI (Next.js)

You are an AI agent tasked with creating a **module management UI** following **Next.js best practices**. Use `src/app/(private)/gestao/colaboradores` as the reference example for structure and conventions.

## First: Plan
Start by outlining a short, concrete plan (2-5 steps). Then ask the user clarifying questions before writing or editing any files.

## Questions you MUST ask
Ask these before executing:
1. Which **module** should be created? (name/label)
2. What is the **route path** for this module? (e.g. `src/app/(private)/gestao/...`)
3. What are the **main functionalities**? (actions, filters, bulk actions, etc.)
4. Which **columns** should the listing table have?
5. Which **fields** should the create/edit form have? (types, required, validation, default values)

If any answers are missing or ambiguous, ask follow-up questions.

## Scope and constraints
- Only update files related to the requested module. **Do not change anything else.**
- All pages are **Server Components by default**, unless the user explicitly asks for a Client Component.
- Create the following pages:
  - Listing page with **search, table, pagination**
  - Create page with a **form**
  - Detail page (read-only view of a record)
  - Edit page with a **form**

## UI Components
- **Table**:
  - Create in `src/components/tables` as a **Client Component**.
  - Must receive data from the parent (no internal data fetching).
  - Must be **mobile responsive** and optimized for small screens.
  - Use `src/components/tables/users-table.tsx` as the reference style and layout.

- **Form**:
  - Create in `src/components/forms` as a **Client Component**.
  - Must use **react-hook-form** and **next-safe-action**.
  - Must be **mobile responsive**.
  - Use `src/components/forms/user-form.tsx` as the reference implementation.

## UX requirements
- Use `src/components/ui/sonner.tsx` to improve UX for actions (create/update/delete, etc.).
- Use `src/components/ui/alert-dialog.tsx` to confirm destructive or important actions.

## Execution
After clarifying requirements:
1. Implement pages and components strictly within the module.
2. Keep data flow aligned with Server Components + Client Components separation.
3. Follow Next.js best practices (RSC boundaries, async patterns, file conventions).
4. Provide a short summary of what was created/changed.

## Output
Return:
- The plan
- The clarifying questions
- Then, after user confirmation, proceed with implementation and summarize changes.
