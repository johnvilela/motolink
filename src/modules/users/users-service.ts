import {
  historyTraceActionConst,
  historyTraceEntityConst,
} from "@/constants/history-trace";
import { statusConst } from "@/constants/status";
import { db } from "@/lib/database";
import { hash } from "@/lib/hash";
import { whatsapp } from "@/lib/whatsapp";
import { AppError } from "@/utils/app-error";
import { generateSecureToken } from "@/utils/generate-secure-token";
import { historyTracesService } from "../history-traces/history-traces-service";
import type { UserListQueryDTO, UserMutateDTO } from "./users-types";

export function usersService() {
  return {
    async create(body: UserMutateDTO, loggedUserId: string) {
      const data = { ...body, status: statusConst.PENDING as string };

      if (data.password) {
        data.password = await hash().create(data.password);
        data.status = statusConst.ACTIVE as string;
      }

      const user = await db.user.create({
        data: {
          ...data,
        },
        omit: {
          password: true,
        },
      });

      if (data.status === statusConst.PENDING && !data.password) {
        const token = await generateSecureToken();

        await db.verificationToken.create({
          data: {
            userId: user.id,
            token,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });

        if (user.phone) {
          await whatsapp().usersInvite(user.phone, {
            token,
            name: user.name,
          });
        }
      }

      historyTracesService()
        .create({
          userId: loggedUserId,
          action: historyTraceActionConst.CREATED,
          entityType: historyTraceEntityConst.USER,
          entityId: user.id,
          newObject: user,
        })
        .catch(() => {});

      return user;
    },

    async getById(id: string) {
      return db.user.findUnique({
        where: { id },
        omit: { password: true },
      });
    },

    async listAll(query: UserListQueryDTO) {
      const { page, pageSize, search, branchId } = query;
      const skip = (page - 1) * pageSize;

      const where = {
        isDeleted: false,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(branchId && {
          branches: { has: branchId },
        }),
      };

      const [total, data] = await Promise.all([
        db.user.count({ where }),
        db.user.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          omit: { password: true },
        }),
      ]);

      return {
        data,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    },

    async update(id: string, body: UserMutateDTO, loggedUserId: string) {
      const existingUser = await db.user.findUnique({
        where: { id },
        omit: { password: true },
      });

      if (!existingUser) {
        return new AppError("Usuário não encontrado", 404);
      }

      if (existingUser.isDeleted) {
        return new AppError("Usuário já foi excluído", 400);
      }

      const updateData = { ...body };

      if (updateData.password) {
        updateData.password = await hash().create(updateData.password);
      }

      if (updateData.email) {
        const emailExists = await db.user.findFirst({
          where: {
            email: updateData.email,
            id: { not: id },
            isDeleted: false,
          },
        });

        if (emailExists) {
          return new AppError("E-mail já está em uso por outro usuário", 400);
        }
      }

      const updatedUser = await db.user.update({
        where: { id },
        data: updateData,
        omit: { password: true },
      });

      historyTracesService()
        .create({
          userId: loggedUserId,
          action: historyTraceActionConst.UPDATED,
          entityType: historyTraceEntityConst.USER,
          entityId: id,
          newObject: updatedUser,
          oldObject: existingUser,
        })
        .catch(() => {});

      return updatedUser;
    },

    async delete(id: string, loggedUserId: string) {
      const existingUser = await db.user.findUnique({
        where: { id },
        omit: { password: true },
      });

      if (!existingUser) {
        return new AppError("Usuário não encontrado", 404);
      }

      if (existingUser.isDeleted) {
        return new AppError("Usuário já foi excluído", 400);
      }

      const deletedUser = await db.user.update({
        where: { id },
        data: { isDeleted: true },
        omit: { password: true },
      });

      await db.session.deleteMany({
        where: { userId: id },
      });

      historyTracesService()
        .create({
          userId: loggedUserId,
          action: historyTraceActionConst.DELETED,
          entityType: historyTraceEntityConst.USER,
          entityId: id,
          newObject: deletedUser,
          oldObject: existingUser,
        })
        .catch(() => {});

      return { success: true };
    },
  };
}
