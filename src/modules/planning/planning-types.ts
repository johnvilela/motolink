import { z } from "zod";
import { planningPeriodConst } from "@/constants/planning-period";
import { normalizeDateOnlyValue } from "@/utils/date-time";

const dateOnlySchema = z.preprocess(
  normalizeDateOnlyValue,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Data inválida" }),
);

export const planningUpsertInputSchema = z.object({
  clientId: z.uuid({ message: "ID do cliente inválido" }),
  plannedDate: dateOnlySchema,
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
  branchId: z.uuid({ message: "ID da filial inválido" }).optional(),
  groupId: z.uuid({ message: "ID do grupo inválido" }).optional(),
  regionId: z.uuid({ message: "ID da região inválido" }).optional(),
  clientId: z.uuid({ message: "ID do cliente inválido" }).optional(),
  startAt: dateOnlySchema,
  endAt: dateOnlySchema.optional(),
});

export type PlanningListQueryDTO = z.infer<typeof planningListQuerySchema>;
