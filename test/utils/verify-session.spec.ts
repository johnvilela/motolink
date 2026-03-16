import { errAsync, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookieConst } from "@/constants/cookies";

const mockGet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ get: (...args: unknown[]) => mockGet(...args) }),
}));

const mockValidate = vi.fn();
vi.mock("@/modules/sessions/sessions-service", () => ({
  sessionsService: () => ({ validate: mockValidate }),
}));

import { verifySession } from "@/utils/verify-session";

describe("verifySession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the session token cookie is missing", async () => {
    mockGet.mockImplementation((key: string) => {
      if (key === cookieConst.SESSION_TOKEN) return undefined;
      if (key === cookieConst.SESSION_EXPIRES_AT) return { value: new Date(Date.now() + 60_000).toISOString() };
      return undefined;
    });

    const result = await verifySession();

    expect(result.session).toBeUndefined();
    expect(result.error).toBeDefined();
    expect(result.error?.status).toBe(401);
    await expect(result.error?.json()).resolves.toEqual({ error: "Sessão inválida" });
    expect(mockValidate).not.toHaveBeenCalled();
  });

  it("returns 401 when the session expiration is in the past", async () => {
    mockGet.mockImplementation((key: string) => {
      if (key === cookieConst.SESSION_TOKEN) return { value: "token-123" };
      if (key === cookieConst.SESSION_EXPIRES_AT) return { value: new Date(Date.now() - 60_000).toISOString() };
      return undefined;
    });

    const result = await verifySession();

    expect(result.error?.status).toBe(401);
    await expect(result.error?.json()).resolves.toEqual({ error: "Sessão inválida" });
    expect(mockValidate).not.toHaveBeenCalled();
  });

  it("returns the validated session when cookies are present and valid", async () => {
    const session = {
      id: "session-1",
      token: "token-123",
      userId: "user-1",
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGet.mockImplementation((key: string) => {
      if (key === cookieConst.SESSION_TOKEN) return { value: session.token };
      if (key === cookieConst.SESSION_EXPIRES_AT) return { value: session.expiresAt.toISOString() };
      return undefined;
    });
    mockValidate.mockResolvedValue(okAsync(session));

    const result = await verifySession();

    expect(result.error).toBeUndefined();
    expect(result.session).toEqual(session);
    expect(mockValidate).toHaveBeenCalledWith(session.token);
  });

  it("returns the validation error response when sessionsService.validate fails", async () => {
    mockGet.mockImplementation((key: string) => {
      if (key === cookieConst.SESSION_TOKEN) return { value: "token-123" };
      if (key === cookieConst.SESSION_EXPIRES_AT) return { value: new Date(Date.now() + 60_000).toISOString() };
      return undefined;
    });
    mockValidate.mockResolvedValue(errAsync({ reason: "Sessão expirada", statusCode: 401 }));

    const result = await verifySession();

    expect(result.session).toBeUndefined();
    expect(result.error?.status).toBe(401);
    await expect(result.error?.json()).resolves.toEqual({ error: "Sessão expirada" });
  });
});
