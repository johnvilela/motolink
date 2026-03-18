import { dbDateToDateKey } from "@/utils/date-time";
import type { Planning } from "../../../generated/prisma/client";

export function planningTransformer(data: Planning) {
  return {
    ...data,
    plannedDate: dbDateToDateKey(data.plannedDate),
  };
}
