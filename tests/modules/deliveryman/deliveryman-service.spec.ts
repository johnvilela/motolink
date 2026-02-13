import { beforeEach, describe, expect, it } from "vitest";
import { historyTraceActionConst } from "@/constants/history-trace";
import { db } from "@/lib/database";
import { deliverymanService } from "@/modules/deliveryman/deliveryman-service";
import { AppError } from "@/utils/app-error";

describe("deliverymanService", () => {
  const service = deliverymanService();
  let testBranch: { id: string };
  let testRegion: { id: string };
  let testUser: { id: string };

  const baseDeliveryman = {
    name: "John Doe",
    document: "12345678900",
    phone: "11999999999",
    contractType: "PJ",
    mainPixKey: "john@example.com",
  };

  beforeEach(async () => {
    testBranch = await db.branch.create({
      data: { name: "Test Branch", code: "BR-TEST" },
    });

    testRegion = await db.region.create({
      data: { name: "Test Region", branchId: testBranch.id },
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
    it("creates deliveryman with branch and region relations", async () => {
      const result = await service.create(
        {
          ...baseDeliveryman,
          branchId: testBranch.id,
          regionId: testRegion.id,
        },
        testUser.id,
      );

      expect(result.id).toBeDefined();
      expect(result.name).toBe(baseDeliveryman.name);
      expect(result.document).toBe(baseDeliveryman.document);
      expect(result.phone).toBe(baseDeliveryman.phone);
      expect(result.contractType).toBe(baseDeliveryman.contractType);
      expect(result.mainPixKey).toBe(baseDeliveryman.mainPixKey);
      expect(result.branchId).toBe(testBranch.id);
      expect(result.regionId).toBe(testRegion.id);
      expect(result.branch).toBeDefined();
      expect(result.region).toBeDefined();
    });

    it("creates deliveryman with files array", async () => {
      const files = ["file1.pdf", "file2.jpg"];

      const result = await service.create(
        { ...baseDeliveryman, branchId: testBranch.id, files },
        testUser.id,
      );

      expect(result.files).toEqual(files);
    });

    it("defaults files to empty array when not provided", async () => {
      const result = await service.create(
        { ...baseDeliveryman, branchId: testBranch.id },
        testUser.id,
      );

      expect(result.files).toEqual([]);
    });

    it("creates history trace after creation", async () => {
      const result = await service.create(
        { ...baseDeliveryman, branchId: testBranch.id },
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
    it("returns deliveryman with branch and region when found", async () => {
      const created = await db.deliveryman.create({
        data: {
          ...baseDeliveryman,
          branchId: testBranch.id,
          regionId: testRegion.id,
        },
      });

      const result = await service.getById(created.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(created.id);
      expect(result?.branch).toBeDefined();
      expect(result?.region).toBeDefined();
    });

    it("returns null when not found", async () => {
      const result = await service.getById("non-existent-id");

      expect(result).toBeNull();
    });

    it("returns null when deliveryman is soft-deleted", async () => {
      const created = await db.deliveryman.create({
        data: { ...baseDeliveryman, branchId: testBranch.id, isDeleted: true },
      });

      const result = await service.getById(created.id);

      expect(result).toBeNull();
    });
  });

  describe("listAll", () => {
    beforeEach(async () => {
      await db.deliveryman.createMany({
        data: Array.from({ length: 15 }, (_, i) => ({
          name: `Deliveryman ${i}`,
          document: `doc-${i}`,
          phone: `phone-${i}`,
          contractType: "PJ",
          mainPixKey: `pix-${i}@example.com`,
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
      await db.deliveryman.create({
        data: {
          name: "Unique Target",
          document: "unique-doc",
          phone: "unique-phone",
          contractType: "CLT",
          mainPixKey: "unique@example.com",
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

    it("searches by document and phone", async () => {
      await db.deliveryman.create({
        data: {
          name: "Search Test",
          document: "99988877766",
          phone: "21888888888",
          contractType: "PJ",
          mainPixKey: "search@example.com",
          branchId: testBranch.id,
        },
      });

      const byDocument = await service.listAll({
        page: 1,
        pageSize: 10,
        search: "99988877766",
      });
      expect(byDocument.data).toHaveLength(1);

      const byPhone = await service.listAll({
        page: 1,
        pageSize: 10,
        search: "21888888888",
      });
      expect(byPhone.data).toHaveLength(1);
    });

    it("filters by branchId", async () => {
      const otherBranch = await db.branch.create({
        data: { name: "Other Branch", code: "BR-OTHER" },
      });
      await db.deliveryman.create({
        data: {
          ...baseDeliveryman,
          name: "Other Branch Guy",
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
    it("updates deliveryman fields and returns with relations", async () => {
      const created = await db.deliveryman.create({
        data: { ...baseDeliveryman, branchId: testBranch.id },
      });

      const result = await service.update(
        created.id,
        {
          ...baseDeliveryman,
          name: "Updated Name",
          branchId: testBranch.id,
          regionId: testRegion.id,
        },
        testUser.id,
      );

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result.name).toBe("Updated Name");
      expect(result.regionId).toBe(testRegion.id);
      expect(result.branch).toBeDefined();
      expect(result.region).toBeDefined();
    });

    it("returns AppError 404 when deliveryman not found", async () => {
      const result = await service.update(
        "non-existent-id",
        { ...baseDeliveryman, branchId: testBranch.id },
        testUser.id,
      );

      expect(result).toBeInstanceOf(AppError);
      if (!(result instanceof AppError)) return;

      expect(result.statusCode).toBe(404);
    });

    it("returns AppError 400 when deliveryman is deleted", async () => {
      const created = await db.deliveryman.create({
        data: { ...baseDeliveryman, branchId: testBranch.id, isDeleted: true },
      });

      const result = await service.update(
        created.id,
        { ...baseDeliveryman, branchId: testBranch.id },
        testUser.id,
      );

      expect(result).toBeInstanceOf(AppError);
      if (!(result instanceof AppError)) return;

      expect(result.statusCode).toBe(400);
    });

    it("creates history trace with old and new objects", async () => {
      const created = await db.deliveryman.create({
        data: { ...baseDeliveryman, branchId: testBranch.id },
      });

      await service.update(
        created.id,
        { ...baseDeliveryman, name: "After Update", branchId: testBranch.id },
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
    it("soft-deletes deliveryman and returns success", async () => {
      const created = await db.deliveryman.create({
        data: { ...baseDeliveryman, branchId: testBranch.id },
      });

      const result = await service.delete(created.id, testUser.id);

      expect(result).not.toBeInstanceOf(AppError);
      expect(result).toEqual({ success: true });

      const deleted = await db.deliveryman.findUnique({
        where: { id: created.id },
      });
      expect(deleted?.isDeleted).toBe(true);
    });

    it("returns AppError 404 when deliveryman not found", async () => {
      const result = await service.delete("non-existent-id", testUser.id);

      expect(result).toBeInstanceOf(AppError);
      if (!(result instanceof AppError)) return;

      expect(result.statusCode).toBe(404);
    });

    it("returns AppError 400 when deliveryman already deleted", async () => {
      const created = await db.deliveryman.create({
        data: { ...baseDeliveryman, branchId: testBranch.id, isDeleted: true },
      });

      const result = await service.delete(created.id, testUser.id);

      expect(result).toBeInstanceOf(AppError);
      if (!(result instanceof AppError)) return;

      expect(result.statusCode).toBe(400);
    });

    it("creates history trace after deletion", async () => {
      const created = await db.deliveryman.create({
        data: { ...baseDeliveryman, branchId: testBranch.id },
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

  describe("toggleBlock", () => {
    it("blocks an unblocked deliveryman", async () => {
      const created = await db.deliveryman.create({
        data: { ...baseDeliveryman, branchId: testBranch.id, isBlocked: false },
      });

      const result = await service.toggleBlock(created.id, testUser.id);

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result.isBlocked).toBe(true);
      expect(result.branch).toBeDefined();
    });

    it("unblocks a blocked deliveryman", async () => {
      const created = await db.deliveryman.create({
        data: { ...baseDeliveryman, branchId: testBranch.id, isBlocked: true },
      });

      const result = await service.toggleBlock(created.id, testUser.id);

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result.isBlocked).toBe(false);
    });

    it("returns AppError 404 when deliveryman not found", async () => {
      const result = await service.toggleBlock("non-existent-id", testUser.id);

      expect(result).toBeInstanceOf(AppError);
      if (!(result instanceof AppError)) return;

      expect(result.statusCode).toBe(404);
    });

    it("returns AppError 400 when deliveryman is deleted", async () => {
      const created = await db.deliveryman.create({
        data: { ...baseDeliveryman, branchId: testBranch.id, isDeleted: true },
      });

      const result = await service.toggleBlock(created.id, testUser.id);

      expect(result).toBeInstanceOf(AppError);
      if (!(result instanceof AppError)) return;

      expect(result.statusCode).toBe(400);
    });

    it("creates history trace after toggle", async () => {
      const created = await db.deliveryman.create({
        data: { ...baseDeliveryman, branchId: testBranch.id },
      });

      await service.toggleBlock(created.id, testUser.id);

      await new Promise((r) => setTimeout(r, 200));

      const trace = await db.historyTrace.findFirst({
        where: { entityId: created.id },
      });

      expect(trace).toBeDefined();
      expect(trace?.action).toBe(historyTraceActionConst.UPDATED);
    });
  });
});
