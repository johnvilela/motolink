import z from "zod";

export const CommercialConditionSchema = z.object({
  paymentForm: z.array(z.string()).optional(),
  deliveryAreaKm: z.number().optional(),
  isMotolinkCovered: z.boolean().optional(),
  guaranteedDay: z.number().int().optional(),
  guaranteedDayWeekend: z.number().int().optional(),
  guaranteedNight: z.number().int().optional(),
  guaranteedNightWeekend: z.number().int().optional(),
  clientDailyDay: z.number().optional(),
  clientDailyDayWknd: z.number().optional(),
  clientDailyNight: z.number().optional(),
  clientDailyNightWknd: z.number().optional(),
  clientPerDelivery: z.number().optional(),
  clientAdditionalKm: z.number().optional(),
  courierDailyDay: z.number().optional(),
  courierDailyDayWknd: z.number().optional(),
  courierDailyNight: z.number().optional(),
  courierDailyNightWknd: z.number().optional(),
  courierPerDelivery: z.number().optional(),
  courierAdditionalKm: z.number().optional(),
});

export const MutateClientSchema = z.object({
  id: z.string().optional(),
  name: z
    .string("Nome é obrigatório")
    .trim()
    .min(3, { message: "Nome deve conter no mínimo 3 caracteres" })
    .max(255, { message: "Nome deve conter no máximo 255 caracteres" }),
  cnpj: z
    .string("CNPJ é obrigatório")
    .trim()
    .min(1, { message: "CNPJ é obrigatório" })
    .max(32, { message: "CNPJ deve conter no máximo 32 caracteres" }),
  cep: z
    .string("CEP é obrigatório")
    .trim()
    .min(1, { message: "CEP é obrigatório" })
    .max(20, { message: "CEP deve conter no máximo 20 caracteres" }),
  street: z
    .string("Rua é obrigatória")
    .trim()
    .min(1, { message: "Rua é obrigatória" })
    .max(255, { message: "Rua deve conter no máximo 255 caracteres" }),
  number: z
    .string("Número é obrigatório")
    .trim()
    .min(1, { message: "Número é obrigatório" })
    .max(50, { message: "Número deve conter no máximo 50 caracteres" }),
  complement: z
    .string("Complemento é obrigatório")
    .trim()
    .min(1, { message: "Complemento é obrigatório" })
    .max(255, { message: "Complemento deve conter no máximo 255 caracteres" }),
  city: z
    .string("Cidade é obrigatória")
    .trim()
    .min(1, { message: "Cidade é obrigatória" })
    .max(255, { message: "Cidade deve conter no máximo 255 caracteres" }),
  neighborhood: z
    .string("Bairro é obrigatório")
    .trim()
    .min(1, { message: "Bairro é obrigatório" })
    .max(255, { message: "Bairro deve conter no máximo 255 caracteres" }),
  uf: z
    .string("UF é obrigatório")
    .trim()
    .length(2, { message: "UF deve conter 2 caracteres" }),
  regionId: z.string().optional().nullable(),
  groupId: z.string().optional().nullable(),
  contactName: z
    .string("Contato é obrigatório")
    .trim()
    .min(3, { message: "Contato deve conter no mínimo 3 caracteres" })
    .max(255, { message: "Contato deve conter no máximo 255 caracteres" }),
  branch: z.string().default(""),
  createdBy: z.string().optional(),
  commercialCondition: CommercialConditionSchema.optional(),
});

export const ListClientsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  name: z.string().trim().min(1).optional(),
  branch: z.string().optional(),
  cnpj: z.string().trim().min(1).optional(),
});

export type MutateClientDTO = z.infer<typeof MutateClientSchema>;
export type ListClientsDTO = z.infer<typeof ListClientsSchema>;
export type CommercialConditionDTO = z.infer<typeof CommercialConditionSchema>;
