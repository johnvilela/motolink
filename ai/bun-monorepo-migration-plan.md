# Bun monorepo migration plan for NextMoto

## Executive summary

Short answer: **the target architecture is reasonable, but I would not do a big-bang rewrite just to fix the current slowness**.

The biggest performance issues I found are not primarily caused by Next.js itself. They come from the way the operational area currently loads and mutates data:

- the operational pages render a server shell and then fetch the real data again from the browser
- the monitoring screens poll frequently
- the same auth and user data is resolved multiple times in the same request path
- large client components are tightly coupled to `next-safe-action`, `router.refresh()`, and `revalidatePath()`

Because of that, my recommendation is:

1. **Fix the operational hot paths first inside the current app**
2. **Create the Bun monorepo in parallel**
3. **Migrate the operational bounded context first**, not the whole system at once

If the operational area is the real core of the product, then **yes, the migration is worth the energy**. But it is worth it as a **phased restructuring**, not as an urgent full rewrite done only because the current UX feels slow.

---

## What I evaluated in the current project

### Current stack

- `Next.js 16` monolith with App Router and `output: "standalone"` in `next.config.ts`
- `React 19`, `TypeScript`, `Prisma 7`, PostgreSQL
- cookie-based auth and request gating in `src/proxy.ts`
- server actions with `next-safe-action`
- route handlers under `src/app/api/*`
- feature modules under `src/modules/*`

Relevant files:

- `package.json`
- `next.config.ts`
- `Dockerfile`
- `Procfile`
- `src/proxy.ts`
- `src/lib/database.ts`
- `prisma/schema.prisma`

### Why the operational area feels slow

#### 1. The monitoring pages are server-rendered shells, but the real payload still loads from the browser

Files:

- `src/app/(private)/operacional/monitoramento/diario/page.tsx`
- `src/app/(private)/operacional/monitoramento/semanal/page.tsx`
- `src/components/composite/monitoring-daily-content.tsx`
- `src/components/composite/monitoring-weekly-content.tsx`
- `src/app/api/monitoring/route.ts`
- `src/app/api/monitoring/weekly/route.ts`

What happens today:

- the page resolves only selected filter names on the server
- the real monitoring dataset is fetched again from the browser through `/api/monitoring` or `/api/monitoring/weekly`
- the client keeps polling for updates

That means each operational screen pays for:

- the initial server render
- a second hop through a Next route handler
- repeated auth and schema validation inside that route handler
- repeated client re-renders after every refresh

#### 2. Request-time auth and user lookup are duplicated

Files:

- `src/proxy.ts`
- `src/components/composite/app-layout/index.tsx`
- `src/utils/check-page-permission.ts`

The same request path can validate the session in middleware, load the user in layout, then load the user again for permission checks. On a resource-constrained VPS this is exactly the kind of repeated work that makes the whole app feel heavier than it should.

#### 3. The operational UI is heavily action-coupled

Files:

- `src/components/composite/monitoring-client-card.tsx`
- `src/components/composite/monitoring-work-shift-row.tsx`
- `src/components/composite/monitoring-weekly-client-card.tsx`
- `src/components/composite/planning-client-card.tsx`
- `src/modules/work-shift-slots/work-shift-slots-actions.ts`
- `src/modules/planning/planning-actions.ts`

The current UI relies on:

- `useAction(...)`
- `router.refresh()`
- `revalidatePath(...)`
- several mutation entry points spread across server actions

That works, but it makes the operational interface hard to keep fast because every mutation is strongly tied to the Next runtime model instead of a reusable API contract.

#### 4. Option loading is repeated in several client components

Files:

- `src/components/composite/planning-week-view.tsx`
- `src/components/composite/monitoring-daily-content.tsx`
- `src/components/composite/monitoring-weekly-content.tsx`

Each of those implements its own `useFetchOptions()` logic for groups and clients. That increases network chatter, duplicates behavior, and makes the UX inconsistent.

#### 5. The service layer is actually a migration advantage

Files:

- `src/modules/planning/planning-service.ts`
- `src/modules/monitoring/monitoring-service.ts`
- the rest of `src/modules/*-service.ts`

