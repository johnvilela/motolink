import z from "zod";
import { UserTypesArr } from "@/lib/constants/user-types";
import { passwordRegex } from "@/lib/utils/password-regex";

export const MutateUserSchema = z.object({
  id: z.string().optional(),
  name: z
    .string({
      error: "Nome é obrigatório",
    })
    .trim()
    .min(3)
    .max(255),
  email: z.email("Email inválido"),
  password: z
    .string()
    .min(8, { message: "Senha deve conter no mínimo 8 caracteres" })
    .max(128, { message: "Senha deve conter no máximo 128 caracteres" })
    .regex(passwordRegex, {
      message:
        "Senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial",
    }),
  role: z.enum(UserTypesArr),
});

export type MutateUserDTO = z.infer<typeof MutateUserSchema>;
