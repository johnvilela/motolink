import { describe, expect, it } from "vitest";
import { hasPermission } from "@/utils/has-permission";

describe("hasPermission", () => {
  it("returns true for ADMIN regardless of permission", () => {
    const admin = { role: "ADMIN", permissions: [] };
    expect(hasPermission(admin, "users.view")).toBe(true);
    expect(hasPermission(admin, "groups.delete")).toBe(true);
  });

  it("returns true when user has the requested permission", () => {
    const user = { role: "USER", permissions: ["operational.view", "operational.create"] };
    expect(hasPermission(user, "operational.view")).toBe(true);
  });

  it("returns false when user lacks the requested permission", () => {
    const user = { role: "USER", permissions: ["operational.view"] };
    expect(hasPermission(user, "users.delete")).toBe(false);
  });

  it("returns false when user has empty permissions", () => {
    const user = { role: "USER", permissions: [] };
    expect(hasPermission(user, "operational.view")).toBe(false);
  });

  it("checks MANAGER permissions correctly", () => {
    const manager = { role: "MANAGER", permissions: ["users.view", "users.create", "groups.view"] };
    expect(hasPermission(manager, "users.view")).toBe(true);
    expect(hasPermission(manager, "users.delete")).toBe(false);
  });
});