This is important: the project is not a completely tangled monolith. The existing `src/modules` pattern gives you a good migration seam:

- `*-types.ts` already centralizes schemas and DTOs
- `*-service.ts` already centralizes business logic
- `*-actions.ts` can be replaced by Elysia routes later

That is one of the main reasons I think a phased migration is realistic.

---

## Is the migration worth it?

### My answer

**Yes, but only if you treat it as a strategic restructuring, not as the first emergency response to slow pages.**

### Why it can be worth it

- the operational area behaves more like an operator console than a typical SSR app
- a SPA plus an explicit API contract is a better fit for highly interactive monitoring workflows
- Elysia + Prisma gives you a cleaner place for API, auth middleware, events, streaming, and operational endpoints
- a `shared` package lets you stop duplicating contracts, enums, date helpers, and Zod schemas
- Bun is completely viable on a Hostinger VPS if you deploy through Docker

### Why it is not automatically worth it

- Bun does not fix over-fetching, polling strategy, duplicated auth work, or oversized client components by itself
- the highest-cost part of the migration is the UI mutation model, not the database
- TanStack Start + Elysia will improve long-term ergonomics, but the migration itself introduces risk in auth, routing, and mutation flows

### Recommendation

**Do it if:**

- operational screens are central to the business
- you want to keep evolving this product for the next few years
- you can afford a phased migration and a temporary period with both architectures in flight

**Do not do a big-bang rewrite if:**

- you need visible performance improvements immediately
- the team is small and cannot pause feature work
- the goal is only “make production feel faster next week”

In that case, fix the current operational bottlenecks first and start the monorepo as a parallel track.

---

## Recommended target structure

```text
nextmoto/
  apps/
    webapp/
      src/
        routes/
          __root.tsx
          index.tsx
          auth/
          operacional/
          gestao/
          financeiro/
        components/
        features/
        hooks/
        lib/
        styles/
      public/
      package.json
      tsconfig.json

    server/
      src/
        main.ts
        app.ts
        modules/
          auth/
          sessions/
          planning/
          monitoring/
          work-shift-slots/
          clients/
          groups/
          deliverymen/
          users/
          payment-requests/
          client-blocks/
          branches/
          history-traces/
        middleware/
        lib/
      prisma/
        schema.prisma
        migrations/
        seed.ts
      package.json
      tsconfig.json

  packages/
    shared/
      src/
        constants/
        contracts/
        schemas/
        types/
        utils/
      package.json
      tsconfig.json

  package.json
  bunfig.toml
  tsconfig.base.json
  Dockerfile
  docker-compose.yml
```

### Why this structure fits the current codebase

- `webapp` gets all React UI concerns and TanStack routing/data orchestration
- `server` gets every environment-specific concern: Prisma, cookies, auth validation, logging, background jobs, streaming
- `shared` gets only portable code that can safely run in both places

That split matches your current code much better than keeping everything inside one Next runtime.

---

## How I would map the current project into the new structure

### Move mostly as-is to `packages/shared`

These are good shared candidates as long as they stay framework-agnostic:

- `src/constants/*` that are not UI-only
- date and formatting helpers from `src/utils/*`
- Zod schemas and DTOs from `src/modules/*-types.ts`
- cookie names and permission constants where they are just values

Examples:

- `src/constants/navigation-items.ts` should stay web-only because it is UI navigation
- `src/constants/permissions.ts` is a good shared candidate
- `src/utils/date-time.ts` is a good shared candidate
- `src/modules/planning/planning-types.ts` can be split into shared request/response contracts and server-only internals

### Move to `apps/server`

These should become server-only:

- `src/lib/database.ts`
- all Prisma code
- `src/proxy.ts` logic, rewritten as server middleware / auth helpers
- `src/app/api/*`
- `src/modules/*-service.ts`
- server-action behavior from `src/modules/*-actions.ts`, rewritten as HTTP endpoints or RPC-like handlers

Suggested server module layout:

```text
apps/server/src/modules/monitoring/
  monitoring.routes.ts
  monitoring.controller.ts
  monitoring.service.ts
  monitoring.mapper.ts
```

