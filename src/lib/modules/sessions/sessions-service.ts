import dayjs from "dayjs";
import { db } from "@/lib/services/database";
import { hashService } from "@/lib/services/hash-service";
import { AppError } from "@/lib/utils/app-error";
import type { CreateSessionDTO } from "./sessions-types";

const EXPIRES_AT = Number(process.env.SESSION_EXPIRES_AT_DAYS || 1);

export function sessionsService() {
  return {
    async create({ email, password }: CreateSessionDTO) {
      const user = await db.user.findUnique({
        where: { email },
      });

      if (!user || !user.password) {
        throw new AppError("Credenciais inválidas", 401);
      }

      const isValidPassword = hashService().compare(password, user.password);

      if (!isValidPassword) {
        throw new AppError("Credenciais inválidas", 401);
      }

      const expiresAt = dayjs().add(EXPIRES_AT, "day").toDate();
      const bytes = crypto.getRandomValues(new Uint8Array(32));
      const token = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const session = await db.session.create({
        data: {
          expiresAt,
          userId: user.id,
          token,
        },
        select: {
          token: true,
          expiresAt: true,
          user: {
            select: {
              id: true,
              role: true,
            },
          },
        },
      });

      return session;
    },
    async getByToken(token: string) {
      const session = await db.session.findUnique({
        where: { token },
        select: {
          expiresAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              permissions: true,
              branchs: true,
            },
          },
        },
      });

      if (!session) {
        throw new AppError("Sessão inválida", 401);
      }

      if (dayjs().isAfter(dayjs(session.expiresAt))) {
        throw new AppError("Sessão expirada", 401);
      }

      return session;
    },
    async delete(token: string) {
      return db.session.deleteMany({
        where: { token },
      });
    },
  };
}

export type SessionsServiceType = ReturnType<typeof sessionsService>;
export type CreateSessionResponse = Awaited<
  ReturnType<SessionsServiceType["create"]>
>;
export type GetBytokenResponse = Awaited<
  ReturnType<SessionsServiceType["getByToken"]>
>;
