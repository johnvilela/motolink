import { describe, expect, it } from "vitest";
import { cleanMask } from "../../../src/utils/masks/clean-mask";

describe("cleanMask", () => {
  it("removes all non-digit characters", () => {
    expect(cleanMask("abc123-45.6")).toBe("123456");
  });

  it("returns empty string when there are no digits", () => {
    expect(cleanMask("abc!@#")).toBe("");
  });

  it("preserves digits-only strings", () => {
    expect(cleanMask("0123456789")).toBe("0123456789");
  });

  it("handles empty string", () => {
    expect(cleanMask("")).toBe("");
  });
});