The current service factory pattern can stay. You do not need to throw it away.

### Move to `apps/webapp`

These are primarily frontend assets:

- `src/components/*`
- `src/hooks/*`
- `src/app/(private)/*` page UIs
- `src/app/(public)/*` public screens
- route-level error/loading UIs, rewritten to TanStack Start conventions

What changes most:

- replace `next/navigation` with TanStack Router
- replace `useAction(...)` with API client + TanStack Query mutations
- replace `router.refresh()` with explicit query invalidation
- replace `revalidatePath(...)` with cache invalidation in the client and server

### What should not live in `shared`

Do **not** put these in `shared`:

- Prisma client
- database access
- anything that reads cookies directly
- React components
- `next-safe-action` or framework-specific mutation wrappers

Keep `shared` boring and portable. That discipline will make the monorepo much easier to maintain.

---

## Proposed API and frontend restructuring

### Operational routes first

This is the part I would migrate first:

- `/operacional/planejamento`
- `/operacional/monitoramento/diario`
- `/operacional/monitoramento/semanal`

Why:

- this is where the UX pain is concentrated
- it is the best place to benefit from SPA-style cache and mutation control
- it is already conceptually grouped as one bounded context

### Current route to future route mapping

| Current | Future web route | Future server routes |
| --- | --- | --- |
| `src/app/(private)/operacional/planejamento/page.tsx` | `apps/webapp/src/routes/operacional/planejamento.tsx` | `GET /planning`, `PUT /planning/:clientId/:date/:period` |
| `src/app/(private)/operacional/monitoramento/diario/page.tsx` | `apps/webapp/src/routes/operacional/monitoramento/diario.tsx` | `GET /monitoring/daily`, mutation endpoints under `/work-shift-slots/*` |
| `src/app/(private)/operacional/monitoramento/semanal/page.tsx` | `apps/webapp/src/routes/operacional/monitoramento/semanal.tsx` | `GET /monitoring/weekly` |

### Mutation rewrite

The biggest rewrite is this one:

- today: `next-safe-action` + `revalidatePath()` + `router.refresh()`
- target: explicit endpoints + TanStack Query invalidation

Examples:

- `copyWorkShiftSlotsAction` -> `POST /work-shift-slots/copy`
- `sendBulkInviteAction` -> `POST /work-shift-slots/send-bulk-invite`
- `updateWorkShiftSlotStatusAction` -> `PATCH /work-shift-slots/:id/status`
- `upsertPlanningAction` -> `PUT /planning/:clientId/:date/:period`

That gives you a much clearer data flow and removes the need to bounce through the Next runtime for every mutation.

---

## Recommended migration sequence

### Phase 0 - Stabilize the current app before migration

Do these first, even if you are certain you want the monorepo:

1. stop making the monitoring pages fetch their first meaningful payload only in the browser
2. cache or centralize current user/session resolution per request
3. reduce or redesign polling in the monitoring screens
4. lazy-load the heaviest operational subcomponents and forms
5. reduce full-list loading in planning flows

Why I recommend this first:

- it gives production users relief sooner
- it makes the current behavior easier to compare against the migrated version
- it lowers risk because you are not migrating a known hot path while it is still poorly shaped

### Phase 1 - Create the Bun workspace skeleton

At the root:

- switch workspace scripts to Bun
- add `apps/webapp`, `apps/server`, `packages/shared`
- add `tsconfig.base.json`
- add a Bun-oriented Docker build

Keep the current app untouched at this step. This phase is only about creating the landing zone.

### Phase 2 - Extract shared contracts first

Start with the most reusable, least risky pieces:

- shared enums and constants
- date helpers
- permission constants
- DTOs and Zod schemas

This is the lowest-risk phase and creates the contract surface for both the new server and new webapp.

### Phase 3 - Extract the server before the new webapp

Build `apps/server` next.

Priority order:

1. auth/session endpoints and middleware
2. planning endpoints
3. monitoring endpoints
4. work-shift-slot mutation endpoints
5. remaining CRUD modules

Reason:

