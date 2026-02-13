import { beforeEach, describe, expect, it } from "vitest";
import {
  historyTraceActionConst,
  historyTraceEntityConst,
} from "@/constants/history-trace";
import { db } from "@/lib/database";
import { historyTracesService } from "@/modules/history-traces/history-traces-service";
import { AppError } from "@/utils/app-error";

describe("historyTracesService", () => {
  const service = historyTracesService();
  let testUser: { id: string; name: string; email: string; role: string };

  beforeEach(async () => {
    testUser = await db.user.create({
      data: {
        email: "trace-test@example.com",
        name: "Trace User",
        role: "ADMIN",
        status: "ACTIVE",
      },
      select: { id: true, name: true, email: true, role: true },
    });
  });

  describe("create", () => {
    it("creates trace with oldObject (update scenario)", async () => {
      const result = await service.create({
        userId: testUser.id,
        action: historyTraceActionConst.UPDATED,
        entityType: historyTraceEntityConst.USER,
        entityId: "entity-1",
        newObject: { name: "New Name", email: "new@example.com" },
        oldObject: { name: "Old Name", email: "new@example.com" },
      });

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result.userId).toBe(testUser.id);
      expect(result.action).toBe(historyTraceActionConst.UPDATED);
      expect(result.entityType).toBe(historyTraceEntityConst.USER);
      expect(result.entityId).toBe("entity-1");
      expect(result.user).toEqual(testUser);

      const changes = result.changes as Record<
        string,
        { old: unknown; new: unknown }
      >;
      expect(changes.name).toEqual({ old: "Old Name", new: "New Name" });
      expect(changes.email).toBeUndefined();
    });

    it("creates trace without oldObject (create scenario)", async () => {
      const result = await service.create({
        userId: testUser.id,
        action: historyTraceActionConst.CREATED,
        entityType: historyTraceEntityConst.GROUP,
        entityId: "entity-2",
        newObject: { name: "Group A", code: "GA" },
      });

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result.action).toBe(historyTraceActionConst.CREATED);

      const changes = result.changes as Record<
        string,
        { old: unknown; new: unknown }
      >;
      expect(changes.name).toEqual({ old: null, new: "Group A" });
      expect(changes.code).toEqual({ old: null, new: "GA" });
    });

    it("returns AppError when user not found", async () => {
      const result = await service.create({
        userId: "non-existent-id",
        action: historyTraceActionConst.CREATED,
        entityType: historyTraceEntityConst.USER,
        entityId: "entity-3",
        newObject: { name: "Test" },
      });

      expect(result).toBeInstanceOf(AppError);
      if (!(result instanceof AppError)) return;

      expect(result.statusCode).toBe(404);
    });

    it("computes changes correctly for removed keys", async () => {
      const result = await service.create({
        userId: testUser.id,
        action: historyTraceActionConst.UPDATED,
        entityType: historyTraceEntityConst.REGION,
        entityId: "entity-4",
        newObject: { name: "Updated" },
        oldObject: { name: "Original", removedField: "value" },
      });

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      const changes = result.changes as Record<
        string,
        { old: unknown; new: unknown }
      >;
      expect(changes.removedField).toEqual({ old: "value", new: null });
    });
  });

  describe("listAll", () => {
    beforeEach(async () => {
      const traces = Array.from({ length: 15 }, (_, i) => ({
        userId: testUser.id,
        user: testUser,
        action:
          i < 10
            ? historyTraceActionConst.CREATED
            : historyTraceActionConst.UPDATED,
        entityType:
          i < 5 ? historyTraceEntityConst.USER : historyTraceEntityConst.GROUP,
        entityId: `entity-${i}`,
        changes: {},
      }));

      for (const trace of traces) {
        await db.historyTrace.create({ data: trace });
      }
    });

    it("returns first page with pagination metadata", async () => {
      const result = await service.listAll({
        page: 1,
        pageSize: 10,
        userId: testUser.id,
      });

      expect(result.data).toHaveLength(10);
      expect(result.pagination).toEqual({
        page: 1,
        pageSize: 10,
        total: 15,
        totalPages: 2,
      });
    });

    it("returns second page with remaining items", async () => {
      const result = await service.listAll({
        page: 2,
        pageSize: 10,
        userId: testUser.id,
      });

      expect(result.data).toHaveLength(5);
      expect(result.pagination.total).toBe(15);
    });

    it("filters by entityType", async () => {
      const result = await service.listAll({
        page: 1,
        pageSize: 20,
        entityType: historyTraceEntityConst.USER,
      });

      expect(result.data).toHaveLength(5);
      expect(
        result.data.every((t) => t.entityType === historyTraceEntityConst.USER),
      ).toBe(true);
    });

    it("filters by multiple criteria", async () => {
      const result = await service.listAll({
        page: 1,
        pageSize: 20,
        entityType: historyTraceEntityConst.GROUP,
        action: historyTraceActionConst.UPDATED,
      });

      expect(result.data).toHaveLength(5);
      expect(
        result.data.every(
          (t) =>
            t.entityType === historyTraceEntityConst.GROUP &&
            t.action === historyTraceActionConst.UPDATED,
        ),
      ).toBe(true);
    });

    it("returns empty data when no matches", async () => {
      const result = await service.listAll({
        page: 1,
        pageSize: 10,
        entityId: "non-existent",
      });

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe("getById", () => {
    it("returns trace when found", async () => {
      const created = await db.historyTrace.create({
        data: {
          userId: testUser.id,
          user: testUser,
          action: historyTraceActionConst.CREATED,
          entityType: historyTraceEntityConst.USER,
          entityId: "entity-1",
          changes: {},
        },
      });

      const result = await service.getById(created.id);

      expect(result).not.toBeInstanceOf(AppError);
      if (result instanceof AppError) return;

      expect(result.id).toBe(created.id);
      expect(result.entityId).toBe("entity-1");
    });

    it("returns AppError when not found", async () => {
      const result = await service.getById("non-existent-id");

      expect(result).toBeInstanceOf(AppError);
      if (!(result instanceof AppError)) return;

      expect(result.statusCode).toBe(404);
    });
  });
});
