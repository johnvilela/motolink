import z from "zod";
import { contractTypeArr } from "./deliverymen-constants";

export const MutateDeliverymanSchema = z.object({
  id: z.string().optional(),
  name: z
    .string("Nome é obrigatório")
    .trim()
    .min(3, { message: "Nome deve conter no mínimo 3 caracteres" })
    .max(255, { message: "Nome deve conter no máximo 255 caracteres" }),
  document: z
    .string("Documento é obrigatório")
    .trim()
    .min(1, { message: "Documento é obrigatório" })
    .max(50, { message: "Documento deve conter no máximo 50 caracteres" }),
  phone: z
    .string("Telefone é obrigatório")
    .trim()
    .min(1, { message: "Telefone é obrigatório" })
    .max(20, { message: "Telefone deve conter no máximo 20 caracteres" }),
  contractType: z.enum(contractTypeArr),
  mainPixKey: z
    .string("Chave PIX principal é obrigatória")
    .trim()
    .min(1, { message: "Chave PIX principal é obrigatória" })
    .max(255, { message: "Chave PIX principal deve conter no máximo 255 caracteres" }),
  secondPixKey: z
    .string("Chave PIX secundária é obrigatória")
    .trim()
    .min(1, { message: "Chave PIX secundária é obrigatória" })
    .max(255, { message: "Chave PIX secundária deve conter no máximo 255 caracteres" }),
  thridPixKey: z
    .string("Chave PIX terciária é obrigatória")
    .trim()
    .min(1, { message: "Chave PIX terciária é obrigatória" })
    .max(255, { message: "Chave PIX terciária deve conter no máximo 255 caracteres" }),
  agency: z
    .string("Agência é obrigatória")
    .trim()
    .min(1, { message: "Agência é obrigatória" })
    .max(50, { message: "Agência deve conter no máximo 50 caracteres" }),
  account: z
    .string("Conta é obrigatória")
    .trim()
    .min(1, { message: "Conta é obrigatória" })
    .max(50, { message: "Conta deve conter no máximo 50 caracteres" }),
  vehicleModel: z
    .string("Modelo do veículo é obrigatório")
    .trim()
    .min(1, { message: "Modelo do veículo é obrigatório" })
    .max(255, { message: "Modelo do veículo deve conter no máximo 255 caracteres" }),
  vehiclePlate: z
    .string("Placa do veículo é obrigatória")
    .trim()
    .min(1, { message: "Placa do veículo é obrigatória" })
    .max(20, { message: "Placa do veículo deve conter no máximo 20 caracteres" }),
  vehicleColor: z
    .string("Cor do veículo é obrigatória")
    .trim()
    .min(1, { message: "Cor do veículo é obrigatória" })
    .max(50, { message: "Cor do veículo deve conter no máximo 50 caracteres" }),
  regionId: z.string().optional().nullable(),
  branch: z.string().default(""),
});

export const ListDeliverymenSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  name: z.string().trim().min(1).optional(),
  document: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
  branch: z.string().optional(),
  regionId: z.string().optional(),
  contractType: z.enum(contractTypeArr).optional(),
});

export type MutateDeliverymanDTO = z.infer<typeof MutateDeliverymanSchema>;
export type ListDeliverymenDTO = z.infer<typeof ListDeliverymenSchema>;
