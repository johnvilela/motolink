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
    (hasPermissions as unknown as any).mockReturnValue(true);

    const result = requirePermissions({ role: "USER" }, ["A"]);

    expect(result).toBeUndefined();
    expect((redirect as unknown as any).mock.calls.length).toBe(0);
  });

  it("calls redirect with encoded moduleName when permission missing", () => {
    (hasPermissions as unknown as any).mockReturnValue(false);
    (redirect as unknown as any).mockReturnValue("REDIRECTED");

    const mod = "Módulo & X";
    const res = requirePermissions(null, ["A"], mod);

    expect((redirect as unknown as any).mock.calls.length).toBe(1);
    expect((redirect as unknown as any).mock.calls[0][0]).toBe(
      `/nao-autorizado?moduleName=${encodeURIComponent(mod)}`,
    );
    expect(res).toBe("REDIRECTED");
  });
});
