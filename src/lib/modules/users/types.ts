import { z } from "zod";
import { passwordRegex } from "@/lib/constants/password-regex";

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Nome é obrigatório" })
    .max(100, { message: "Nome deve conter no máximo 100 caracteres" }),
  email: z.email({ message: "Email inválido" }),
  password: z
    .string()
    .min(8, { message: "Senha deve conter no mínimo 8 caracteres" })
    .max(128, { message: "Senha deve conter no máximo 128 caracteres" })
    .regex(passwordRegex, {
      message:
        "Senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial",
    }),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
