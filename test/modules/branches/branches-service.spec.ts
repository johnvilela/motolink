import { beforeEach, describe, expect, it } from "vitest";

process.env.AUTH_SECRET ??= "test-secret";

import { db } from "../../../src/lib/database";
import { branchesService } from "../../../src/modules/branches/branches-service";
import type { BranchListQueryDTO } from "../../../src/modules/branches/branches-types";
import { cleanDatabase } from "../../helpers/clean-database";

// --- Constants -----------------------------------------------------------

const BASE_QUERY: BranchListQueryDTO = {
  page: 1,
  pageSize: 10,
};

// --- Test Data Factories -------------------------------------------------

async function createTestBranch(
  overrides: { name?: string; code?: string } = {},
) {
  return db.branch.create({
    data: {
      name: overrides.name ?? "Test Branch",
      code: overrides.code ?? crypto.randomUUID().slice(0, 8),
    },
  });
}

// --- Tests ---------------------------------------------------------------

describe("Branches Service", () => {
  const service = branchesService();

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe(".getById", () => {
    it("should return the branch when found", async () => {
      const created = await createTestBranch();

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
      await createTestBranch({ name: "Branch 1" });
      await createTestBranch({ name: "Branch 2" });
      await createTestBranch({ name: "Branch 3" });

      const result = await service.listAll({ ...BASE_QUERY, pageSize: 2 });

      expect(result.isOk()).toBe(true);
      const { data, pagination } = result._unsafeUnwrap();
      expect(data).toHaveLength(2);
      expect(pagination.total).toBe(3);
      expect(pagination.totalPages).toBe(2);
    });

    it("should filter by search term (name)", async () => {
      await createTestBranch({ name: "Alpha Branch" });
      await createTestBranch({ name: "Beta Branch" });

      const result = await service.listAll({ ...BASE_QUERY, search: "Alpha" });

      expect(result.isOk()).toBe(true);
      const { data } = result._unsafeUnwrap();
      expect(data).toHaveLength(1);
      expect(data[0].name).toBe("Alpha Branch");
    });

    it("should filter by search term (code)", async () => {
      await createTestBranch({ code: "UNIQUE01" });
      await createTestBranch({ code: "OTHER002" });

      const result = await service.listAll({
        ...BASE_QUERY,
        search: "UNIQUE01",
      });

      expect(result.isOk()).toBe(true);
      const { data } = result._unsafeUnwrap();
      expect(data).toHaveLength(1);
      expect(data[0].code).toBe("UNIQUE01");
    });
  });
});
