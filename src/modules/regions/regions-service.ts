import { errAsync, okAsync } from "neverthrow";
import { historyTraceActionConst, historyTraceEntityConst } from "@/constants/history-trace";
import { db } from "@/lib/database";
import { historyTracesService } from "../history-traces/history-traces-service";
import type { RegionListQueryDTO, RegionMutateDTO } from "./regions-types";

export function regionsService() {
  return {
    async create(body: RegionMutateDTO, loggedUserId: string) {
      try {
        const region = await db.region.create({ data: body });

        historyTracesService()
          .create({
            userId: loggedUserId,
            action: historyTraceActionConst.CREATED,
            entityType: historyTraceEntityConst.REGION,
            entityId: region.id,
            newObject: region,
          })
          .catch(() => {});

        return okAsync(region);
      } catch (error) {
        console.error("Error creating region:", error);
        return errAsync({ reason: "Não foi possível criar a região", statusCode: 500 });
      }
    },

    async update(id: string, body: RegionMutateDTO, loggedUserId: string) {
      try {
        const existing = await db.region.findUnique({ where: { id } });

        if (!existing) {
          return errAsync({ reason: "Região não encontrada", statusCode: 404 });
        }

        const updated = await db.region.update({ where: { id }, data: body });

        historyTracesService()
          .create({
            userId: loggedUserId,
            action: historyTraceActionConst.UPDATED,
            entityType: historyTraceEntityConst.REGION,
            entityId: updated.id,
            oldObject: existing,
            newObject: updated,
          })
          .catch(() => {});

        return okAsync(updated);
      } catch (error) {
        console.error("Error updating region:", error);
        return errAsync({ reason: "Não foi possível atualizar a região", statusCode: 500 });
      }
    },

    async getById(id: string) {
      try {
        const region = await db.region.findUnique({ where: { id } });

        if (!region) {
          return errAsync({ reason: "Região não encontrada", statusCode: 404 });
        }

        return okAsync(region);
      } catch (error) {
        console.error("Error fetching region:", error);
        return errAsync({ reason: "Não foi possível buscar a região", statusCode: 500 });
      }
    },

    async listAll(query: RegionListQueryDTO) {
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
          db.region.count({ where }),
          db.region.findMany({
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
        console.error("Error listing regions:", error);
        return errAsync({ reason: "Não foi possível listar as regiões", statusCode: 500 });
      }
    },

    async delete(id: string, loggedUserId: string) {
      try {
        const existing = await db.region.findUnique({ where: { id } });

        if (!existing) {
          return errAsync({ reason: "Região não encontrada", statusCode: 404 });
        }

        const [clientCount, deliverymanCount] = await Promise.all([
          db.client.count({ where: { regionId: id, isDeleted: false } }),
          db.deliveryman.count({ where: { regionId: id, isDeleted: false } }),
        ]);

        if (clientCount > 0 || deliverymanCount > 0) {
          return errAsync({
            reason: "Não é possível excluir uma região com clientes ou entregadores ativos vinculados a ela",
            statusCode: 422,
          });
        }

        await db.region.delete({ where: { id } });

        historyTracesService()
          .create({
            userId: loggedUserId,
            action: historyTraceActionConst.DELETED,
            entityType: historyTraceEntityConst.REGION,
            entityId: id,
            oldObject: existing,
            newObject: existing,
          })
          .catch(() => {});

        return okAsync({ id });
      } catch (error) {
        console.error("Error deleting region:", error);
        return errAsync({ reason: "Não foi possível excluir a região", statusCode: 500 });
      }
    },
  };
}
