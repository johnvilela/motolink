import { describe, expect, it } from "vitest";
import { db } from "@/lib/database";
import { branchesService } from "@/modules/branches/branches-service";

describe("branchesService", () => {
  const service = branchesService();

  describe("getAll", () => {
    it("returns empty array when no branches exist", async () => {
      const result = await service.getAll();

      expect(result).toEqual([]);
    });

    it("returns all branches", async () => {
      await db.branch.createMany({
        data: [
          { name: "Branch A", code: "BR-A" },
          { name: "Branch B", code: "BR-B" },
          { name: "Branch C", code: "BR-C" },
        ],
      });

      const result = await service.getAll();

      expect(result).toHaveLength(3);
    });
  });

  describe("getByIds", () => {
    it("returns branches matching given IDs", async () => {
      const [branchA, branchB] = await Promise.all([
        db.branch.create({ data: { name: "Branch A", code: "BR-A" } }),
        db.branch.create({ data: { name: "Branch B", code: "BR-B" } }),
        db.branch.create({ data: { name: "Branch C", code: "BR-C" } }),
      ]);

      const result = await service.getByIds([branchA.id, branchB.id]);

      expect(result).toHaveLength(2);
      const ids = result.map((b) => b.id);
      expect(ids).toContain(branchA.id);
      expect(ids).toContain(branchB.id);
    });

    it("returns empty array when no IDs match", async () => {
      const result = await service.getByIds(["non-existent-id"]);

      expect(result).toEqual([]);
    });

    it("returns empty array for empty IDs input", async () => {
      const result = await service.getByIds([]);

      expect(result).toEqual([]);
    });
  });
});
