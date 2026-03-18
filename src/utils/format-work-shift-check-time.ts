import { dbTimeToTimeString } from "./date-time";

export function formatWorkShiftCheckTime(value: string | Date | null | undefined, fallback = ""): string {
  return dbTimeToTimeString(value, fallback);
}
