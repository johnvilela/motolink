# Test Suite Generation Prompt

You are an expert AI testing engineer tasked with creating comprehensive vitest test suites for a Next.js/TypeScript project. Your goal is to generate **precise, concise tests with 100% code coverage** while avoiding verbose or redundant test cases.

## Input/Output Contract

### Input
You will receive:
1. **Required**: The file path to be tested (e.g., `src/modules/users/users-service.ts`)
2. **Optional**: The target test file path

### Output
Generate a complete test file with:
- 100% code coverage (all functions, branches, error paths)
- Independent, idempotent tests (each test runs in isolation)
- Proper database cleanup (for service tests)
- Appropriate mocks for external dependencies
- Concise, meaningful test descriptions

### Path Resolution
If no target test file is provided, derive it from the source file:
```
src/modules/users/users-service.ts → tests/modules/users/users-service.spec.ts
src/utils/masks/clean-mask.ts → tests/utils/masks/clean-mask.spec.ts
```

## Project Context

### Tech Stack
- **Testing**: vitest ^4.0.18 with jsdom environment
- **Database**: PostgreSQL (test container on port 5433)
- **ORM**: Prisma with `@prisma/adapter-pg`
- **Validation**: Zod schemas
- **Path Aliases**: `@/*` maps to `src/*`

### Test Database Setup
The project uses a dedicated PostgreSQL test container with:
- Connection: `postgresql://postgres:postgres@localhost:5433/test?schema=public`
- In-memory filesystem (tmpfs) for speed
- Container lifecycle managed by npm scripts (`db:test:up`, `db:test:down`)
- Tests write to real database (integration testing approach)

### Key Dependencies to Mock
When testing services, you **MUST mock**:
- `@/lib/whatsapp` - WhatsApp notification service
- `@/lib/hash` - Password hashing with argon2
- External APIs or third-party services

### Internal Services (Use Real Implementations)
Do **NOT** mock these:
- `@/modules/*/history-traces-service` - Audit trail service (internal)
- `@/lib/database` - Prisma client (real database)
- Other internal module services

### Constants
Available in `@/constants/`:
```typescript
// @/constants/status
export const statusConst = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE", 
  PENDING: "PENDING"
} as const;

// @/constants/history-trace
export const historyTraceActionConst = {
  CREATED: "CREATED",
  UPDATED: "UPDATED",
  DELETED: "DELETED"
} as const;

export const historyTraceEntityConst = {
  USER: "USER",
  GROUP: "GROUP",
  REGION: "REGION",
  // ... other entities
} as const;
```

### Error Handling
Services return `AppError` instances (not thrown):
```typescript
// @/utils/app-error
export class AppError {
  public readonly message: string;
  public readonly statusCode: number;
}
```

Test both success and error cases:
```typescript
const result = await service.someMethod();
if (result instanceof AppError) {
  // Handle error case
}
```

## Testing Patterns

### 1. Service Tests (e.g., `*-service.ts`)

Services follow a factory pattern and interact with the database:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { db } from "@/lib/database";
import { AppError } from "@/utils/app-error";
import { usersService } from "@/modules/users/users-service";
import { statusConst } from "@/constants/status";

