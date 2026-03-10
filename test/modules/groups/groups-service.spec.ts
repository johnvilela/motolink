import { beforeEach, describe, expect, it } from "vitest";

process.env.AUTH_SECRET ??= "test-secret";

import { db } from "../../../src/lib/database";
import { groupsService } from "../../../src/modules/groups/groups-service";
import type { GroupMutateDTO } from "../../../src/modules/groups/groups-types";
import { cleanDatabase } from "../../helpers/clean-database";

// --- Constants -----------------------------------------------------------

const LOGGED_USER_ID = crypto.randomUUID();

// --- Test Data Factories -------------------------------------------------

async function createTestBranch(overrides: { name?: string } = {}) {
  return db.branch.create({
    data: {
      name: overrides.name ?? "Test Branch",
      code: crypto.randomUUID().slice(0, 8),
    },
  });
}

async function createTestGroup(
  overrides: { name?: string; description?: string; branchId?: string } = {},
) {
  const branchId = overrides.branchId ?? (await createTestBranch()).id;
  return db.group.create({
    data: {
      name: overrides.name ?? "Test Group",
      description: overrides.description,
      branchId,
    },
  });
}

async function createTestClient(overrides: {
  groupId?: string;
  branchId?: string;
  isDeleted?: boolean;
} = {}) {
  const branchId = overrides.branchId ?? (await createTestBranch()).id;
  return db.client.create({
    data: {
      name: "Test Client",
      cnpj: "00000000000000",
      cep: "00000000",
      street: "Test Street",
      number: "1",
      city: "Test City",
      neighborhood: "Test Neighborhood",
      uf: "SP",
      contactName: "Contact",
      branchId,
      groupId: overrides.groupId,
      isDeleted: overrides.isDeleted ?? false,
    },
  });
}

// --- Tests ---------------------------------------------------------------

describe("Groups Service", () => {
  const service = groupsService();

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe(".create", () => {
    it("should create a group successfully", async () => {
      const branch = await createTestBranch();
      const body: GroupMutateDTO = {
        name: "Group A",
        branchId: branch.id,
      };

      const result = await service.create(body, LOGGED_USER_ID);

      expect(result.isOk()).toBe(true);
      const group = result._unsafeUnwrap();
      expect(group.name).toBe("Group A");
      expect(group.branchId).toBe(branch.id);
    });

    it("should create a group with description", async () => {
      const branch = await createTestBranch();
      const body: GroupMutateDTO = {
        name: "Group B",
        description: "A test group",
        branchId: branch.id,
      };

      const result = await service.create(body, LOGGED_USER_ID);

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap().description).toBe("A test group");
    });
  });

  describe(".getById", () => {
    it("should return the group when found", async () => {
      const created = await createTestGroup();

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
      const branch = await createTestBranch();
      await createTestGroup({ name: "Group 1", branchId: branch.id });
      await createTestGroup({ name: "Group 2", branchId: branch.id });
      await createTestGroup({ name: "Group 3", branchId: branch.id });

      const result = await service.listAll({ page: 1, pageSize: 2 });

      expect(result.isOk()).toBe(true);
      const { data, pagination } = result._unsafeUnwrap();
      expect(data).toHaveLength(2);
      expect(pagination.total).toBe(3);
      expect(pagination.totalPages).toBe(2);
    });

    it("should filter by search term (name)", async () => {
      const branch = await createTestBranch();
      await createTestGroup({ name: "Alpha Group", branchId: branch.id });
      await createTestGroup({ name: "Beta Group", branchId: branch.id });

      const result = await service.listAll({ page: 1, pageSize: 10, search: "Alpha" });

      expect(result.isOk()).toBe(true);
      const { data } = result._unsafeUnwrap();
      expect(data).toHaveLength(1);
      expect(data[0].name).toBe("Alpha Group");
    });

    it("should filter by branchId", async () => {
      const branch1 = await createTestBranch({ name: "Branch 1" });
      const branch2 = await createTestBranch({ name: "Branch 2" });
      await createTestGroup({ name: "Group A", branchId: branch1.id });
      await createTestGroup({ name: "Group B", branchId: branch2.id });

      const result = await service.listAll({ page: 1, pageSize: 10, branchId: branch1.id });

      expect(result.isOk()).toBe(true);
      const { data } = result._unsafeUnwrap();
      expect(data).toHaveLength(1);
      expect(data[0].name).toBe("Group A");
    });

    it("should return empty result when no groups match", async () => {
      const result = await service.listAll({ page: 1, pageSize: 10, search: "Nonexistent" });

      expect(result.isOk()).toBe(true);
      const { data, pagination } = result._unsafeUnwrap();
      expect(data).toHaveLength(0);
      expect(pagination.total).toBe(0);
    });
  });

  describe(".update", () => {
    it("should update a group successfully", async () => {
      const branch = await createTestBranch();
      const created = await createTestGroup({ branchId: branch.id });

      const result = await service.update(
        created.id,
        { name: "Updated Group", branchId: branch.id },
        LOGGED_USER_ID,
      );

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap().name).toBe("Updated Group");
    });

    it("should return 404 when group is not found", async () => {
      const branch = await createTestBranch();

      const result = await service.update(
        crypto.randomUUID(),
        { name: "Updated", branchId: branch.id },
        LOGGED_USER_ID,
      );

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr().statusCode).toBe(404);
    });
  });

  describe(".delete", () => {
    it("should delete a group successfully when no active clients are assigned", async () => {
      const created = await createTestGroup();

      const result = await service.delete(created.id, LOGGED_USER_ID);

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual({ id: created.id });
    });

    it("should return 404 when group is not found", async () => {
      const result = await service.delete(crypto.randomUUID(), LOGGED_USER_ID);

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr().statusCode).toBe(404);
    });

    it("should return 422 when group has active clients", async () => {
      const branch = await createTestBranch();
      const group = await createTestGroup({ branchId: branch.id });
      await createTestClient({ groupId: group.id, branchId: branch.id });

      const result = await service.delete(group.id, LOGGED_USER_ID);

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr().statusCode).toBe(422);
    });

    it("should allow deletion when all assigned clients are soft-deleted", async () => {
      const branch = await createTestBranch();
      const group = await createTestGroup({ branchId: branch.id });
      await createTestClient({ groupId: group.id, branchId: branch.id, isDeleted: true });

      const result = await service.delete(group.id, LOGGED_USER_ID);

      expect(result.isOk()).toBe(true);
    });
  });
});
