# Repository Guidelines

## Project Structure & Module Organization
- Next.js 16 App Router in `src/app` (`page.tsx`/`layout.tsx` for public entry, `src/app/app/*` for authenticated areas, API routes under `src/app/api`).
- Shared pieces in `src/components` (Tailwind 4 + design tokens), `src/hooks` (`use-*`), and `src/lib` (constants, modules, services, utilities) with the `@/*` alias.
- Data: Prisma schema in `prisma/schema.prisma`, migrations in `prisma/migrations` (see `prisma.config.ts`), generated client in `generated/prisma`—do not edit manually.
- `endpoints/` holds posting CLI collections; static assets live in `public/`.

## Build, Test, and Development Commands
- `pnpm install` – install deps. `pnpm dev` – dev server on http://localhost:3000 with middleware `src/proxy.ts`.
- `pnpm build` / `pnpm start` – production build and serve.
- `pnpm lint` / `pnpm format` – Biome lint/format with 2-space indent and ordered imports (writes files).
- `pnpm posting:dev` / `pnpm posting:prod` – run `endpoints/` calls against the matching env file.
- After editing `prisma/schema.prisma`, run `pnpm prisma generate`; for schema changes also run `pnpm prisma migrate dev --name <change>`.

## Coding Style & Naming Conventions
- TypeScript is strict; use PascalCase exports and kebab-case filenames (`src/components/forms/auth-form.tsx`), and keep hooks named `use*` in `src/hooks`.
- Prefer the `@/*` alias over long relatives.
- Styling: rely on Tailwind 4 utilities and the tokens in `src/app/globals.css`; keep dark-mode variables intact.
- Fix Biome warnings instead of suppressing them.

## Testing Guidelines
- No suite is checked in yet; add colocated `*.test.ts(x)` for new behavior using React Testing Library or Playwright.
- Cover `src/app/api` routes and `src/lib/modules` logic with deterministic fixtures; mock Prisma instead of live DBs.
- Keep tests fast and document any gaps in PRs.

## Commit & Pull Request Guidelines
- Use the existing Conventional Commit style (`feat: ...`, `fix: ...`, `chore: ...`; Portuguese subjects are fine) with concise, imperative wording.
- Before opening a PR, run `pnpm lint` and `pnpm build` and note results.
- PRs should include scope/issue links, validation steps, and screenshots for UI changes (desktop + mobile when relevant).
- Call out schema/env changes (e.g., `DATABASE_URL`, `PAGE_SIZE`, new migrations) and commit regenerated Prisma artifacts.

## Security & Configuration Tips
- Store secrets in `.env.local`/`.env.*` (do not commit); Prisma needs `DATABASE_URL`, pagination can use `PAGE_SIZE`.
- Session cookies (`session_token`, `session_expires_at`, `user_id`) power middleware—never log or expose them.
- Treat `generated/prisma` as build output; always regenerate after schema edits.
