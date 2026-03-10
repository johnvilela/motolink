import { z } from "zod";

export const branchListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
});

export type BranchListQueryDTO = z.infer<typeof branchListQuerySchema>;
