import { PAGE_SIZE } from "@/lib/constants/app";
import { db } from "@/lib/services/database";
import { hashService } from "@/lib/services/hash-service";
import { AppError } from "@/lib/utils/app-error";
import { generateToken } from "@/lib/utils/generate-token";
import type { Prisma } from "../../../../generated/prisma/client";
import { type MutateUserDTO, MutateUserSchema } from "./user-types";
import { userStatus } from "./users-constants";

export function usersService() {
  return {
    async create(data: Omit<MutateUserDTO, "id">) {
      const { data: validatedData, error } = MutateUserSchema.omit({
        id: true,
      }).safeParse(data);

      if (error) {
        throw new AppError("Campos inválidos", 400);
      }
      let hashedPassword = "";

      if (validatedData.password) {
        hashedPassword = await hashService().hash(validatedData.password);
      }

      const user = await db.user.create({
        data: {
          ...validatedData,
          password: hashedPassword,
        },
      });

      await db.verificationToken.create({
        data: {
          userId: user.id,
          token: await generateToken(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      return user;
    },

    async delete(id: string) {
      const user = await db.user.update({
        where: { id },
        data: { isDeleted: true },
      });

      return user;
    },

    async getById(id: string) {
      const user = await db.user.findUnique({
        where: { id },
        omit: {
          password: true,
        },
      });

      if (!user) {
        throw new AppError("Usuário não encontrado.", 404);
      }

      return user;
    },

    async list(input: { page?: number; limit?: number; search?: string }) {
      const { page = 1, limit = PAGE_SIZE, search } = input;

      const where: Prisma.UserWhereInput = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
            isDeleted: false,
          }
        : {};

      const [users, count] = await db.$transaction([
        db.user.findMany({
          take: limit,
          skip: (page - 1) * limit,
          where,
          orderBy: {
            id: "asc",
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            permissions: true,
            status: true,
            verificationTokens: {
              select: {
                token: true,
              },
            },
          },
        }),
        db.user.count({}),
      ]);

      return {
        data: users,
        count,
      };
    },

    async changePassword(token: string, newPassword: string) {
      const validToken = await db.verificationToken.findUnique({
        where: { token },
        select: {
          userId: true,
        },
      });

      if (!validToken) {
        throw new AppError("Acesso não autorizado.", 401);
      }

      const hashedPassword = await hashService().hash(newPassword);

      const updatedUser = await db.user.update({
        where: { id: validToken.userId },
        data: {
          password: hashedPassword,
          status: userStatus.ACTIVE,
        },
      });

      await db.verificationToken.deleteMany({
        where: { userId: validToken.userId },
      });

      return updatedUser;
    },

    async update(id: string, data: Partial<Omit<MutateUserDTO, "id">>) {
      const existingUser = await db.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new AppError("Usuário não encontrado.", 404);
      }

      let hashedPassword = data.password;
      if (data.password) {
        hashedPassword = await hashService().hash(data.password);
      }

      const updatedUser = await db.user.update({
        where: { id },
        data: {
          ...data,
          password: hashedPassword,
        },
      });

      return updatedUser;
    },
  };
}

export type UsersService = ReturnType<typeof usersService>;
export type ListUserServiceResponse = Awaited<ReturnType<UsersService["list"]>>;
