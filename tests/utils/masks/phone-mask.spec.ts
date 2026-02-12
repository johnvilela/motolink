import { describe, expect, it } from "vitest";
import { applyPhoneMask } from "@/utils/masks/phone-mask";

describe("applyPhoneMask", () => {
  it("returns empty string for empty input", () => {
    expect(applyPhoneMask("")).toBe("");
  });

  it("starts opening parenthesis for 1-2 digits", () => {
    expect(applyPhoneMask("1")).toBe("(1");
    expect(applyPhoneMask("12")).toBe("(12");
  });

  it("formats middle group for lengths 3-6", () => {
    expect(applyPhoneMask("123")).toBe("(12) 3");
    expect(applyPhoneMask("123456")).toBe("(12) 3456");
  });

  it("formats 10-digit numbers with 4-remaining digits group", () => {
    expect(applyPhoneMask("1234567890")).toBe("(12) 3456-7890");
  });

  it("formats 11-digit numbers with 5-remaining digits group", () => {
    expect(applyPhoneMask("12345678901")).toBe("(12) 34567-8901");
  });

  it("removes non-digits and trims to 11 characters", () => {
    expect(applyPhoneMask("(12) 34567-8901")).toBe("(12) 34567-8901");
    expect(applyPhoneMask("12345678901234")).toBe("(12) 34567-8901");
  });
});
