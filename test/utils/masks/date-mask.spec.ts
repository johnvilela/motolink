import { describe, expect, it } from "vitest";
import { applyDateMask } from "@/utils/masks/date-mask";

describe("applyDateMask", () => {
  it("returns empty string for empty input", () => {
    expect(applyDateMask("")).toBe("");
  });

  it("handles 1-2 digit day input", () => {
    expect(applyDateMask("1")).toBe("1");
    expect(applyDateMask("12")).toBe("12");
  });

  it("inserts first slash for month when length between 3 and 4", () => {
    expect(applyDateMask("123")).toBe("12/3");
    expect(applyDateMask("1234")).toBe("12/34");
  });

  it("formats full date DD/MM/YYYY and trims extra digits", () => {
    expect(applyDateMask("01012020")).toBe("01/01/2020");
    expect(applyDateMask("010120201234")).toBe("01/01/2020");
  });
});
