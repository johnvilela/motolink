import { auth } from "@/lib/services/auth";
import type { CreateUserDTO } from "./types";

export async function createUser({ name, email, password }: CreateUserDTO) {
  try {
    const res = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    return res;
  } catch (err) {
    console.log(err);
    throw new Error("Erro ao criar usuário");
  }
}
