import { describe, expect, it } from "vitest";
import { applyCpfMask } from "@/utils/masks/cpf-mask";

describe("applyCpfMask", () => {
  it("returns empty string for empty input", () => {
    expect(applyCpfMask("")).toBe("");
  });

  it("keeps up to 3 digits unchanged", () => {
    expect(applyCpfMask("1")).toBe("1");
    expect(applyCpfMask("12")).toBe("12");
    expect(applyCpfMask("123")).toBe("123");
  });

  it("inserts dot after third digit for 4-6 digits", () => {
    expect(applyCpfMask("1234")).toBe("123.4");
    expect(applyCpfMask("123456")).toBe("123.456");
  });

  it("formats 7-9 digits with two dots", () => {
    expect(applyCpfMask("1234567")).toBe("123.456.7");
    expect(applyCpfMask("123456789")).toBe("123.456.789");
  });

  it("formats 10 and 11 digits with dash separator", () => {
    expect(applyCpfMask("1234567890")).toBe("123.456.789-0");
    expect(applyCpfMask("12345678901")).toBe("123.456.789-01");
  });

  it("removes non-digits and truncates to 11 digits", () => {
    expect(applyCpfMask("a1b2c3.456-78")).toBe("123.456.78");
    expect(applyCpfMask("123.456.789-0123")).toBe("123.456.789-01");
  });
});
