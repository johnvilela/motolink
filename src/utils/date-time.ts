import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const SAO_PAULO_TIME_ZONE = "America/Sao_Paulo";

const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_STRING_REGEX = /^\d{2}:\d{2}(:\d{2})?$/;

function getDateTimePartsInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  return {
    year: parts.find((part) => part.type === "year")?.value ?? "0000",
    month: parts.find((part) => part.type === "month")?.value ?? "00",
    day: parts.find((part) => part.type === "day")?.value ?? "00",
    hour: parts.find((part) => part.type === "hour")?.value ?? "00",
    minute: parts.find((part) => part.type === "minute")?.value ?? "00",
  };
}

export function isDateKey(value: string): boolean {
  return DATE_KEY_REGEX.test(value);
}

export function isTimeString(value: string): boolean {
  return TIME_STRING_REGEX.test(value);
}

export function normalizeDateOnlyValue(value: unknown) {
  if (value instanceof Date) {
    const parsedDate = dayjs.utc(value);
    return parsedDate.isValid() ? parsedDate.format("YYYY-MM-DD") : value;
  }

  if (typeof value === "string") {
    if (isDateKey(value)) return value;

    const parsedDate = dayjs.utc(value);
    return parsedDate.isValid() ? parsedDate.format("YYYY-MM-DD") : value;
  }

  return value;
}

export function dateKeyToDbDate(dateKey: string): Date {
  return dayjs.utc(dateKey).toDate();
}

export function dbDateToDateKey(value: string | Date | null | undefined, fallback = ""): string {
  if (!value) return fallback;

  const rawValue = value instanceof Date ? value.toISOString() : String(value);
  if (isDateKey(rawValue)) return rawValue;

  const parsedDate = dayjs.utc(rawValue);
  if (!parsedDate.isValid()) {
    return fallback || rawValue;
  }

  return parsedDate.format("YYYY-MM-DD");
}

export function formatDbDate(value: string | Date | null | undefined, fallback = ""): string {
  const dateKey = dbDateToDateKey(value);
  if (!dateKey) return fallback;

  const [year, month, day] = dateKey.split("-");
  return `${day}/${month}/${year}`;
}

export function normalizeTimeString(value: string): string {
  return value.slice(0, 5);
}

export function timeStringToDbTime(time: string): Date {
  const normalized = normalizeTimeString(time);
  return dayjs.utc(`1970-01-01T${normalized}:00Z`).toDate();
}

export function dbTimeToTimeString(value: string | Date | null | undefined, fallback = ""): string {
  if (!value) return fallback;

  const rawValue = value instanceof Date ? value.toISOString() : String(value);

  if (isTimeString(rawValue)) {
    return normalizeTimeString(rawValue);
  }

  const parsedTime = dayjs.utc(rawValue);
  if (!parsedTime.isValid()) {
    return fallback || rawValue;
  }

  return parsedTime.format("HH:mm");
}

export function getCurrentDateKeyInTimeZone(timeZone: string): string {
  const { year, month, day } = getDateTimePartsInTimeZone(new Date(), timeZone);
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeStringInTimeZone(timeZone: string): string {
  const { hour, minute } = getDateTimePartsInTimeZone(new Date(), timeZone);
  return `${hour}:${minute}`;
}

export function getCurrentDateKeyInSaoPaulo(): string {
  return getCurrentDateKeyInTimeZone(SAO_PAULO_TIME_ZONE);
}

export function getCurrentTimeStringInSaoPaulo(): string {
  return getCurrentTimeStringInTimeZone(SAO_PAULO_TIME_ZONE);
}
