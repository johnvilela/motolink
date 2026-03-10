import { errAsync, okAsync } from "neverthrow";
import { historyTraceActionConst, historyTraceEntityConst } from "@/constants/history-trace";
import { db } from "@/lib/database";
import { historyTracesService } from "../history-traces/history-traces-service";
import type { GroupListQueryDTO, GroupMutateDTO } from "./groups-types";

export function groupsService() {
  return {
    async create(body: GroupMutateDTO, loggedUserId: string) {
      try {
        const group = await db.group.create({ data: body });

        historyTracesService()
          .create({
            userId: loggedUserId,
            action: historyTraceActionConst.CREATED,
            entityType: historyTraceEntityConst.GROUP,
            entityId: group.id,
            newObject: group,
          })
          .catch(() => {});

        return okAsync(group);
      } catch (error) {
        console.error("Error creating group:", error);
        return errAsync({ reason: "Não foi possível criar o grupo", statusCode: 500 });
      }
    },

    async update(id: string, body: GroupMutateDTO, loggedUserId: string) {
      try {
        const existing = await db.group.findUnique({ where: { id } });

        if (!existing) {
          return errAsync({ reason: "Grupo não encontrado", statusCode: 404 });
        }

        const updated = await db.group.update({ where: { id }, data: body });

        historyTracesService()
          .create({
            userId: loggedUserId,
            action: historyTraceActionConst.UPDATED,
            entityType: historyTraceEntityConst.GROUP,
            entityId: updated.id,
            oldObject: existing,
            newObject: updated,
          })
          .catch(() => {});

        return okAsync(updated);
      } catch (error) {
        console.error("Error updating group:", error);
        return errAsync({ reason: "Não foi possível atualizar o grupo", statusCode: 500 });
      }
    },

    async getById(id: string) {
      try {
        const group = await db.group.findUnique({ where: { id } });

        if (!group) {
          return errAsync({ reason: "Grupo não encontrado", statusCode: 404 });
        }

        return okAsync(group);
      } catch (error) {
        console.error("Error fetching group:", error);
        return errAsync({ reason: "Não foi possível buscar o grupo", statusCode: 500 });
      }
    },

    async listAll(query: GroupListQueryDTO) {
      try {
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
          }),
        ]);

        return okAsync({
          data,
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
          },
        });
      } catch (error) {
        console.error("Error listing groups:", error);
        return errAsync({ reason: "Não foi possível listar os grupos", statusCode: 500 });
      }
    },

    async delete(id: string, loggedUserId: string) {
      try {
        const existing = await db.group.findUnique({ where: { id } });

        if (!existing) {
          return errAsync({ reason: "Grupo não encontrado", statusCode: 404 });
        }

        const clientCount = await db.client.count({ where: { groupId: id, isDeleted: false } });

        if (clientCount > 0) {
          return errAsync({
            reason: "Não é possível excluir um grupo com clientes ativos vinculados a ele",
            statusCode: 422,
          });
        }

        await db.group.delete({ where: { id } });

        historyTracesService()
          .create({
            userId: loggedUserId,
            action: historyTraceActionConst.DELETED,
            entityType: historyTraceEntityConst.GROUP,
            entityId: id,
            oldObject: existing,
            newObject: existing,
          })
          .catch(() => {});

        return okAsync({ id });
      } catch (error) {
        console.error("Error deleting group:", error);
        return errAsync({ reason: "Não foi possível excluir o grupo", statusCode: 500 });
      }
    },
  };
}
