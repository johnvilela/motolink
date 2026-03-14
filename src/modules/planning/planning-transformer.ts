import dayjs from "dayjs";
import type { Planning } from "../../../generated/prisma/client";

export function planningTransformer(data: Planning) {
  return {
    ...data,
    plannedDate: dayjs(data.plannedDate).format("YYYY-MM-DD"),
  };
}
