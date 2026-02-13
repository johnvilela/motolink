import { beforeEach, describe, expect, it } from "vitest";
import { historyTraceActionConst } from "@/constants/history-trace";
import { db } from "@/lib/database";
import { groupsService } from "@/modules/groups/groups-service";
import { AppError } from "@/utils/app-error";

describe("groupsService", () => {
  const service = groupsService();
  let testBranch: { id: string };
  let testUser: { id: string };

  beforeEach(async () => {
    testBranch = await db.branch.create({
      data: { name: "Test Branch", code: "BR-TEST" },
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
    it("creates group with branch relation", async () => {
      const result = await service.create(
        { name: "Group A", description: "Desc A", branchId: testBranch.id },
        testUser.id,
      );

      expect(result.id).toBeDefined();
      expect(result.name).toBe("Group A");
      expect(result.description).toBe("Desc A");
      expect(result.branchId).toBe(testBranch.id);
      expect(result.branch).toBeDefined();
      expect(result.branch.id).toBe(testBranch.id);
    });

    it("creates history trace after creation", async () => {
      const result = await service.create(
        { name: "Traced Group", branchId: testBranch.id },
        testUser.id,
      );

      await new Promise((r) => setTimeout(r, 200));

      const trace = await db.historyTrace.findFirst({
        where: { entityId: result.id },
      });

      expect(trace).toBeDefined();
      expect(trace?.action).toBe(historyTraceActionConst.CREATED);
    });
  });

  describe("getById", () => {
    it("returns group with branch when found", async () => {
      const group = await db.group.create({
        data: { name: "Find Me", branchId: testBranch.id },
      });

      const result = await service.getById(group.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(group.id);
      expect(result?.branch).toBeDefined();
    });

    it("returns null when not found", async () => {
      const result = await service.getById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("listAll", () => {
    beforeEach(async () => {
      await db.group.createMany({
        data: Array.from({ length: 15 }, (_, i) => ({
          name: `Group ${i}`,
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

    it("filters by search term case-insensitive", async () => {
      await db.group.create({
        data: { name: "Unique Target", branchId: testBranch.id },
      });

      const result = await service.listAll({
        page: 1,
        pageSize: 10,
        search: "unique",
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe("Unique Target");
    });

    it("filters by branchId", async () => {
      const otherBranch = await db.branch.create({
        data: { name: "Other Branch", code: "BR-OTHER" },
      });
      await db.group.create({
        data: { name: "Other Group", branchId: otherBranch.id },
      });

      const result = await service.listAll({
        page: 1,
        pageSize: 100,
        branchId: otherBranch.id,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].branchId).toBe(otherBranch.id);
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

  describe("update", () => {
    it("updates group and returns with branch", async () => {
      const group = await db.group.create({
        data: { name: "Old Name", branchId: testBranch.id },
      });

      const result = await service.update(
        group.id,
        { name: "New Name", description: "Updated", branchId: testBranch.id },
        testUser.id,
      );

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result.name).toBe("New Name");
      expect(result.description).toBe("Updated");
      expect(result.branch).toBeDefined();
    });

    it("returns AppError 404 when group not found", async () => {
      const result = await service.update(
        "non-existent-id",
        { name: "X", branchId: testBranch.id },
        testUser.id,
      );

      expect(result).toBeInstanceOf(AppError);
      if (!(result instanceof AppError)) return;

      expect(result.statusCode).toBe(404);
    });

    it("creates history trace with old and new objects", async () => {
      const group = await db.group.create({
        data: { name: "Before", branchId: testBranch.id },
      });

      await service.update(
        group.id,
        { name: "After", branchId: testBranch.id },
        testUser.id,
      );

      await new Promise((r) => setTimeout(r, 200));

      const trace = await db.historyTrace.findFirst({
        where: { entityId: group.id },
      });

      expect(trace).toBeDefined();
      expect(trace?.action).toBe(historyTraceActionConst.UPDATED);
    });
  });

  describe("delete", () => {
    it("deletes group and returns success", async () => {
      const group = await db.group.create({
        data: { name: "To Delete", branchId: testBranch.id },
      });

      const result = await service.delete(group.id, testUser.id);

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result).toEqual({ success: true });

      const deleted = await db.group.findUnique({ where: { id: group.id } });
      expect(deleted).toBeNull();
    });

    it("returns AppError 404 when group not found", async () => {
      const result = await service.delete("non-existent-id", testUser.id);

      expect(result).toBeInstanceOf(AppError);
      if (!(result instanceof AppError)) return;

      expect(result.statusCode).toBe(404);
    });

    it("returns AppError 400 when clients are linked", async () => {
      const group = await db.group.create({
        data: { name: "Has Clients", branchId: testBranch.id },
      });

      await db.client.create({
        data: {
          name: "Linked Client",
          cnpj: "12345678000100",
          cep: "01001000",
          street: "Rua Test",
          number: "100",
          city: "Test City",
          neighborhood: "Centro",
          uf: "SP",
          contactName: "Contact",
          branchId: testBranch.id,
          groupId: group.id,
        },
      });

      const result = await service.delete(group.id, testUser.id);

      expect(result).toBeInstanceOf(AppError);
      if (!(result instanceof AppError)) return;

      expect(result.statusCode).toBe(400);

      const stillExists = await db.group.findUnique({
        where: { id: group.id },
      });
      expect(stillExists).toBeDefined();
    });

    it("creates history trace after deletion", async () => {
      const group = await db.group.create({
        data: { name: "Trace Delete", branchId: testBranch.id },
      });

      await service.delete(group.id, testUser.id);

      await new Promise((r) => setTimeout(r, 200));

      const trace = await db.historyTrace.findFirst({
        where: { entityId: group.id },
      });

      expect(trace).toBeDefined();
      expect(trace?.action).toBe(historyTraceActionConst.DELETED);
    });
  });
});
