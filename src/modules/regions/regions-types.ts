import { z } from "zod";

export const regionMutateSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  branchId: z.string().uuid(),
});

export type RegionMutateDTO = z.infer<typeof regionMutateSchema>;

export const regionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  branchId: z.string().uuid().optional(),
});

export type RegionListQueryDTO = z.infer<typeof regionListQuerySchema>;
