import z from "zod";

export const MutateRegionSchema = z.object({
  id: z.string().optional(),
  name: z
    .string("Nome é obrigatório")
    .trim()
    .min(3, { message: "Nome deve conter no mínimo 3 caracteres" })
    .max(255, { message: "Nome deve conter no máximo 255 caracteres" }),
  description: z
    .string()
    .trim()
    .min(3, { message: "Descrição deve conter no mínimo 3 caracteres" })
    .max(255, { message: "Descrição deve conter no máximo 255 caracteres" })
    .optional(),
  branch: z.string().default(""),
  createdBy: z.string().optional(),
});

export const ListRegionsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  name: z.string().trim().min(1).optional(),
  branch: z.string().optional(),
});

export type MutateRegionDTO = z.infer<typeof MutateRegionSchema>;
export type ListRegionsDTO = z.infer<typeof ListRegionsSchema>;
