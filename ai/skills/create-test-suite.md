# Skill: create-test-suite

## Inputs

Before starting, collect the following from the user:

| Input | Description | Example |
|---|---|---|
| **Source file path** | Relative path to the file that needs tests | `src/modules/users/users-service.ts` |
| **Test category** | `service` (integration, uses DB) or `unit` (pure logic, no DB). If not provided, infer from file location: files matching `src/modules/*/**-service.ts` get `service` tests; everything else gets `unit` tests. | `service` |
| **Methods / exports to test** | (Optional) Specific methods or exports to cover. If omitted, test all public exports. | `create`, `getById`, `listAll` |

Use these inputs to drive every decision: file path, imports, setup/teardown, and assertion style.

---

## Purpose

Guide an AI agent to create a test suite for an existing source file in the Motolink project using Vitest. The skill covers two categories — **service tests** (integration tests with a real database) and **unit tests** (no database) — and ensures every test file follows the project's established conventions.

This skill only creates the test file. It does not modify the source file, Prisma schema, constants, or any other project file.

---

## Test File Placement and Naming

Test files mirror the `src/` structure under the `test/` directory:

```
src/modules/users/users-service.ts    → test/modules/users/users-service.spec.ts
src/utils/password-regex.ts           → test/utils/password-regex.spec.ts
src/lib/some-helper.ts                → test/lib/some-helper.spec.ts
```

**Rules:**
- Replace the `src/` prefix with `test/`
- Append `.spec.ts` to the base file name (strip the original `.ts`)
- Never use `.test.ts` — always `.spec.ts`
- Create intermediate directories as needed to mirror the source path

---

## Deciding the Test Category

| Source file location | Category | Reason |
|---|---|---|
| `src/modules/*/**-service.ts` | **Service test** (integration) | Services use `db.*` and require a real database |
| Everything else (`src/utils/*`, `src/lib/*`, types, constants, etc.) | **Unit test** | Pure functions or simple logic with no DB dependency |

When a service test needs to mock external I/O (e.g., `fetch`), it is still a service test — the DB setup remains, and mocking is added on top.

---

## 1. Service Test Template (Integration)

Use this template for `*-service.ts` files. These tests run against a real PostgreSQL test database.

```typescript
import { beforeEach, describe, expect, it } from "vitest";
// Add `afterEach, vi` to the import above ONLY if the service calls external APIs (fetch, etc.)

// Environment variables MUST be set BEFORE any src/ imports
process.env.AUTH_SECRET ??= "test-secret";
// Add other required env vars the same way (??= so they don't overwrite CI values)

import { db } from "../../../src/lib/database";
import { widgetsService } from "../../../src/modules/widgets/widgets-service";
import type { WidgetMutateDTO } from "../../../src/modules/widgets/widgets-types";
import { cleanDatabase } from "../../helpers/clean-database";

// --- Constants -----------------------------------------------------------

const LOGGED_USER_ID = crypto.randomUUID();

const BASE_BODY: WidgetMutateDTO = {
  name: "Test Widget",
  // ... all required fields with valid defaults
};

// --- Test Data Factories -------------------------------------------------

async function createTestWidget(
  overrides: { name?: string; status?: string } = {},
) {
  return db.widget.create({
    data: {
      name: overrides.name ?? "Test Widget",
      status: overrides.status ?? "ACTIVE",
      // ... other required DB fields with defaults
    },
  });
}

// --- Tests ---------------------------------------------------------------

describe("Widgets Service", () => {
  const service = widgetsService();

  beforeEach(async () => {
    await cleanDatabase();
  });

  // Add this block ONLY when mocking (e.g., fetch):
  // afterEach(() => {
  //   vi.restoreAllMocks();
  // });

  describe(".create", () => {
    it("should create a widget successfully", async () => {
      const result = await service.create(BASE_BODY, LOGGED_USER_ID);

      expect(result.isOk()).toBe(true);

      const widget = result._unsafeUnwrap();
      expect(widget.name).toBe("Test Widget");
    });

    it("should return error when validation fails", async () => {
      const result = await service.create(
        { ...BASE_BODY, name: "" },
        LOGGED_USER_ID,
      );

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr().statusCode).toBe(400);
    });
  });

  describe(".getById", () => {
    it("should return the entity when found", async () => {
      const created = await createTestWidget();

      const result = await service.getById(created.id);

      expect(result.isOk()).toBe(true);
      // biome-ignore lint/style/noNonNullAssertion: Test assertion
      expect(result._unsafeUnwrap()!.id).toBe(created.id);
    });

    it("should return 404 when not found", async () => {
      const result = await service.getById(crypto.randomUUID());

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr().statusCode).toBe(404);
    });
  });

  describe(".listAll", () => {
    it("should return paginated results", async () => {
      await createTestWidget({ name: "W1" });
      await createTestWidget({ name: "W2" });
      await createTestWidget({ name: "W3" });

      const result = await service.listAll({ page: 1, pageSize: 2 });

      expect(result.isOk()).toBe(true);
      const { data, pagination } = result._unsafeUnwrap();
      expect(data).toHaveLength(2);
      expect(pagination.total).toBe(3);
      expect(pagination.totalPages).toBe(2);
    });

    it("should filter by search term", async () => {
      await createTestWidget({ name: "Alpha" });
      await createTestWidget({ name: "Beta" });

      const result = await service.listAll({
        page: 1,
        pageSize: 10,
        search: "Alpha",
      });

      expect(result.isOk()).toBe(true);
      const { data } = result._unsafeUnwrap();
      expect(data).toHaveLength(1);
      expect(data[0].name).toBe("Alpha");
    });
  });

  describe(".update", () => {
    it("should update the entity successfully", async () => {
      const created = await createTestWidget();

      const result = await service.update(
        created.id,
        { ...BASE_BODY, name: "Updated" },
        LOGGED_USER_ID,
      );

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap().name).toBe("Updated");
    });

    it("should return 404 when entity is not found", async () => {
      const result = await service.update(
        crypto.randomUUID(),
        BASE_BODY,
        LOGGED_USER_ID,
      );

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr().statusCode).toBe(404);
    });
  });

  describe(".delete", () => {
    it("should delete the entity successfully", async () => {
      const created = await createTestWidget();

      const result = await service.delete(created.id, LOGGED_USER_ID);

      expect(result.isOk()).toBe(true);
    });

    it("should return 404 when entity is not found", async () => {
      const result = await service.delete(
        crypto.randomUUID(),
        LOGGED_USER_ID,
      );

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr().statusCode).toBe(404);
    });
  });
});
```

