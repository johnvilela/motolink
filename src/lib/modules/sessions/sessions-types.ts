import { z } from "zod";
import { passwordRegex } from "@/lib/utils/password-regex";

export const createSessionSchema = z.object({
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

export type CreateSessionDTO = z.infer<typeof createSessionSchema>;
