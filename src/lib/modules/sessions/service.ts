import { auth } from "@/lib/services/auth";
import { AppError } from "@/lib/utils/app-error";
import type { CreateSessionDTO } from "./types";

async function createSession({ email, password }: CreateSessionDTO) {
  try {
    const res = await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe: true,
      },
    });

    return res;
  } catch (err) {
    console.log(err);
    throw new AppError({ error: err, message: "Erro ao realizar login" });
  }
}

export { createSession };
