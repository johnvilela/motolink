import { z } from "zod";

export const clientMutateSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  cnpj: z.string().min(1, { message: "CNPJ é obrigatório" }),
  cep: z.string().min(1, { message: "CEP é obrigatório" }),
  street: z.string().min(1, { message: "Rua é obrigatória" }),
  number: z.string().min(1, { message: "Número é obrigatório" }),
  complement: z.string().optional(),
  city: z.string().min(1, { message: "Cidade é obrigatória" }),
  neighborhood: z.string().min(1, { message: "Bairro é obrigatório" }),
  uf: z.string().min(2, { message: "UF deve ter 2 caracteres" }).max(2, { message: "UF deve ter 2 caracteres" }),
  observations: z.string().default(""),
  regionId: z.string().uuid({ message: "ID da região inválido" }).optional(),
  groupId: z.string().uuid({ message: "ID do grupo inválido" }).optional(),
  contactName: z.string().min(1, { message: "Nome do contato é obrigatório" }),
  contactPhone: z.string().default(""),
  provideMeal: z.boolean().default(false),
  branchId: z.string().uuid({ message: "ID da filial inválido" }),
});

export type ClientMutateDTO = z.infer<typeof clientMutateSchema>;

export const clientCommercialConditionSchema = z.object({
  bagsStatus: z.string().optional(),
  bagsAllocated: z.coerce.number().int().optional(),
  paymentForm: z.array(z.string()).optional(),
  dailyPeriods: z.array(z.string()).optional(),
  guaranteedPeriods: z.array(z.string()).optional(),
  deliveryAreaKm: z.coerce.number().optional(),
  isMotolinkCovered: z.boolean().optional(),
  guaranteedDay: z.coerce.number().int().optional(),
  guaranteedDayWeekend: z.coerce.number().int().optional(),
  guaranteedNight: z.coerce.number().int().optional(),
  guaranteedNightWeekend: z.coerce.number().int().optional(),
  clientDailyDay: z.coerce.number().optional(),
  clientDailyDayWknd: z.coerce.number().optional(),
  clientDailyNight: z.coerce.number().optional(),
  clientDailyNightWknd: z.coerce.number().optional(),
  clientPerDelivery: z.coerce.number().optional(),
  clientAdditionalKm: z.coerce.number().optional(),
  deliverymanDailyDay: z.coerce.number().optional(),
  deliverymanDailyDayWknd: z.coerce.number().optional(),
  deliverymanDailyNight: z.coerce.number().optional(),
  deliverymanDailyNightWknd: z.coerce.number().optional(),
  deliverymanPerDelivery: z.coerce.number().optional(),
  deliverymanAdditionalKm: z.coerce.number().optional(),
});

export const clientUpdateSchema = clientMutateSchema.merge(clientCommercialConditionSchema);

export type ClientUpdateDTO = z.infer<typeof clientUpdateSchema>;

export const clientListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  groupId: z.string().optional(),
  regionId: z.string().optional(),
  branchId: z.string().optional(),
});

export type ClientListQueryDTO = z.infer<typeof clientListQuerySchema>;
