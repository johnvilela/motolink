# Motolink Development Guide

## Architecture Overview

This is a **Next.js 16 App Router** project with **Prisma ORM** and **PostgreSQL**. The architecture follows a **service-oriented pattern** with clear separation between client and server code.

### Key Architectural Layers

1. **Route Handlers** (`src/app/api/**/route.ts`): RESTful API endpoints for external/client-side consumption
2. **Server Actions** (`src/lib/modules/*/\*-actions.ts`): Server-side mutations using `next-safe-action` for form submissions and mutations
3. **Services** (`src/lib/modules/*/\*-service.ts`): Business logic layer, directly interacts with Prisma
4. **Components** (`src/components/`): UI components organized by type (forms, tables, ui)

### Critical Patterns

**Service Pattern**
```typescript
// Services return factory functions for dependency injection
export function usersService() {
  return {
    async create(data) { /* ... */ },
    async list(input) { /* ... */ }
  };
}
// Always call as: usersService().create()
```

**Server Actions with next-safe-action**
- All server actions use `actionClient` from `/src/lib/services/safe-action.ts`
- Actions handle validation, error handling, and redirects
- Client components use `useAction` hook from `next-safe-action/hooks`
- Example: `const { execute, isExecuting } = useAction(mutateUserAction);`

**Soft Deletes**
- Users have `isDeleted: Boolean` field (default: false)
- Delete operations set `isDeleted: true` instead of hard deletes
- List queries filter by `isDeleted: false`

**Authentication & Sessions**
- Token-based sessions stored in database (model: `Session`)
- Cookies: `SESSION_TOKEN` and `USER_ID` (constants in `/src/lib/constants/cookie-names.ts`)
- Session validation in `AppLayoutWrapper` component
- First-time users get verification tokens for password setup

## Development Workflows

**Start Development**
```bash
pnpm dev                 # Start Next.js dev server (port 3000)
pnpm run posting:dev     # API testing with Posting tool
```

**Database**
```bash
pnpx prisma generate     # Generate Prisma client (output: generated/prisma/)
pnpx prisma migrate dev  # Create and apply migrations
pnpx prisma studio       # Visual database browser
```

**Code Quality**
```bash
pnpm lint               # Biome check + auto-fix
pnpm format             # Biome format
```

## Project-Specific Conventions

### File Organization
- **Modules**: `/src/lib/modules/{module}/` contains `*-service.ts`, `*-actions.ts`, `*-types.ts`, `*-constants.ts`
- **Route structure**: `/src/app/app/*` for authenticated pages (wrapped in `AppLayoutWrapper`)
- **Generated Prisma**: Custom output path `generated/prisma/` (not default `node_modules`)

### Naming Conventions
- Services: `{entity}Service()` - factory function pattern
- Actions: `{verb}{Entity}Action` (e.g., `mutateUserAction`, `deleteUserAction`)
- Constants: Grouped in `*-constants.ts` (e.g., `userStatus`, `userStatusTranslations`)
- Types: Zod schemas with inferred types (e.g., `MutateUserSchema` → `MutateUserDTO`)

### Portuguese UI
- All user-facing text in Portuguese
- Translation constants for enums (e.g., `userStatusTranslations`)
- Error messages in Portuguese

### Import Paths
- Use `@/*` alias for `/src/*` (configured in `tsconfig.json`)
- Prisma client imported from `generated/prisma/client`

### Component Patterns
- UI components use **shadcn/ui** with **Radix UI** primitives
- Tables use `hidden md:table-cell` for responsive columns
- Forms use `react-hook-form` with Zod validation
- Tooltips wrap action buttons for accessibility

### Error Handling
- Custom `AppError` class with message and HTTP code
- `apiWrapper` utility for Route Handlers (catches and formats errors)
- `actionClient` automatically handles `AppError` in Server Actions

### Data Fetching
- Server Components fetch directly from services (e.g., `await usersService().list()`)
- Client-side fetching uses custom hooks (e.g., `useUsers` in `/src/hooks/`)
- Server Actions for mutations, not queries

## Integration Points

**Prisma Schema** (`prisma/schema.prisma`)
- Custom generator output: `../generated/prisma`
- UUIDs use `uuid(7)` for sortability
- Cascade deletes on foreign keys

**Authentication Flow**
1. Login → `sessionsService().create()` → Set cookies → Redirect by role
2. First login → Verification token → Password setup → Activate user

**User Management**
- Status: `ACTIVE`, `BLOCKED`, `PENDING`
- Roles: `ADMIN`, `USER` (constants in `users-constants.ts`)
- Permissions: Array of strings on User model
