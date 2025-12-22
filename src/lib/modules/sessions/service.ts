import { auth } from "@/lib/services/auth";
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
    throw new Error("Erro ao realizar login");
  }
}

export { createSession};
