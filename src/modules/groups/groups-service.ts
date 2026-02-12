import {
  historyTraceActionConst,
  historyTraceEntityConst,
} from "@/constants/history-trace";
import { db } from "@/lib/database";
import { AppError } from "@/utils/app-error";
import { historyTracesService } from "../history-traces/history-traces-service";
import type { GroupListQueryDTO, GroupMutateDTO } from "./groups-types";

export function groupsService() {
  return {
    async create(body: GroupMutateDTO, loggedUserId: string) {
      const group = await db.group.create({
        data: {
          name: body.name,
          description: body.description,
          branchId: body.branchId,
        },
        include: { branch: true },
      });

      historyTracesService()
        .create({
          userId: loggedUserId,
          action: historyTraceActionConst.CREATED,
          entityType: historyTraceEntityConst.GROUP,
          entityId: group.id,
          newObject: group,
        })
        .catch(() => {});

      return group;
    },

    async getById(id: string) {
      return db.group.findUnique({
        where: { id },
        include: { branch: true },
      });
    },

    async listAll(query: GroupListQueryDTO) {
      const { page, pageSize, search, branchId } = query;
      const skip = (page - 1) * pageSize;

      const where = {
        ...(search && {
          name: { contains: search, mode: "insensitive" as const },
        }),
        ...(branchId && { branchId }),
      };

      const [total, data] = await Promise.all([
        db.group.count({ where }),
        db.group.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          include: { branch: true },
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

    async update(id: string, body: GroupMutateDTO, loggedUserId: string) {
      const existingGroup = await db.group.findUnique({
        where: { id },
        include: { branch: true },
      });

      if (!existingGroup) {
        return new AppError("Grupo não encontrado", 404);
      }

      const updatedGroup = await db.group.update({
        where: { id },
        data: {
          name: body.name,
          description: body.description,
          branchId: body.branchId,
        },
        include: { branch: true },
      });

      historyTracesService()
        .create({
          userId: loggedUserId,
          action: historyTraceActionConst.UPDATED,
          entityType: historyTraceEntityConst.GROUP,
          entityId: id,
          newObject: updatedGroup,
          oldObject: existingGroup,
        })
        .catch(() => {});

      return updatedGroup;
    },

    async delete(id: string, loggedUserId: string) {
      const existingGroup = await db.group.findUnique({
        where: { id },
        include: { branch: true, clients: { select: { id: true }, take: 1 } },
      });

      if (!existingGroup) {
        return new AppError("Grupo não encontrado", 404);
      }

      if (existingGroup.clients.length > 0) {
        return new AppError(
          "Nao e possivel excluir o grupo pois existem clientes vinculados",
          400,
        );
      }

      await db.group.delete({ where: { id } });

      const { clients: _, ...groupWithoutRelations } = existingGroup;

      historyTracesService()
        .create({
          userId: loggedUserId,
          action: historyTraceActionConst.DELETED,
          entityType: historyTraceEntityConst.GROUP,
          entityId: id,
          newObject: groupWithoutRelations,
          oldObject: groupWithoutRelations,
        })
        .catch(() => {});

      return { success: true };
    },
  };
}
