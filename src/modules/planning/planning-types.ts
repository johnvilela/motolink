import dayjs from "dayjs";
import { z } from "zod";
import { planningPeriodConst } from "@/constants/planning-period";

export const planningUpsertInputSchema = z.object({
  clientId: z.uuid({ message: "ID do cliente inválido" }),
  plannedDate: z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const parsedDate = dayjs(value);
        return parsedDate.isValid() ? parsedDate.startOf("day").toDate() : value;
      }

      return value;
    },
    z.coerce.date({ message: "Data de planejamento inválida" }),
  ),
  plannedCount: z.number().int().min(0, { message: "A quantidade planejada deve ser ao menos 0" }),
  period: z
    .enum([planningPeriodConst.DAYTIME, planningPeriodConst.NIGHTTIME], { message: "O período é obrigatório" })
    .default(planningPeriodConst.DAYTIME),
});

export type PlanningUpsertInputDTO = z.infer<typeof planningUpsertInputSchema>;

export const planningUpsertSchema = planningUpsertInputSchema.extend({
  branchId: z.uuid({ message: "ID da filial inválido" }),
});

export type PlanningUpsertDTO = z.infer<typeof planningUpsertSchema>;

export const planningListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  branchId: z.uuid().optional(),
  groupId: z.uuid().optional(),
  regionId: z.uuid().optional(),
  clientId: z.uuid().optional(),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
});

export type PlanningListQueryDTO = z.infer<typeof planningListQuerySchema>;

export const planningWeekQuerySchema = z.object({
  branchId: z.uuid({ message: "ID da filial inválido" }),
  startAt: z.coerce.date({ message: "Data de início inválida" }),
  endAt: z.coerce.date({ message: "Data de fim inválida" }),
  groupId: z.uuid().optional(),
  clientId: z.uuid().optional(),
});

export type PlanningWeekQueryDTO = z.infer<typeof planningWeekQuerySchema>;