### Service Test Rules

- All `src/` imports use **relative paths** (typically `../../../src/...` for modules three levels deep) — adjust depth based on actual file location
- The `cleanDatabase` helper is imported from `../../helpers/clean-database`
- **Never** use the `@/` alias in service tests
- **Environment variables** go at the very top, before any `src/` import, using `??=` so they don't overwrite CI values
- **One top-level `describe`** with the service name (e.g., `"Widgets Service"`)
- **Instantiate service once** outside of `beforeEach`: `const service = widgetsService();`
- **`beforeEach`** always calls `await cleanDatabase()` for test isolation
- **Group by method** using nested `describe(".methodName", () => { ... })`

---

## 2. Unit Test Template

Use this template for utility functions, constants, regex patterns, and any pure logic without database access.

```typescript
import { describe, expect, it } from "vitest";
import { calculateTotal } from "@/utils/calculate-total";

describe("calculateTotal", () => {
  it("returns zero for an empty list", () => {
    expect(calculateTotal([])).toBe(0);
  });

  it("sums positive values", () => {
    expect(calculateTotal([10, 20, 30])).toBe(60);
  });

  it("handles negative values", () => {
    expect(calculateTotal([10, -5])).toBe(5);
  });
});
```

### Unit Test Rules

- Import the target using the `@/` alias (e.g., `import { foo } from "@/utils/foo"`)
- No `beforeEach`, no `cleanDatabase`, no `db` import
- No `afterEach` or `vi` unless mocking is genuinely needed
- Keep tests simple: call function, assert output
- One top-level `describe` named after the export under test

---

## 3. Result Pattern Assertions

All service methods return `neverthrow` Result types. Use these assertion patterns:

### Success path

```typescript
expect(result.isOk()).toBe(true);

const value = result._unsafeUnwrap();
expect(value.id).toBeDefined();
expect(value.name).toBe("expected");
```

### Error path

```typescript
expect(result.isErr()).toBe(true);
expect(result._unsafeUnwrapErr().statusCode).toBe(404);
```

### Destructuring paginated results

```typescript
expect(result.isOk()).toBe(true);
const { data, pagination } = result._unsafeUnwrap();
expect(data).toHaveLength(2);
expect(pagination.total).toBe(5);
expect(pagination.totalPages).toBe(3);
```

---

## 4. Test Data Factory Pattern

Each service test file defines its own **local** factory functions. They are never shared across files.

