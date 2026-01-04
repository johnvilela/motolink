import z from "zod";

export const MutateGroupSchema = z.object({
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
  createdBy: z.string().optional(),
});

export const ListGroupsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  name: z.string().trim().min(1).optional(),
});

export type MutateGroupDTO = z.infer<typeof MutateGroupSchema>;
export type ListGroupsDTO = z.infer<typeof ListGroupsSchema>;
