import z from "zod";

export const commercialConditionSchema = z.object({
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

export const clientMutateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string().min(1, "CNPJ é obrigatório"),
  cep: z.string().min(1, "CEP é obrigatório"),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  city: z.string().min(1, "Cidade é obrigatória"),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  uf: z.string().min(1, "UF é obrigatória"),
  observations: z.string().optional().default(""),
  regionId: z.string().nullable().optional(),
  groupId: z.string().nullable().optional(),
  contactName: z.string().min(1, "Nome do contato é obrigatório"),
  contactPhone: z.string().optional().default(""),
  provideMeal: z.boolean().optional().default(false),
  commercialCondition: commercialConditionSchema.optional(),
});

export type ClientMutateDTO = z.infer<typeof clientMutateSchema> & {
  branchId: string;
};
export type ClientMutateInput = z.input<typeof clientMutateSchema>;

export const clientListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  branchId: z.string().optional(),
  regionId: z.string().optional(),
  groupId: z.string().optional(),
});

export type ClientListQueryDTO = z.infer<typeof clientListQuerySchema>;