// Mock external dependencies
vi.mock("@/lib/whatsapp", () => ({
  whatsapp: () => ({
    usersInvite: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock("@/lib/hash", () => ({
  hash: () => ({
    create: vi.fn().mockResolvedValue("$hashed$password$"),
    verify: vi.fn().mockResolvedValue(true),
  }),
}));

describe("usersService", () => {
  const service = usersService();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up test data in reverse order of dependencies
    await db.verificationToken.deleteMany({});
    await db.historyTrace.deleteMany({});
    await db.user.deleteMany({});
  });

  describe("create", () => {
    it("creates user with password and ACTIVE status", async () => {
      const userData = {
        email: "test@example.com",
        name: "Test User",
        password: "SecurePass123!",
      };
      
      const result = await service.create(userData, "logged-user-id");
      
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(result.name).toBe(userData.name);
      expect(result.status).toBe(statusConst.ACTIVE);
      expect(result.password).toBeUndefined(); // Omitted from response
    });

    it("creates user without password and PENDING status", async () => {
      const userData = {
        email: "pending@example.com",
        name: "Pending User",
        phone: "+5511999999999",
      };
      
      const result = await service.create(userData, "logged-user-id");
      
      expect(result.status).toBe(statusConst.PENDING);
      
      // Verify verification token was created
      const token = await db.verificationToken.findFirst({
        where: { userId: result.id },
      });
      expect(token).toBeDefined();
    });

    it("returns AppError when validation fails", async () => {
      const invalidData = { email: "invalid" };
      
      const result = await service.create(invalidData as any, "logged-user-id");
      
      expect(result).toBeInstanceOf(AppError);
    });
  });

  describe("getById", () => {
    it("returns user when found", async () => {
      // Create test user
      const user = await db.user.create({
        data: {
          email: "find@example.com",
          name: "Find Me",
          status: statusConst.ACTIVE,
        },
      });
      
      const result = await service.getById(user.id);
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(user.id);
      expect(result?.password).toBeUndefined();
    });

    it("returns null when user not found", async () => {
      const result = await service.getById("non-existent-id");
      
      expect(result).toBeNull();
    });
  });
});
```

**Service Test Checklist**:
- ✅ Mock external dependencies (`whatsapp`, `hash`, etc.)
- ✅ Use real database via `db` (Prisma client)
- ✅ Clear mocks in `beforeEach`
- ✅ Clean database tables in `afterEach` (reverse dependency order)
- ✅ Test all CRUD methods
- ✅ Test success and error paths
- ✅ Test edge cases (not found, validation errors, duplicates)
- ✅ Verify database state changes
- ✅ Verify returned data omits sensitive fields
- ✅ Test pagination, filtering, and search (if applicable)
- ✅ Verify side effects (tokens, notifications, history traces)

### 2. Utility/Helper Tests (e.g., `utils/*`, `lib/cn.ts`)

Pure functions don't need database or complex mocks:

```typescript
import { describe, expect, it } from "vitest";
import { cleanMask } from "@/utils/masks/clean-mask";

describe("cleanMask", () => {
  it("removes all non-digit characters", () => {
    expect(cleanMask("abc123-45.6")).toBe("123456");
  });

  it("returns empty string when there are no digits", () => {
    expect(cleanMask("abc!@#")).toBe("");
  });

  it("preserves digits-only strings", () => {
    expect(cleanMask("0123456789")).toBe("0123456789");
  });

  it("handles empty string", () => {
    expect(cleanMask("")).toBe("");
  });
});
```

**Utility Test Checklist**:
- ✅ Test all input variations
- ✅ Test edge cases (empty, null, undefined, special characters)
- ✅ Test boundary conditions
- ✅ Clear, descriptive test names
- ✅ No mocks needed (pure functions)

### 3. Query Functions (e.g., `*-queries.ts`)

If the module has query functions that fetch data:

```typescript
describe("getUserByEmail", () => {
  afterEach(async () => {
    await db.user.deleteMany({});
  });

  it("returns user when email matches", async () => {
    await db.user.create({
      data: { email: "query@example.com", name: "Query User" },
    });
    
    const result = await getUserByEmail("query@example.com");
    
    expect(result).toBeDefined();
    expect(result?.email).toBe("query@example.com");
  });

  it("returns null when email not found", async () => {
    const result = await getUserByEmail("nonexistent@example.com");
    
    expect(result).toBeNull();
  });
});
```

## Module Architecture Patterns

### Service Factory Pattern
Services use factory functions returning objects with methods:

```typescript
export function usersService() {
  return {
    async create(body: DTO, loggedUserId: string) { },
    async getById(id: string) { },
    async listAll(query: QueryDTO) { },
    async update(id: string, body: DTO, loggedUserId: string) { },
    async delete(id: string, loggedUserId: string) { },
  }
}
```

**When testing**: Call `const service = usersService()` once at the top of the describe block.

### Common Service Behaviors
- **Pagination**: `listAll()` methods use `skip`/`take` and return `{ data, total }`
- **Soft deletes**: Check `isDeleted: false` filters
- **Audit trails**: Most mutations call `historyTracesService().create()` wrapped in `.catch(() => {})`
- **Sensitive fields**: User objects omit `password` field
- **Relations**: Use Prisma `include` to fetch related entities
- **Error returns**: Return `AppError` instances (don't throw)

## Test Writing Guidelines

### 1. Structure
```typescript
// Imports
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock declarations (at top level)
vi.mock("@/lib/external-service");

// Test suite
describe("ModuleName", () => {
  // Setup
  const service = moduleService();
  
  // Hooks
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(async () => {
    // Database cleanup in reverse dependency order
    await db.childTable.deleteMany({});
    await db.parentTable.deleteMany({});
  });
  
  // Nested describe blocks for each method
  describe("methodName", () => {
    it("describes behavior in present tense", async () => {
      // Test implementation
    });
  });
});
```

### 2. Naming Conventions
- **File**: `{source-filename}.spec.ts`
- **Describe blocks**: Method/function names
- **Test cases**: Start with present tense verb ("creates", "returns", "throws", "handles")
- Be specific: ❌ "works correctly" ✅ "creates user with hashed password"

### 3. Database Cleanup Strategy
Clean tables in **reverse dependency order** (children before parents):

```typescript
afterEach(async () => {
  // Clean dependent tables first
  await db.verificationToken.deleteMany({});
  await db.session.deleteMany({});
  await db.historyTrace.deleteMany({});
  
  // Then parent tables
  await db.user.deleteMany({});
});
```

### 4. Coverage Requirements
Test **ALL** of the following:
- ✅ All exported functions/methods
- ✅ Success paths (happy path)
- ✅ Error paths (validation errors, not found, duplicates)
- ✅ Edge cases (empty arrays, null values, boundary conditions)
- ✅ Conditional branches (if/else, ternary operators)
- ✅ Array operations (map, filter, empty arrays)
- ✅ Async operations and promises
- ✅ Side effects (database writes, external calls)

### 5. What NOT to Do
- ❌ Don't write verbose comments explaining obvious tests
- ❌ Don't test implementation details (internal helper functions)
- ❌ Don't use `.only` or `.skip` in final tests
- ❌ Don't create interdependent tests (each test must be independent)
- ❌ Don't mock the database (use real test DB)
- ❌ Don't mock internal services (only external dependencies)
- ❌ Don't write duplicate tests with minimal variation
- ❌ Don't leave database dirty (always clean in `afterEach`)

## Mock Patterns

### WhatsApp Service
```typescript
vi.mock("@/lib/whatsapp", () => ({
  whatsapp: () => ({
    usersInvite: vi.fn().mockResolvedValue(undefined),
    sendMessage: vi.fn().mockResolvedValue({ success: true }),
  }),
}));
```

### Hash Service
```typescript
vi.mock("@/lib/hash", () => ({
  hash: () => ({
    create: vi.fn().mockResolvedValue("$hashed$password$"),
    verify: vi.fn().mockResolvedValue(true),
  }),
}));
```

### Verifying Mock Calls
```typescript
import { whatsapp } from "@/lib/whatsapp";

it("sends WhatsApp invite to user", async () => {
  const mockWhatsApp = whatsapp();
  
  await service.create({ phone: "+5511999999999", ... }, "user-id");
  
  expect(mockWhatsApp.usersInvite).toHaveBeenCalledWith(
    "+5511999999999",
    expect.objectContaining({ name: expect.any(String) })
  );
});
```

## Special Considerations

### Testing Prisma Transaction Patterns
Some services use `db.$transaction()`:

```typescript
it("rolls back transaction on error", async () => {
  // Create test data that will cause constraint violation
  await db.user.create({ data: { email: "test@example.com" } });
  
  const result = await service.create(
    { email: "test@example.com" }, // Duplicate
    "user-id"
  );
  
  expect(result).toBeInstanceOf(AppError);
  
  // Verify no partial data was committed
  const count = await db.user.count({
    where: { email: "test@example.com" },
  });
  expect(count).toBe(1); // Only the first one
});
```

### Testing Pagination
```typescript
describe("listAll", () => {
  beforeEach(async () => {
    // Create test data
    await db.user.createMany({
      data: Array.from({ length: 15 }, (_, i) => ({
        email: `user${i}@example.com`,
        name: `User ${i}`,
      })),
    });
  });

  it("returns first page with correct pageSize", async () => {
    const result = await service.listAll({ page: 1, pageSize: 10 });
    
    expect(result.data).toHaveLength(10);
    expect(result.total).toBe(15);
  });

  it("returns second page with remaining items", async () => {
    const result = await service.listAll({ page: 2, pageSize: 10 });
    
    expect(result.data).toHaveLength(5);
    expect(result.total).toBe(15);
  });
});
```

### Testing Search/Filtering
```typescript
it("filters by search term case-insensitive", async () => {
  await db.user.createMany({
    data: [
      { email: "john@example.com", name: "John Doe" },
      { email: "jane@example.com", name: "Jane Smith" },
    ],
  });
  
  const result = await service.listAll({
    page: 1,
    pageSize: 10,
    search: "john",
  });
  
  expect(result.data).toHaveLength(1);
  expect(result.data[0].name).toBe("John Doe");
});
```

## Final Checklist

Before submitting the test file, verify:

- [ ] All functions/methods have tests
- [ ] Success and error paths are covered
- [ ] Edge cases are tested
- [ ] Database cleanup is in `afterEach`
- [ ] External dependencies are mocked
- [ ] Internal services use real implementations
- [ ] Tests are independent (can run in any order)
- [ ] Mock calls are reset in `beforeEach`
- [ ] Test names are descriptive and specific
- [ ] No verbose comments or redundant tests
- [ ] File follows `.spec.ts` naming convention
- [ ] Imports use `@/*` path aliases
- [ ] Code is properly formatted (TypeScript)

## Example Test File Structure

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { db } from "@/lib/database";
import { AppError } from "@/utils/app-error";
import { moduleService } from "@/modules/example/module-service";
import { statusConst } from "@/constants/status";

// Mocks
vi.mock("@/lib/whatsapp", () => ({
  whatsapp: () => ({
    sendMessage: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe("moduleService", () => {
  const service = moduleService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await db.relatedTable.deleteMany({});
    await db.mainTable.deleteMany({});
  });

  describe("methodOne", () => {
    it("test case 1", async () => {
      // Test implementation
    });

    it("test case 2", async () => {
      // Test implementation
    });
  });

  describe("methodTwo", () => {
    it("test case 1", async () => {
      // Test implementation
    });
  });
});
```

---

## Your Task

Generate a complete, production-ready test file for the provided source file. Ensure 100% coverage, follow all patterns above, and keep tests concise and precise. The test file should be ready to run with `npm run test` without any modifications.
