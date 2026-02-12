import z from "zod";

export const groupMutateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  branchId: z.string().min(1, "Filial é obrigatória"),
});

export type GroupMutateDTO = z.infer<typeof groupMutateSchema>;
export type GroupMutateInput = z.input<typeof groupMutateSchema>;

export const groupListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  branchId: z.string().optional(),
});

export type GroupListQueryDTO = z.infer<typeof groupListQuerySchema>;
