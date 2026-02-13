import { beforeEach, describe, expect, it, vi } from "vitest";
import { statusConst } from "@/constants/status";
import { db } from "@/lib/database";
import { sessionsService } from "@/modules/sessions/sessions-service";
import { AppError } from "@/utils/app-error";

const mockHashCompare = vi.fn().mockResolvedValue(true);

vi.mock("@/lib/hash", () => ({
  hash: () => ({
    compare: mockHashCompare,
  }),
}));

const baseUser = {
  name: "Test User",
  email: "session@example.com",
  password: "$hashed$password$",
  status: statusConst.ACTIVE,
  role: "USER",
  branches: ["branch-1"],
  permissions: [],
};

describe("sessionsService", () => {
  const service = sessionsService();

  beforeEach(() => {
    vi.clearAllMocks();
    mockHashCompare.mockResolvedValue(true);
  });

  describe("create", () => {
    it("creates session and returns token with user without password", async () => {
      const user = await db.user.create({ data: baseUser });

      const result = await service.create({
        email: baseUser.email,
        password: "Secure@123",
      });

      expect(result.session.token).toBeDefined();
      expect(result.session.expiresAt).toBeInstanceOf(Date);
      expect(result.user.id).toBe(user.id);
      expect(result.user.email).toBe(baseUser.email);
      expect(result.user).not.toHaveProperty("password");
    });

    it("persists session in database", async () => {
      await db.user.create({ data: baseUser });

      const result = await service.create({
        email: baseUser.email,
        password: "Secure@123",
      });

      const session = await db.session.findUnique({
        where: { token: result.session.token },
      });
      expect(session).toBeDefined();
      expect(session?.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("throws AppError 401 when user not found", async () => {
      await expect(
        service.create({
          email: "nonexistent@example.com",
          password: "Secure@123",
        }),
      ).rejects.toThrow(AppError);

      await expect(
        service.create({
          email: "nonexistent@example.com",
          password: "Secure@123",
        }),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("throws AppError 401 when user has no password", async () => {
      await db.user.create({
        data: {
          ...baseUser,
          email: "nopass@example.com",
          password: null,
          status: statusConst.PENDING,
        },
      });

      await expect(
        service.create({
          email: "nopass@example.com",
          password: "Secure@123",
        }),
      ).rejects.toThrow(AppError);

      await expect(
        service.create({
          email: "nopass@example.com",
          password: "Secure@123",
        }),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("throws AppError 403 when user is not active", async () => {
      await db.user.create({
        data: {
          ...baseUser,
          email: "inactive@example.com",
          status: statusConst.INACTIVE,
        },
      });

      await expect(
        service.create({
          email: "inactive@example.com",
          password: "Secure@123",
        }),
      ).rejects.toThrow(AppError);

      await expect(
        service.create({
          email: "inactive@example.com",
          password: "Secure@123",
        }),
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("throws AppError 401 when password is invalid", async () => {
      await db.user.create({ data: baseUser });
      mockHashCompare.mockResolvedValue(false);

      await expect(
        service.create({
          email: baseUser.email,
          password: "Wrong@1234",
        }),
      ).rejects.toThrow(AppError);

      await expect(
        service.create({
          email: baseUser.email,
          password: "Wrong@1234",
        }),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("calls hash compare with provided and stored password", async () => {
      await db.user.create({ data: baseUser });

      await service.create({
        email: baseUser.email,
        password: "Secure@123",
      });

      expect(mockHashCompare).toHaveBeenCalledWith(
        "Secure@123",
        baseUser.password,
      );
    });

    it("sets session expiration based on AUTH_EXPIRATION_DAYS", async () => {
      await db.user.create({ data: baseUser });

      const before = Date.now();
      const result = await service.create({
        email: baseUser.email,
        password: "Secure@123",
      });
      const after = Date.now();

      const expectedDays = Number(process.env.AUTH_EXPIRATION_DAYS ?? 7);
      const expectedMs = expectedDays * 24 * 60 * 60 * 1000;

      expect(result.session.expiresAt.getTime()).toBeGreaterThanOrEqual(
        before + expectedMs,
      );
      expect(result.session.expiresAt.getTime()).toBeLessThanOrEqual(
        after + expectedMs,
      );
    });
  });

  describe("delete", () => {
    it("deletes session by token", async () => {
      const user = await db.user.create({ data: baseUser });
      const session = await db.session.create({
        data: {
          token: "test-session-token",
          userId: user.id,
          expiresAt: new Date(Date.now() + 86400000),
        },
      });

      await service.delete(session.token);

      const deleted = await db.session.findUnique({
        where: { token: session.token },
      });
      expect(deleted).toBeNull();
    });

    it("throws when session token not found", async () => {
      await expect(service.delete("nonexistent-token")).rejects.toThrow();
    });
  });
});
