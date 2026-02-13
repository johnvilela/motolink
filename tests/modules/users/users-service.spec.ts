import { beforeEach, describe, expect, it, vi } from "vitest";
import { statusConst } from "@/constants/status";
import { db } from "@/lib/database";
import { usersService } from "@/modules/users/users-service";
import { AppError } from "@/utils/app-error";

const mockUsersInvite = vi.fn().mockResolvedValue(undefined);
const mockHashCreate = vi.fn().mockResolvedValue("$hashed$password$");

vi.mock("@/lib/whatsapp", () => ({
  whatsapp: () => ({
    usersInvite: mockUsersInvite,
  }),
}));

vi.mock("@/lib/hash", () => ({
  hash: () => ({
    create: mockHashCreate,
  }),
}));

const baseUser = {
  name: "Test User",
  email: "test@example.com",
  role: "USER",
  branches: ["branch-1"],
  permissions: [],
};

describe("usersService", () => {
  const service = usersService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("creates user with password and ACTIVE status", async () => {
      const result = await service.create(
        { ...baseUser, password: "Secure@123" },
        "logged-user-id",
      );

      expect(result).toBeDefined();
      expect(result.email).toBe(baseUser.email);
      expect(result.status).toBe(statusConst.ACTIVE);
      expect(result).not.toHaveProperty("password");
    });

    it("creates user without password with PENDING status and verification token", async () => {
      const result = await service.create(baseUser, "logged-user-id");

      expect(result.status).toBe(statusConst.PENDING);

      const token = await db.verificationToken.findFirst({
        where: { userId: result.id },
      });
      expect(token).toBeDefined();
      expect(token?.token).toBeTruthy();
    });

    it("sends WhatsApp invite when user has phone and no password", async () => {
      await service.create(
        { ...baseUser, email: "phone@example.com", phone: "+5511999999999" },
        "logged-user-id",
      );

      expect(mockUsersInvite).toHaveBeenCalledWith(
        "+5511999999999",
        expect.objectContaining({ name: baseUser.name }),
      );
    });

    it("does not send WhatsApp invite when user has no phone", async () => {
      await service.create(
        { ...baseUser, email: "nophone@example.com" },
        "logged-user-id",
      );

      expect(mockUsersInvite).not.toHaveBeenCalled();
    });

    it("creates history trace after user creation", async () => {
      const loggedUser = await db.user.create({
        data: { ...baseUser, email: "admin@example.com" },
      });

      const result = await service.create(
        { ...baseUser, email: "history@example.com" },
        loggedUser.id,
      );

      await new Promise((r) => setTimeout(r, 200));

      const trace = await db.historyTrace.findFirst({
        where: { entityId: result.id },
      });
      expect(trace).toBeDefined();
      expect(trace?.action).toBe("CREATED");
      expect(trace?.entityType).toBe("USER");
    });
  });

  describe("getById", () => {
    it("returns user without password when found", async () => {
      const user = await db.user.create({
        data: {
          ...baseUser,
          email: "findme@example.com",
          status: statusConst.ACTIVE,
        },
      });

      const result = await service.getById(user.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(user.id);
      expect(result).not.toHaveProperty("password");
    });

    it("returns null when user not found", async () => {
      const result = await service.getById(
        "00000000-0000-0000-0000-000000000000",
      );

      expect(result).toBeNull();
    });
  });

  describe("listAll", () => {
    it("returns first page with correct pagination", async () => {
      await db.user.createMany({
        data: Array.from({ length: 15 }, (_, i) => ({
          name: `User ${i}`,
          email: `user${i}@example.com`,
          role: "USER",
          branches: ["branch-1"],
        })),
      });

      const result = await service.listAll({ page: 1, pageSize: 10 });

      expect(result.data).toHaveLength(10);
      expect(result.pagination.total).toBe(15);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    it("returns second page with remaining items", async () => {
      await db.user.createMany({
        data: Array.from({ length: 15 }, (_, i) => ({
          name: `User ${i}`,
          email: `page${i}@example.com`,
          role: "USER",
          branches: ["branch-1"],
        })),
      });

      const result = await service.listAll({ page: 2, pageSize: 10 });

      expect(result.data).toHaveLength(5);
      expect(result.pagination.total).toBe(15);
    });

    it("filters by search term case-insensitive", async () => {
      await db.user.createMany({
        data: [
          {
            name: "John Doe",
            email: "john@example.com",
            role: "USER",
            branches: ["b1"],
          },
          {
            name: "Jane Smith",
            email: "jane@example.com",
            role: "USER",
            branches: ["b1"],
          },
        ],
      });

      const result = await service.listAll({
        page: 1,
        pageSize: 10,
        search: "JOHN",
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe("John Doe");
    });

    it("filters by branchId", async () => {
      await db.user.createMany({
        data: [
          {
            name: "User A",
            email: "a@example.com",
            role: "USER",
            branches: ["branch-1"],
          },
          {
            name: "User B",
            email: "b@example.com",
            role: "USER",
            branches: ["branch-2"],
          },
        ],
      });

      const result = await service.listAll({
        page: 1,
        pageSize: 10,
        branchId: "branch-1",
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe("User A");
    });

    it("excludes soft-deleted users", async () => {
      await db.user.createMany({
        data: [
          {
            name: "Active",
            email: "active@example.com",
            role: "USER",
            branches: ["b1"],
          },
          {
            name: "Deleted",
            email: "deleted@example.com",
            role: "USER",
            branches: ["b1"],
            isDeleted: true,
          },
        ],
      });

      const result = await service.listAll({ page: 1, pageSize: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe("Active");
    });
  });

  describe("update", () => {
    it("returns AppError 404 when user not found", async () => {
      const result = await service.update(
        "00000000-0000-0000-0000-000000000000",
        baseUser,
        "logged-user-id",
      );

      expect(result).toBeInstanceOf(AppError);
      expect((result as AppError).statusCode).toBe(404);
    });

    it("returns AppError 400 when user is soft-deleted", async () => {
      const user = await db.user.create({
        data: { ...baseUser, email: "softdel@example.com", isDeleted: true },
      });

      const result = await service.update(user.id, baseUser, "logged-user-id");

      expect(result).toBeInstanceOf(AppError);
      expect((result as AppError).statusCode).toBe(400);
    });

    it("returns AppError 400 when email already in use", async () => {
      const [user, _other] = await Promise.all([
        db.user.create({
          data: { ...baseUser, email: "original@example.com" },
        }),
        db.user.create({ data: { ...baseUser, email: "taken@example.com" } }),
      ]);

      const result = await service.update(
        user.id,
        { ...baseUser, email: "taken@example.com" },
        "logged-user-id",
      );

      expect(result).toBeInstanceOf(AppError);
      expect((result as AppError).statusCode).toBe(400);
    });

    it("hashes password when provided", async () => {
      const user = await db.user.create({
        data: { ...baseUser, email: "hashupdate@example.com" },
      });

      const result = await service.update(
        user.id,
        {
          ...baseUser,
          email: "hashupdate@example.com",
          password: "NewPass@123",
        },
        "logged-user-id",
      );

      expect(result).not.toBeInstanceOf(AppError);

      const dbUser = await db.user.findUnique({ where: { id: user.id } });
      expect(dbUser?.password).toBe("$hashed$password$");
    });

    it("updates user and returns data without password", async () => {
      const user = await db.user.create({
        data: { ...baseUser, email: "update@example.com" },
      });

      const result = await service.update(
        user.id,
        { ...baseUser, name: "Updated Name", email: "update@example.com" },
        "logged-user-id",
      );

      expect(result).not.toBeInstanceOf(AppError);
      expect((result as { name: string }).name).toBe("Updated Name");
      expect(result).not.toHaveProperty("password");
    });
  });

  describe("delete", () => {
    it("returns AppError 404 when user not found", async () => {
      const result = await service.delete(
        "00000000-0000-0000-0000-000000000000",
        "logged-user-id",
      );

      expect(result).toBeInstanceOf(AppError);
      expect((result as AppError).statusCode).toBe(404);
    });

    it("returns AppError 400 when user already deleted", async () => {
      const user = await db.user.create({
        data: { ...baseUser, email: "alreadydel@example.com", isDeleted: true },
      });

      const result = await service.delete(user.id, "logged-user-id");

      expect(result).toBeInstanceOf(AppError);
      expect((result as AppError).statusCode).toBe(400);
    });

    it("soft deletes user and removes sessions", async () => {
      const user = await db.user.create({
        data: { ...baseUser, email: "softdelete@example.com" },
      });

      await db.session.create({
        data: {
          userId: user.id,
          token: "session-token",
          expiresAt: new Date(Date.now() + 86400000),
        },
      });

      const result = await service.delete(user.id, "logged-user-id");

      expect(result).toEqual({ success: true });

      const dbUser = await db.user.findUnique({ where: { id: user.id } });
      expect(dbUser?.isDeleted).toBe(true);

      const sessions = await db.session.findMany({
        where: { userId: user.id },
      });
      expect(sessions).toHaveLength(0);
    });
  });
});
