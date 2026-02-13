import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/utils/has-permissions", () => ({ hasPermissions: vi.fn() }));

import { redirect } from "next/navigation";
import { hasPermissions } from "@/utils/has-permissions";
import { requirePermissions } from "@/utils/require-permissions";

describe("requirePermissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns undefined when hasPermissions returns true", () => {
    vi.mocked(hasPermissions).mockReturnValue(true);

    const result = requirePermissions({ role: "USER" }, ["A"]);

    expect(result).toBeUndefined();
    expect(vi.mocked(redirect).mock.calls.length).toBe(0);
  });

  it("calls redirect with encoded moduleName when permission missing", () => {
    vi.mocked(hasPermissions).mockReturnValue(false);
    vi.mocked(redirect).mockReturnValue("REDIRECTED" as never);

    const mod = "Módulo & X";
    const res = requirePermissions(null, ["A"], mod);

    expect(vi.mocked(redirect).mock.calls.length).toBe(1);
    expect(vi.mocked(redirect).mock.calls[0][0]).toBe(
      `/nao-autorizado?moduleName=${encodeURIComponent(mod)}`,
    );
    expect(res).toBe("REDIRECTED");
  });
});
