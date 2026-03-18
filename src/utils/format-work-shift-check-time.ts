import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export function formatWorkShiftCheckTime(value: string | Date | null | undefined, fallback = ""): string {
  if (!value) return fallback;

  const rawValue = value instanceof Date ? value.toISOString() : String(value);

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(rawValue)) {
    return rawValue.slice(0, 5);
  }

  const parsedValue = dayjs(rawValue);

  if (!parsedValue.isValid()) {
    return fallback || rawValue;
  }

  // Prisma/Postgres TIME values are serialized with a 1970 anchor date and should not be shifted by timezone.
  if (rawValue.startsWith("1970-01-01T")) {
    return dayjs.utc(rawValue).format("HH:mm");
  }

  return parsedValue.format("HH:mm");
}
