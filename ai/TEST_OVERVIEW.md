# Test Overview

> Last verified: `2026-03-17` | Files: `25` passed | Tests: `267` passed | Runtime: `~16.7s`

## How It Works

Tests run against a real PostgreSQL container (port 5433). The global setup handles:

1. Start Docker container (`motolink-test-db`)
2. Run `prisma generate` + `prisma migrate deploy`
3. Execute all test files
4. Tear down the container

Each test file calls `cleanDatabase()` in `beforeEach` to truncate all tables with `RESTART IDENTITY CASCADE`.

## Module Service Tests (14 files, 214 tests)

All service tests are integration tests hitting the real test database.

| Module | File | Tests | Coverage Notes |
|--------|------|------:|----------------|
| Work Shift Slots | `work-shift-slots-service.spec.ts` | 42 | Upsert, overlap detection, status transitions, payment sync, copy slots, discounts, ban enforcement |
| Clients | `clients-service.spec.ts` | 27 | CRUD, commercial conditions, soft-delete, listAllSmall, search by name/CNPJ |
| Deliverymen | `deliverymen-service.spec.ts` | 25 | CRUD, soft-delete, toggleBlock, region/client filters, ban exclusion |
| Users | `users-service.spec.ts` | 21 | CRUD, soft-delete, setPassword, session cleanup on delete, email uniqueness |
| Payment Requests | `payment-requests-service.spec.ts` | 17 | CRUD, status updates, history trace assertions, finance field updates |
| Regions | `regions-service.spec.ts` | 16 | CRUD, delete with cascade prevention (active clients/deliverymen) |
| Groups | `groups-service.spec.ts` | 14 | CRUD, delete with cascade prevention (active clients) |
| Sessions | `sessions-service.spec.ts` | 10 | Login, validate, delete, expired session auto-cleanup |
| WhatsApp | `whatsapp-service.spec.ts` | 9 | sendInvite: branch validation, API errors, phone formatting |
| History Traces | `history-traces-service.spec.ts` | 9 | Create with change detection, list with filters, getById |
| Planning | `planning-service.spec.ts` | 9 | Upsert, past-date rejection, list with date range filters |
| Branches | `branches-service.spec.ts` | 5 | getById, listAll with search |
| Monitoring | `monitoring-service.spec.ts` | 4 | Daily/weekly aggregation, group filtering, schema validation |
| Client Blocks | `client-blocks-service.spec.ts` | 3 | Ban clears future slots, preserves current/past, preserves other clients |

## Utility Tests (11 files, 53 tests)

| Utility | File | Tests |
|---------|------|------:|
| Money Mask | `masks/money-mask.spec.ts` | 10 |
| CPF Mask | `masks/cpf-mask.spec.ts` | 6 |
| Phone Mask | `masks/phone-mask.spec.ts` | 6 |
| Check Page Permission | `check-page-permission.spec.ts` | 6 |
| Has Permission | `has-permission.spec.ts` | 5 |
| Password Regex | `password-regex.spec.ts` | 5 |
| Date Mask | `masks/date-mask.spec.ts` | 4 |
| Clean Mask | `masks/clean-mask.spec.ts` | 4 |
| Verify Session | `verify-session.spec.ts` | 4 |
| Convert Decimals | `convert-decimals.spec.ts` | 3 |
| Generate Secure Token | `generate-secure-token.spec.ts` | 3 |

## Strengths

- **Real database**: All service tests hit Postgres with real migrations, not mocks. This catches schema mismatches, constraint violations, and query bugs that mocks would hide.
- **Broad module coverage**: All 14 service modules have dedicated test suites.
- **Complex business logic covered**: Work shift overlap detection, payment request auto-sync, client ban enforcement with slot reassignment, status transition validation.
- **History trace side effects**: Payment request tests verify that mutations create audit traces (pattern established for other modules to follow).
- **Error paths tested**: Not just happy paths but also 404s, 422s, duplicate detection, expired tokens.

## Gaps and Opinion

The service layer is well covered. The biggest risk is **above the service layer**: server actions, route handlers, and cookie flows are almost entirely untested. A bug in permission enforcement on a server action would not be caught. The gap between "the service works" and "the app works correctly when a user clicks a button" is still wide.

Within the service tests, some suites pass a random `loggedUserId` when the service internally fires a history trace. This works because trace failures are swallowed (fire-and-forget), but it means those tests don't verify the audit trail. The payment-request suite already fixed this by creating a real actor user. Other suites should follow the same pattern gradually.

The client-blocks suite has only 3 tests. It covers the most critical behavior (ban clears future slots) but misses unban, isBanned, and listHistoryByDeliveryman.

## TODO

### Missing utility tests (quick wins)

- [ ] `cnpj-mask` — 8 mask files exist, only 5 are tested
- [ ] `cep-mask`
- [ ] `time-mask`
- [ ] `client-cookie` — cookie parsing/setting utility, no coverage at all

### Service test improvements

- [ ] **Client blocks**: Add tests for `unban`, `isBanned`, `listHistoryByDeliveryman` (currently only `ban` is tested with 3 cases)
- [ ] **Monitoring**: Expand beyond 4 tests — add coverage for weekly view edge cases, empty planning, multiple clients per group
- [ ] **Users**: Add tests for `toggleBlock` and `changePassword` methods (exist in service but not tested)
- [ ] **History traces on all services**: Follow the payment-request pattern — use a real actor user and assert trace creation in work-shift-slots, clients, deliverymen, users, and planning suites
- [ ] **Work shift slots**: Add tests for `sendInvite`, `sendBulkInvite`, `getInviteByToken`, `respondToInvite`, `cancelDiscount` (service methods exist but have no test coverage)

### Server actions and route handlers

- [ ] **Sessions actions**: Test that `createSessionAction` sets cookies correctly and `deleteSessionAction` clears them
- [ ] **History traces route handler**: Test the GET `/api/history-traces` endpoint with various query params and auth validation
- [ ] **Permission enforcement**: At least one test proving that server actions reject unauthorized users (currently no server action checks permissions beyond authentication)

### Higher-level tests (lower priority)

- [ ] Login flow end-to-end (form submission -> cookie set -> redirect)
- [ ] Password creation flow (token validation -> password set -> activation)
- [ ] Work shift status transition via UI (monitoring page actions)
