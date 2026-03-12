/**
 * Duck-type interface matching Prisma's Decimal (has d, e, s numeric internals).
 */
interface DecimalLike {
  d: number[];
  e: number;
  s: number;
  toNumber(): number;
}

/**
 * Recursively maps Prisma Decimal fields to plain number at the type level.
 */
type ConvertDecimals<T> = T extends DecimalLike
  ? number
  : T extends Date
    ? Date
    : T extends Array<infer U>
      ? ConvertDecimals<U>[]
      : T extends object
        ? { [K in keyof T]: ConvertDecimals<T[K]> }
        : T;

/**
 * Recursively converts Prisma Decimal instances to plain JS numbers.
 * Uses duck-typing (checks for `toNumber` method) to avoid importing Prisma internals.
 */
export function convertDecimals<T>(obj: T): ConvertDecimals<T> {
  if (obj === null || obj === undefined) return obj as ConvertDecimals<T>;

  if (typeof obj === "object" && "toNumber" in obj && typeof (obj as Record<string, unknown>).toNumber === "function") {
    return (obj as unknown as { toNumber: () => number }).toNumber() as ConvertDecimals<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertDecimals) as ConvertDecimals<T>;
  }

  if (obj instanceof Date) return obj as ConvertDecimals<T>;

  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = convertDecimals(value);
    }
    return result as ConvertDecimals<T>;
  }

  return obj as ConvertDecimals<T>;
}
