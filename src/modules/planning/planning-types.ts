import { z } from "zod";

export const planningUpsertSchema = z.object({
  clientId: z.uuid({ message: "ID do cliente inválido" }),
  branchId: z.uuid({ message: "ID da filial inválido" }),
  plannedDate: z.coerce.date({ message: "Data de planejamento inválida" }),
  plannedCount: z.number().int().min(1, { message: "A quantidade planejada deve ser ao menos 1" }),
  period: z.string().min(1, { message: "O período é obrigatório" }).default("diurno"),
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
