import z from "zod";
import { passwordRegex } from "@/lib/utils/password-regex";
import { userRolesArr } from "./users-constants";

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
    })
    .optional(),
  role: z.enum(userRolesArr),
  branchs: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
});

export const changePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Senha deve conter no mínimo 8 caracteres" })
      .max(128, { message: "Senha deve conter no máximo 128 caracteres" })
      .regex(passwordRegex, {
        message:
          "Senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial",
      }),
    passwordConfirmation: z.string(),
    token: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não coincidem",
    path: ["passwordConfirmation"],
  });

export type MutateUserDTO = z.infer<typeof MutateUserSchema>;
