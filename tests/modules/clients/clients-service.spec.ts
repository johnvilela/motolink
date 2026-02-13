import { beforeEach, describe, expect, it } from "vitest";
import { historyTraceActionConst } from "@/constants/history-trace";
import { db } from "@/lib/database";
import { clientsService } from "@/modules/clients/clients-service";
import { AppError } from "@/utils/app-error";

describe("clientsService", () => {
  const service = clientsService();
  let testBranch: { id: string };
  let testRegion: { id: string };
  let testGroup: { id: string };
  let testUser: { id: string };

  const baseClient = {
    name: "Test Client",
    cnpj: "12345678000100",
    cep: "01001000",
    street: "Rua Teste",
    number: "100",
    city: "São Paulo",
    neighborhood: "Centro",
    uf: "SP",
    contactName: "João Silva",
    contactPhone: "11999999999",
    observations: "",
    provideMeal: false,
  };

  beforeEach(async () => {
    testBranch = await db.branch.create({
      data: { name: "Test Branch", code: "BR-TEST" },
    });

    testRegion = await db.region.create({
      data: { name: "Test Region", branchId: testBranch.id },
    });

    testGroup = await db.group.create({
      data: { name: "Test Group", branchId: testBranch.id },
    });

    testUser = await db.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
  });

  describe("create", () => {
    it("creates client with required fields and branch relation", async () => {
      const result = await service.create(
        { ...baseClient, branchId: testBranch.id },
        testUser.id,
      );

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result.id).toBeDefined();
      expect(result.name).toBe(baseClient.name);
      expect(result.cnpj).toBe(baseClient.cnpj);
      expect(result.branchId).toBe(testBranch.id);
      expect(result.branch).toBeDefined();
      expect(result.isDeleted).toBe(false);
    });

    it("creates client with optional fields", async () => {
      const result = await service.create(
        {
          ...baseClient,
          branchId: testBranch.id,
          complement: "Sala 10",
          contactPhone: "11999999999",
          observations: "VIP client",
          provideMeal: true,
          regionId: testRegion.id,
          groupId: testGroup.id,
        },
        testUser.id,
      );

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result.complement).toBe("Sala 10");
      expect(result.contactPhone).toBe("11999999999");
      expect(result.observations).toBe("VIP client");
      expect(result.provideMeal).toBe(true);
      expect(result.regionId).toBe(testRegion.id);
      expect(result.groupId).toBe(testGroup.id);
    });

    it("creates client with nested commercial condition", async () => {
      const result = await service.create(
        {
          ...baseClient,
          branchId: testBranch.id,
          commercialCondition: {
            bagsStatus: "OK",
            bagsAllocated: 5,
            paymentForm: ["PIX", "BOLETO"],
            deliveryAreaKm: 10.5,
            isMotolinkCovered: true,
            clientDailyDay: 150.5,
            deliverymanPerDelivery: 8.75,
          },
        },
        testUser.id,
      );

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result.commercialCondition).toBeDefined();
      expect(result.commercialCondition?.bagsStatus).toBe("OK");
      expect(result.commercialCondition?.bagsAllocated).toBe(5);
      expect(result.commercialCondition?.paymentForm).toEqual([
        "PIX",
        "BOLETO",
      ]);
      expect(Number(result.commercialCondition?.deliveryAreaKm)).toBe(10.5);
      expect(result.commercialCondition?.isMotolinkCovered).toBe(true);
      expect(Number(result.commercialCondition?.clientDailyDay)).toBeCloseTo(
        150.5,
      );
      expect(
        Number(result.commercialCondition?.deliverymanPerDelivery),
      ).toBeCloseTo(8.75);
    });

    it("creates client without commercial condition", async () => {
      const result = await service.create(
        { ...baseClient, branchId: testBranch.id },
        testUser.id,
      );

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result.commercialCondition).toBeNull();
    });

    it("defaults observations to empty string", async () => {
      const result = await service.create(
        { ...baseClient, branchId: testBranch.id },
        testUser.id,
      );

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result.observations).toBe("");
    });

    it("defaults contactPhone to empty string", async () => {
      const result = await service.create(
        { ...baseClient, branchId: testBranch.id },
        testUser.id,
      );

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result.contactPhone).toBe("");
    });

    it("defaults provideMeal to false", async () => {
      const result = await service.create(
        { ...baseClient, branchId: testBranch.id },
        testUser.id,
      );

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result.provideMeal).toBe(false);
    });

    it("sets regionId and groupId to null when not provided", async () => {
      const result = await service.create(
        { ...baseClient, branchId: testBranch.id },
        testUser.id,
      );

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result.regionId).toBeNull();
      expect(result.groupId).toBeNull();
    });

    it("returns AppError when CNPJ already exists", async () => {
      await service.create(
        { ...baseClient, branchId: testBranch.id },
        testUser.id,
      );

      const result = await service.create(
        { ...baseClient, name: "Another Client", branchId: testBranch.id },
        testUser.id,
      );

      expect(result).toBeInstanceOf(AppError);
      if (!(result instanceof AppError)) return;

      expect(result.statusCode).toBe(400);
      expect(result.message).toContain("CNPJ");
    });

    it("allows same CNPJ when existing client is soft-deleted", async () => {
      await db.client.create({
        data: { ...baseClient, branchId: testBranch.id, isDeleted: true },
      });

      const result = await service.create(
        { ...baseClient, branchId: testBranch.id },
        testUser.id,
      );

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result.cnpj).toBe(baseClient.cnpj);
    });

    it("creates history trace after creation", async () => {
      const result = await service.create(
        { ...baseClient, branchId: testBranch.id },
        testUser.id,
      );

      if (result instanceof AppError) return;

      await new Promise((r) => setTimeout(r, 200));

      const trace = await db.historyTrace.findFirst({
        where: { entityId: result.id },
      });

      expect(trace).toBeDefined();
      expect(trace?.action).toBe(historyTraceActionConst.CREATED);
    });
  });

  describe("getById", () => {
    it("returns client with branch and commercial condition", async () => {
      const created = await db.client.create({
        data: {
          ...baseClient,
          branchId: testBranch.id,
          commercialCondition: { create: { bagsAllocated: 3 } },
        },
      });

      const result = await service.getById(created.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(created.id);
      expect(result?.branch).toBeDefined();
      expect(result?.commercialCondition).toBeDefined();
      expect(result?.commercialCondition?.bagsAllocated).toBe(3);
    });

    it("returns null when not found", async () => {
      const result = await service.getById("non-existent-id");

      expect(result).toBeNull();
    });

    it("returns null when client is soft-deleted", async () => {
      const created = await db.client.create({
        data: { ...baseClient, branchId: testBranch.id, isDeleted: true },
      });

      const result = await service.getById(created.id);

      expect(result).toBeNull();
    });
  });

  describe("listAll", () => {
    beforeEach(async () => {
      await db.client.createMany({
        data: Array.from({ length: 15 }, (_, i) => ({
          name: `Client ${i}`,
          cnpj: `${String(i).padStart(14, "0")}`,
          cep: "01001000",
          street: "Rua Teste",
          number: "100",
          city: "São Paulo",
          neighborhood: "Centro",
          uf: "SP",
          contactName: "Contact",
          branchId: testBranch.id,
        })),
      });
    });

    it("returns first page with pagination metadata", async () => {
      const result = await service.listAll({ page: 1, pageSize: 10 });

      expect(result.data).toHaveLength(10);
      expect(result.pagination).toEqual({
        page: 1,
        pageSize: 10,
        total: 15,
        totalPages: 2,
      });
    });

    it("returns second page with remaining items", async () => {
      const result = await service.listAll({ page: 2, pageSize: 10 });

      expect(result.data).toHaveLength(5);
      expect(result.pagination.total).toBe(15);
    });

    it("includes branch relation in results", async () => {
      const result = await service.listAll({ page: 1, pageSize: 1 });

      expect(result.data[0].branch).toBeDefined();
    });

    it("filters by search on name case-insensitive", async () => {
      await db.client.create({
        data: {
          ...baseClient,
          name: "Unique Target",
          cnpj: "99999999999999",
          branchId: testBranch.id,
        },
      });

      const result = await service.listAll({
        page: 1,
        pageSize: 10,
        search: "unique target",
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe("Unique Target");
    });

    it("filters by search on CNPJ", async () => {
      await db.client.create({
        data: {
          ...baseClient,
          name: "CNPJ Search",
          cnpj: "98765432000100",
          branchId: testBranch.id,
        },
      });

      const result = await service.listAll({
        page: 1,
        pageSize: 10,
        search: "98765432000100",
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].cnpj).toBe("98765432000100");
    });

    it("filters by branchId", async () => {
      const otherBranch = await db.branch.create({
        data: { name: "Other Branch", code: "BR-OTHER" },
      });
      await db.client.create({
        data: {
          ...baseClient,
          cnpj: "11111111111111",
          branchId: otherBranch.id,
        },
      });

      const result = await service.listAll({
        page: 1,
        pageSize: 100,
        branchId: otherBranch.id,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].branchId).toBe(otherBranch.id);
    });

    it("filters by regionId", async () => {
      await db.client.create({
        data: {
          ...baseClient,
          cnpj: "22222222222222",
          branchId: testBranch.id,
          regionId: testRegion.id,
        },
      });

      const result = await service.listAll({
        page: 1,
        pageSize: 100,
        regionId: testRegion.id,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].regionId).toBe(testRegion.id);
    });

    it("filters by groupId", async () => {
      await db.client.create({
        data: {
          ...baseClient,
          cnpj: "33333333333333",
          branchId: testBranch.id,
          groupId: testGroup.id,
        },
      });

      const result = await service.listAll({
        page: 1,
        pageSize: 100,
        groupId: testGroup.id,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].groupId).toBe(testGroup.id);
    });

    it("excludes soft-deleted clients", async () => {
      await db.client.create({
        data: {
          ...baseClient,
          name: "Deleted Client",
          cnpj: "44444444444444",
          branchId: testBranch.id,
          isDeleted: true,
        },
      });

      const result = await service.listAll({ page: 1, pageSize: 100 });

      const deletedInResults = result.data.find(
        (c) => c.name === "Deleted Client",
      );
      expect(deletedInResults).toBeUndefined();
    });

    it("returns empty data when no matches", async () => {
      const result = await service.listAll({
        page: 1,
        pageSize: 10,
        search: "nonexistent-xyz",
      });

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe("listAllSmall", () => {
    beforeEach(async () => {
      await db.client.createMany({
        data: Array.from({ length: 5 }, (_, i) => ({
          name: `Small Client ${i}`,
          cnpj: `${String(i + 50).padStart(14, "0")}`,
          cep: "01001000",
          street: "Rua Teste",
          number: "100",
          city: "São Paulo",
          neighborhood: "Centro",
          uf: "SP",
          contactName: "Contact",
          branchId: testBranch.id,
        })),
      });
    });

    it("returns only id, name, and cnpj fields", async () => {
      const result = await service.listAllSmall({ page: 1, pageSize: 10 });

      expect(result.length).toBeGreaterThan(0);

      const keys = Object.keys(result[0]);
      expect(keys).toEqual(expect.arrayContaining(["id", "name", "cnpj"]));
      expect(keys).not.toContain("branchId");
      expect(keys).not.toContain("city");
      expect(keys).not.toContain("street");
    });

    it("returns all non-deleted clients without pagination", async () => {
      const result = await service.listAllSmall({ page: 1, pageSize: 10 });

      expect(result).toHaveLength(5);
    });

    it("orders by name ascending", async () => {
      const result = await service.listAllSmall({ page: 1, pageSize: 10 });

      const names = result.map((c) => c.name);
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });

    it("filters by search on name", async () => {
      await db.client.create({
        data: {
          ...baseClient,
          name: "Unique Small",
          cnpj: "88888888888888",
          branchId: testBranch.id,
        },
      });

      const result = await service.listAllSmall({
        page: 1,
        pageSize: 10,
        search: "unique small",
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Unique Small");
    });

    it("filters by branchId", async () => {
      const otherBranch = await db.branch.create({
        data: { name: "Other Branch", code: "BR-OTHER-SM" },
      });
      await db.client.create({
        data: {
          ...baseClient,
          cnpj: "77777777777777",
          branchId: otherBranch.id,
        },
      });

      const result = await service.listAllSmall({
        page: 1,
        pageSize: 10,
        branchId: otherBranch.id,
      });

      expect(result).toHaveLength(1);
    });

    it("filters by regionId and groupId", async () => {
      await db.client.create({
        data: {
          ...baseClient,
          cnpj: "66666666666666",
          branchId: testBranch.id,
          regionId: testRegion.id,
          groupId: testGroup.id,
        },
      });

      const byRegion = await service.listAllSmall({
        page: 1,
        pageSize: 10,
        regionId: testRegion.id,
      });
      expect(byRegion).toHaveLength(1);

      const byGroup = await service.listAllSmall({
        page: 1,
        pageSize: 10,
        groupId: testGroup.id,
      });
      expect(byGroup).toHaveLength(1);
    });

    it("excludes soft-deleted clients", async () => {
      await db.client.create({
        data: {
          ...baseClient,
          name: "Deleted Small",
          cnpj: "55555555555555",
          branchId: testBranch.id,
          isDeleted: true,
        },
      });

      const result = await service.listAllSmall({ page: 1, pageSize: 10 });

      const deletedInResults = result.find((c) => c.name === "Deleted Small");
      expect(deletedInResults).toBeUndefined();
    });
  });

  describe("update", () => {
    it("updates client fields and returns with relations", async () => {
      const created = await db.client.create({
        data: { ...baseClient, branchId: testBranch.id },
      });

      const result = await service.update(
        created.id,
        {
          ...baseClient,
          name: "Updated Name",
          branchId: testBranch.id,
          regionId: testRegion.id,
          groupId: testGroup.id,
        },
        testUser.id,
      );

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result.name).toBe("Updated Name");
      expect(result.regionId).toBe(testRegion.id);
      expect(result.groupId).toBe(testGroup.id);
      expect(result.branch).toBeDefined();
    });

    it("upserts commercial condition on update", async () => {
      const created = await db.client.create({
        data: { ...baseClient, branchId: testBranch.id },
      });

      const result = await service.update(
        created.id,
        {
          ...baseClient,
          branchId: testBranch.id,
          commercialCondition: {
            bagsStatus: "OK",
            bagsAllocated: 10,
            clientDailyDay: 200,
          },
        },
        testUser.id,
      );

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result.commercialCondition).toBeDefined();
      expect(result.commercialCondition?.bagsStatus).toBe("OK");
      expect(result.commercialCondition?.bagsAllocated).toBe(10);
    });

    it("updates existing commercial condition", async () => {
      const created = await db.client.create({
        data: {
          ...baseClient,
          branchId: testBranch.id,
          commercialCondition: { create: { bagsAllocated: 5 } },
        },
      });

      const result = await service.update(
        created.id,
        {
          ...baseClient,
          branchId: testBranch.id,
          commercialCondition: { bagsAllocated: 20 },
        },
        testUser.id,
      );

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result.commercialCondition?.bagsAllocated).toBe(20);

      const conditions = await db.commercialCondition.findMany({
        where: { clientId: created.id },
      });
      expect(conditions).toHaveLength(1);
    });

    it("returns AppError 404 when client not found", async () => {
      const result = await service.update(
        "non-existent-id",
        { ...baseClient, branchId: testBranch.id },
        testUser.id,
      );

      expect(result).toBeInstanceOf(AppError);
      if (!(result instanceof AppError)) return;

      expect(result.statusCode).toBe(404);
    });

    it("returns AppError 400 when client is deleted", async () => {
      const created = await db.client.create({
        data: { ...baseClient, branchId: testBranch.id, isDeleted: true },
      });

      const result = await service.update(
        created.id,
        { ...baseClient, branchId: testBranch.id },
        testUser.id,
      );

      expect(result).toBeInstanceOf(AppError);
      if (!(result instanceof AppError)) return;

      expect(result.statusCode).toBe(400);
    });

    it("returns AppError when updating to duplicate CNPJ", async () => {
      await db.client.create({
        data: {
          ...baseClient,
          cnpj: "99999999999999",
          branchId: testBranch.id,
        },
      });

      const created = await db.client.create({
        data: {
          ...baseClient,
          cnpj: "11111111111111",
          branchId: testBranch.id,
        },
      });

      const result = await service.update(
        created.id,
        { ...baseClient, cnpj: "99999999999999", branchId: testBranch.id },
        testUser.id,
      );

      expect(result).toBeInstanceOf(AppError);
      if (!(result instanceof AppError)) return;

      expect(result.statusCode).toBe(400);
      expect(result.message).toContain("CNPJ");
    });

    it("allows updating to same CNPJ as own record", async () => {
      const created = await db.client.create({
        data: { ...baseClient, branchId: testBranch.id },
      });

      const result = await service.update(
        created.id,
        { ...baseClient, name: "Same CNPJ Update", branchId: testBranch.id },
        testUser.id,
      );

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result.name).toBe("Same CNPJ Update");
      expect(result.cnpj).toBe(baseClient.cnpj);
    });

    it("creates history trace with old and new objects", async () => {
      const created = await db.client.create({
        data: { ...baseClient, branchId: testBranch.id },
      });

      await service.update(
        created.id,
        { ...baseClient, name: "After Update", branchId: testBranch.id },
        testUser.id,
      );

      await new Promise((r) => setTimeout(r, 200));

      const trace = await db.historyTrace.findFirst({
        where: { entityId: created.id },
      });

      expect(trace).toBeDefined();
      expect(trace?.action).toBe(historyTraceActionConst.UPDATED);
    });
  });

  describe("delete", () => {
    it("soft-deletes client and returns success", async () => {
      const created = await db.client.create({
        data: { ...baseClient, branchId: testBranch.id },
      });

      const result = await service.delete(created.id, testUser.id);

      expect(result).not.toBeInstanceOf(AppError);
      expect(result).toEqual({ success: true });

      const deleted = await db.client.findUnique({
        where: { id: created.id },
      });
      expect(deleted?.isDeleted).toBe(true);
    });

    it("preserves commercial condition after soft-delete", async () => {
      const created = await db.client.create({
        data: {
          ...baseClient,
          branchId: testBranch.id,
          commercialCondition: { create: { bagsAllocated: 5 } },
        },
      });

      await service.delete(created.id, testUser.id);

      const condition = await db.commercialCondition.findFirst({
        where: { clientId: created.id },
      });
      expect(condition).toBeDefined();
      expect(condition?.bagsAllocated).toBe(5);
    });

    it("returns AppError 404 when client not found", async () => {
      const result = await service.delete("non-existent-id", testUser.id);

      expect(result).toBeInstanceOf(AppError);
      if (!(result instanceof AppError)) return;

      expect(result.statusCode).toBe(404);
    });

    it("returns AppError 400 when client already deleted", async () => {
      const created = await db.client.create({
        data: { ...baseClient, branchId: testBranch.id, isDeleted: true },
      });

      const result = await service.delete(created.id, testUser.id);

      expect(result).toBeInstanceOf(AppError);
      if (!(result instanceof AppError)) return;

      expect(result.statusCode).toBe(400);
    });

    it("creates history trace after deletion", async () => {
      const created = await db.client.create({
        data: { ...baseClient, branchId: testBranch.id },
      });

      await service.delete(created.id, testUser.id);

      await new Promise((r) => setTimeout(r, 200));

      const trace = await db.historyTrace.findFirst({
        where: { entityId: created.id },
      });

      expect(trace).toBeDefined();
      expect(trace?.action).toBe(historyTraceActionConst.DELETED);
    });
  });
});
