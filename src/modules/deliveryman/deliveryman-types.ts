import z from "zod";

export const deliverymanMutateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  document: z.string().min(1, "Documento é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  contractType: z.string().min(1, "Tipo de contrato é obrigatório"),
  mainPixKey: z.string().min(1, "Chave PIX principal é obrigatória"),
  secondPixKey: z.string().optional(),
  thridPixKey: z.string().optional(),
  agency: z.string().optional(),
  account: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehiclePlate: z.string().optional(),
  vehicleColor: z.string().optional(),
  files: z.array(z.string()).optional(),
  regionId: z.string().optional(),
});

export type DeliverymanMutateDTO = z.infer<typeof deliverymanMutateSchema> & {
  branchId: string;
};
export type DeliverymanMutateInput = z.input<typeof deliverymanMutateSchema>;

export const deliverymanListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  branchId: z.string().optional(),
});

export type DeliverymanListQueryDTO = z.infer<
  typeof deliverymanListQuerySchema
>;