```typescript
async function createTestWidget(
  overrides: { name?: string; status?: string; isDeleted?: boolean } = {},
) {
  return db.widget.create({
    data: {
      name: overrides.name ?? "Test Widget",
      status: overrides.status ?? "ACTIVE",
      isDeleted: overrides.isDeleted ?? false,
      // provide sensible defaults for ALL required DB columns
    },
  });
}
```

**Rules:**
- Accept an `overrides` object with all optional fields
- Default every field with `??` (nullish coalescing)
- Use `db.*` directly — never go through the service for setup data
- When a factory needs related records (e.g., a branch for a user), create separate factory functions: `createTestUser()`, `createTestBranch()`

---

## 5. Mocking Pattern (vi.spyOn)

Use mocking **only** when the service calls external APIs (e.g., `fetch`). Database calls are **never** mocked.

### Setup

Add `afterEach, vi` to the vitest import and restore mocks after each test:

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Inside the top-level describe:
afterEach(() => {
  vi.restoreAllMocks();
});
```

### Mocking fetch — success

```typescript
vi.spyOn(global, "fetch").mockResolvedValueOnce(
  new Response(null, { status: 200 }),
);
```

### Mocking fetch — failure (non-ok response)

```typescript
vi.spyOn(global, "fetch").mockResolvedValueOnce(
  new Response(null, { status: 500 }),
);
```

### Mocking fetch — network error

```typescript
vi.spyOn(global, "fetch").mockRejectedValueOnce(
  new Error("Network failure"),
);
```

### Asserting fetch was called correctly

```typescript
const fetchSpy = vi
  .spyOn(global, "fetch")
  .mockResolvedValueOnce(new Response(null, { status: 200 }));

await service.someMethod(args);

const [url, init] = fetchSpy.mock.calls[0];
expect(url).toBe("http://expected-url/api/endpoint");
expect((init?.headers as Record<string, string>)["X-Api-Key"]).toBe("expected-key");

const body = JSON.parse(init?.body as string);
expect(body.field).toBe("expected-value");
```

---

## 6. Non-null Assertion Convention

When accessing a property on a value that TypeScript considers possibly null but the test has proven it exists, use this comment to suppress the linter:

```typescript
// biome-ignore lint/style/noNonNullAssertion: Test assertion
expect(value!.property).toBe(expected);
```

---

## 7. What to Test — Checklist

1. **Read the source file** to identify all public methods/exports
2. **Determine the test category** (service vs. unit) based on file location
3. **Create the test file** at the correct mirror path under `test/`
4. **For service tests:** identify which Prisma models the service uses, then write factory functions for each
5. **For each method, write tests covering:**
   - Happy path (success case)
   - Not-found case (404) if the method does a lookup
   - Validation / business-rule errors (400, 422) if the method validates input
   - Auth / permission errors (401, 403) if applicable
   - Edge cases specific to the business logic (e.g., soft-delete already deleted, duplicate email)
6. **For methods calling external APIs:** add mock tests for success, non-ok response, and network error
7. **Verify** the file runs: `pnpm vitest run <test-file-path>`

---

## 8. Key Patterns Cheatsheet

| Concern | Pattern |
|---|---|
| Test file location | `src/a/b/c.ts` → `test/a/b/c.spec.ts` |
| Test file extension | Always `.spec.ts`, never `.test.ts` |
| Service test imports | Relative paths: `../../../src/...` |
| Unit test imports | Alias: `@/utils/foo` |
| DB cleanup | `beforeEach(async () => { await cleanDatabase(); })` |
| Service instantiation | `const service = fooService();` — outside `beforeEach` |
| Success assertion | `expect(result.isOk()).toBe(true); result._unsafeUnwrap()` |
| Error assertion | `expect(result.isErr()).toBe(true); result._unsafeUnwrapErr().statusCode` |
| Test grouping | `describe(".methodName", () => { ... })` |
| Factory functions | Local `async function createTestX(overrides = {})` using `db.*` |
| Default input body | `const BASE_BODY: DtoType = { ... }` with all required fields |
| Logged user ID | `const LOGGED_USER_ID = crypto.randomUUID()` |
| Mock setup | `vi.spyOn(global, "fetch").mockResolvedValueOnce(...)` |
| Mock teardown | `afterEach(() => { vi.restoreAllMocks(); })` |
| Non-null assertion | `// biome-ignore lint/style/noNonNullAssertion: Test assertion` |
| Env vars | `process.env.VAR ??= "value"` before `src/` imports |
| Run single test file | `pnpm vitest run test/path/to/file.spec.ts` |
