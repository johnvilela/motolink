import { db } from "../../lib/database";
import { hash } from "../../lib/hash";
import { AppError } from "../../utils/app-error";
import type { CreateSessionDTO } from "./sessions-types";

const EXPIRATION_DAYS = Number(process.env.AUTH_EXPIRATION_DAYS ?? 7);

export function sessionsService() {
  return {
    async create({ email, password }: CreateSessionDTO) {
      const user = await db.user.findUnique({ where: { email } });

      if (!user || !user.password) {
        throw new AppError("Credenciais inválidas", 401);
      }

      if (user.status !== "ACTIVE") {
        throw new AppError("Usuário não está ativo", 403);
      }

      const isValidPassword = await hash().compare(password, user.password);

      if (!isValidPassword) {
        throw new AppError("Credenciais inválidas", 401);
      }

      const token = crypto.randomUUID();

      const expiresAt = new Date(
        Date.now() + EXPIRATION_DAYS * 24 * 60 * 60 * 1000,
      );

      const session = await db.session.create({
        data: { token, userId: user.id, expiresAt },
      });

      const { password: _, ...userWithoutPassword } = user;

      return {
        session: { token: session.token, expiresAt: session.expiresAt },
        user: userWithoutPassword,
      };
    },

    async delete(token: string) {
      await db.session.delete({ where: { token } });
    },
  };
}
