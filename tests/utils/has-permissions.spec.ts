import { describe, expect, it } from "vitest";
import { hasPermissions } from "@/utils/has-permissions";

describe("hasPermissions", () => {
  it("returns false when no user", () => {
    expect(hasPermissions(null, ["A"])).toBe(false);
  });

  it("returns true for ADMIN role regardless of permissions", () => {
    const user = { role: "ADMIN" as const };
    expect(hasPermissions(user, ["SOME"])).toBe(true);
  });

  it("returns true when no requiredPermissions provided", () => {
    const user = { role: "USER", permissions: [] as string[] };
    expect(hasPermissions(user, [])).toBe(true);
    expect(hasPermissions(user, undefined)).toBe(true);
  });

  it("returns true when user has all required permissions", () => {
    const user = { permissions: ["A", "B"] };
    expect(hasPermissions(user, ["A"])).toBe(true);
    expect(hasPermissions(user, ["A", "B"])).toBe(true);
  });

  it("returns false when user is missing a permission", () => {
    const user = { permissions: ["A"] };
    expect(hasPermissions(user, ["A", "B"])).toBe(false);
  });
});