- the frontend rewrite is much easier once the API contract exists
- your current service layer can be ported here with relatively small changes

### Phase 4 - Build the operational SPA first

Create only the operational routes in `webapp` first:

- planning
- daily monitoring
- weekly monitoring

Use:

- TanStack Router for route state
- TanStack Query for fetching and mutations
- a typed API layer generated from your shared contracts or maintained manually

Do not migrate management and finance yet.

### Phase 5 - Cut over operational screens

Once operational is stable in staging:

- route production users to the new operational frontend
- keep management and finance on the old app temporarily if needed
- compare performance, error rate, and operator feedback

This is the safest version of the migration because it keeps the blast radius contained.

### Phase 6 - Migrate the rest of the product

After operational proves itself:

- management pages
- finance pages
- public auth flows
- remaining API routes

At that point, the old Next monolith can be retired.

---

## Deployment shape for a Hostinger VPS

### Recommended deployment model

Since you are staying on a Hostinger VPS, I would optimize for **operational simplicity**, not for theoretical purity.

### Recommended option

- keep Postgres as its own service/container
- build `webapp` as a static SPA
- build `server` as the Bun API
- serve the static webapp either:
  - from Elysia directly, or
  - from an Nginx reverse proxy in front of Elysia

For your environment, the simplest production model is usually:

1. reverse proxy on ports 80/443
2. Bun server for API
3. static webapp assets served from the same host
4. Postgres in Docker or managed separately

### Why this fits better than two fully independent app runtimes

- fewer public ports
- simpler SSL and domain routing
- easier logging and restart behavior on a VPS
- simpler rollback

### Hostinger / Bun note

Running Bun on a Hostinger VPS is feasible if you deploy through Docker or manage the runtime directly on the VPS. The important question is not raw Bun support in the abstract; it is whether your exact container, reverse proxy, and native dependencies behave cleanly in your target environment. I would validate that with a proof of concept before committing to the full migration.

---

## Biggest risks in the migration

1. **Auth rewrite risk**

The current app relies on cookie reads in multiple Next-specific places. Rebuilding that flow cleanly in Elysia + SPA form requires care.

2. **Mutation model rewrite**

Your operational UI is deeply tied to server actions. Replacing that with explicit API mutations is the most important and most invasive application change.

3. **Component complexity**

Some operational components are already very large. Moving them without first simplifying them can carry current complexity into the new stack.

4. **Framework maturity and team familiarity**

TanStack Start is a valid choice, but it is still a much younger ecosystem than Next.js. That is not a blocker, but it matters when troubleshooting production issues.

5. **Native dependency/runtime behavior**

Before committing, validate Bun with your real runtime dependencies, especially the packages that touch native code or server integration.

---

## Go / no-go criteria before starting the full migration

I would not start the full cutover until these are true:

### Technical gates

- Bun build works cleanly in Docker on your VPS target
- Prisma migrations run cleanly in the new server container
- auth cookies behave correctly across SPA + API requests
- at least one operational route is fully working end-to-end in staging

### Product gates

- you have baseline measurements from the current operational pages
- the team agrees that operational is the first migration boundary
- you can keep feature work under control during the transition

If those gates fail, keep optimizing the current Next app and delay the migration.

---

## Final recommendation

### What I would do in your position

I would choose a **hybrid path**:

1. **improve the current operational pages immediately**
2. **stand up the Bun monorepo in parallel**
3. **migrate only the operational area first**
4. **move the rest of the product only after operational proves the value**

### Why

That path gives you the best balance of:

- immediate UX improvement
- lower migration risk
- better long-term architecture
- a deployment model that still fits a single Hostinger VPS

### Bottom line

**Yes, the migration can be worth the energy.**

But the real value is not “Bun is faster than Node” or “TanStack is newer than Next”. The value is that this project has outgrown the current monolith shape for the operational workflow, and a phased monorepo with an explicit SPA + API boundary is a better fit for that part of the system.

If you want, the next best step is to turn this document into a concrete execution checklist for:

- `Phase 0` performance fixes in the current app, or
- `Phase 1` scaffolding of the Bun monorepo
