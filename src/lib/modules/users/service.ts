import { auth } from "@/lib/services/auth";
import { AppError } from "@/lib/utils/app-error";
import type { CreateUserDTO } from "./types";

export function userService() {
  return {
    async create({ name, email, password }: CreateUserDTO) {
      try {
        const res = await auth.api.signUpEmail({
          body: {
            name,
            email,
            password,
          },
        });

        return res;
      } catch (err: unknown) {
        throw new AppError({
          error: err,
          message: "Erro ao criar usuário",
        });
      }
    },
  };
}
