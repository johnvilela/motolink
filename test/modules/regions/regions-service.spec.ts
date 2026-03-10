import { beforeEach, describe, expect, it } from "vitest";

process.env.AUTH_SECRET ??= "test-secret";

import { db } from "../../../src/lib/database";
import { regionsService } from "../../../src/modules/regions/regions-service";
import type { RegionMutateDTO } from "../../../src/modules/regions/regions-types";
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

async function createTestRegion(overrides: { name?: string; description?: string; branchId?: string } = {}) {
  const branchId = overrides.branchId ?? (await createTestBranch()).id;
  return db.region.create({
    data: {
      name: overrides.name ?? "Test Region",
      description: overrides.description,
      branchId,
    },
  });
}

async function createTestClient(overrides: { regionId?: string; branchId?: string; isDeleted?: boolean } = {}) {
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
      regionId: overrides.regionId,
      isDeleted: overrides.isDeleted ?? false,
    },
  });
}

async function createTestDeliveryman(overrides: { regionId?: string; branchId?: string; isDeleted?: boolean } = {}) {
  const branchId = overrides.branchId ?? (await createTestBranch()).id;
  return db.deliveryman.create({
    data: {
      name: "Test Deliveryman",
      document: "00000000000",
      phone: "11999999999",
      contractType: "CLT",
      mainPixKey: "pix@test.com",
      branchId,
      regionId: overrides.regionId,
      isDeleted: overrides.isDeleted ?? false,
    },
  });
}

// --- Tests ---------------------------------------------------------------

describe("Regions Service", () => {
  const service = regionsService();

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe(".create", () => {
    it("should create a region successfully", async () => {
      const branch = await createTestBranch();
      const body: RegionMutateDTO = {
        name: "North Region",
        branchId: branch.id,
      };

      const result = await service.create(body, LOGGED_USER_ID);

      expect(result.isOk()).toBe(true);
      const region = result._unsafeUnwrap();
      expect(region.name).toBe("North Region");
      expect(region.branchId).toBe(branch.id);
    });

    it("should create a region with description", async () => {
      const branch = await createTestBranch();
      const body: RegionMutateDTO = {
        name: "South Region",
        description: "Covers the southern area",
        branchId: branch.id,
      };

      const result = await service.create(body, LOGGED_USER_ID);

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap().description).toBe("Covers the southern area");
    });
  });

  describe(".getById", () => {
    it("should return the region when found", async () => {
      const created = await createTestRegion();

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
      await createTestRegion({ name: "Region 1", branchId: branch.id });
      await createTestRegion({ name: "Region 2", branchId: branch.id });
      await createTestRegion({ name: "Region 3", branchId: branch.id });

      const result = await service.listAll({ page: 1, pageSize: 2 });

      expect(result.isOk()).toBe(true);
      const { data, pagination } = result._unsafeUnwrap();
      expect(data).toHaveLength(2);
      expect(pagination.total).toBe(3);
      expect(pagination.totalPages).toBe(2);
    });

    it("should filter by search term (name)", async () => {
      const branch = await createTestBranch();
      await createTestRegion({ name: "North Zone", branchId: branch.id });
      await createTestRegion({ name: "South Zone", branchId: branch.id });

      const result = await service.listAll({ page: 1, pageSize: 10, search: "North" });

      expect(result.isOk()).toBe(true);
      const { data } = result._unsafeUnwrap();
      expect(data).toHaveLength(1);
      expect(data[0].name).toBe("North Zone");
    });

    it("should filter by branchId", async () => {
      const branch1 = await createTestBranch({ name: "Branch 1" });
      const branch2 = await createTestBranch({ name: "Branch 2" });
      await createTestRegion({ name: "Region A", branchId: branch1.id });
      await createTestRegion({ name: "Region B", branchId: branch2.id });

      const result = await service.listAll({ page: 1, pageSize: 10, branchId: branch1.id });

      expect(result.isOk()).toBe(true);
      const { data } = result._unsafeUnwrap();
      expect(data).toHaveLength(1);
      expect(data[0].name).toBe("Region A");
    });

    it("should return empty result when no regions match", async () => {
      const result = await service.listAll({ page: 1, pageSize: 10, search: "Nonexistent" });

      expect(result.isOk()).toBe(true);
      const { data, pagination } = result._unsafeUnwrap();
      expect(data).toHaveLength(0);
      expect(pagination.total).toBe(0);
    });
  });

  describe(".update", () => {
    it("should update a region successfully", async () => {
      const branch = await createTestBranch();
      const created = await createTestRegion({ branchId: branch.id });

      const result = await service.update(created.id, { name: "Updated Region", branchId: branch.id }, LOGGED_USER_ID);

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap().name).toBe("Updated Region");
    });

    it("should return 404 when region is not found", async () => {
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
    it("should delete a region successfully when no clients or deliverymen are assigned", async () => {
      const created = await createTestRegion();

      const result = await service.delete(created.id, LOGGED_USER_ID);

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual({ id: created.id });
    });

    it("should return 404 when region is not found", async () => {
      const result = await service.delete(crypto.randomUUID(), LOGGED_USER_ID);

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr().statusCode).toBe(404);
    });

    it("should return 422 when region has active clients", async () => {
      const branch = await createTestBranch();
      const region = await createTestRegion({ branchId: branch.id });
      await createTestClient({ regionId: region.id, branchId: branch.id });

      const result = await service.delete(region.id, LOGGED_USER_ID);

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr().statusCode).toBe(422);
    });

    it("should return 422 when region has active deliverymen", async () => {
      const branch = await createTestBranch();
      const region = await createTestRegion({ branchId: branch.id });
      await createTestDeliveryman({ regionId: region.id, branchId: branch.id });

      const result = await service.delete(region.id, LOGGED_USER_ID);

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr().statusCode).toBe(422);
    });

    it("should allow deletion when all assigned clients are soft-deleted", async () => {
      const branch = await createTestBranch();
      const region = await createTestRegion({ branchId: branch.id });
      await createTestClient({ regionId: region.id, branchId: branch.id, isDeleted: true });

      const result = await service.delete(region.id, LOGGED_USER_ID);

      expect(result.isOk()).toBe(true);
    });

    it("should allow deletion when all assigned deliverymen are soft-deleted", async () => {
      const branch = await createTestBranch();
      const region = await createTestRegion({ branchId: branch.id });
      await createTestDeliveryman({ regionId: region.id, branchId: branch.id, isDeleted: true });

      const result = await service.delete(region.id, LOGGED_USER_ID);

      expect(result.isOk()).toBe(true);
    });
  });
});
