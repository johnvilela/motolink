import { describe, expect, it } from "vitest";
import { convertDecimals } from "@/utils/convert-decimals";

function decimalLike(value: number) {
  return {
    d: [value],
    e: 0,
    s: 1,
    toNumber: () => value,
  };
}

describe("convertDecimals", () => {
  it("converts decimal-like values recursively inside nested objects and arrays", () => {
    const input = {
      amount: decimalLike(19.9),
      nested: {
        fee: decimalLike(2.5),
        items: [decimalLike(1), { tax: decimalLike(0.75) }],
      },
    };

    const result = convertDecimals(input);

    expect(result).toEqual({
      amount: 19.9,
      nested: {
        fee: 2.5,
        items: [1, { tax: 0.75 }],
      },
    });
  });

  it("preserves dates, null, undefined, and primitive values", () => {
    const createdAt = new Date("2026-03-16T00:00:00.000Z");

    const result = convertDecimals({
      createdAt,
      name: "Motolink",
      active: true,
      count: 3,
      nullable: null,
      missing: undefined,
    });

    expect(result.createdAt).toBe(createdAt);
    expect(result.name).toBe("Motolink");
    expect(result.active).toBe(true);
    expect(result.count).toBe(3);
    expect(result.nullable).toBeNull();
    expect(result.missing).toBeUndefined();
  });

  it("converts a top-level decimal-like object directly", () => {
    expect(convertDecimals(decimalLike(42.42))).toBe(42.42);
  });
});
