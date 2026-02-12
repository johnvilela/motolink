import {
  historyTraceActionConst,
  historyTraceEntityConst,
} from "@/constants/history-trace";
import { db } from "@/lib/database";
import { AppError } from "@/utils/app-error";
import { historyTracesService } from "../history-traces/history-traces-service";
import type { RegionListQueryDTO, RegionMutateDTO } from "./regions-types";

export function regionsService() {
  return {
    async create(body: RegionMutateDTO, loggedUserId: string) {
      const region = await db.region.create({
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
          entityType: historyTraceEntityConst.REGION,
          entityId: region.id,
          newObject: region,
        })
        .catch(() => {});

      return region;
    },

    async getById(id: string) {
      return db.region.findUnique({
        where: { id },
        include: { branch: true },
      });
    },

    async listAll(query: RegionListQueryDTO) {
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

    async update(id: string, body: RegionMutateDTO, loggedUserId: string) {
      const existingRegion = await db.region.findUnique({
        where: { id },
        include: { branch: true },
      });

      if (!existingRegion) {
        return new AppError("Região não encontrada", 404);
      }

      const updatedRegion = await db.region.update({
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
          entityType: historyTraceEntityConst.REGION,
          entityId: id,
          newObject: updatedRegion,
          oldObject: existingRegion,
        })
        .catch(() => {});

      return updatedRegion;
    },

    async delete(id: string, loggedUserId: string) {
      const existingRegion = await db.region.findUnique({
        where: { id },
        include: {
          branch: true,
          deliverymen: { select: { id: true }, take: 1 },
          clients: { select: { id: true }, take: 1 },
        },
      });

      if (!existingRegion) {
        return new AppError("Região não encontrada", 404);
      }

      if (
        existingRegion.deliverymen.length > 0 ||
        existingRegion.clients.length > 0
      ) {
        return new AppError(
          "Nao e possivel excluir a regiao pois existem entregadores ou clientes vinculados",
          400,
        );
      }

      await db.region.delete({ where: { id } });

      const { deliverymen, clients, ...regionWithoutRelations } =
        existingRegion;

      historyTracesService()
        .create({
          userId: loggedUserId,
          action: historyTraceActionConst.DELETED,
          entityType: historyTraceEntityConst.REGION,
          entityId: id,
          newObject: regionWithoutRelations,
          oldObject: regionWithoutRelations,
        })
        .catch(() => {});

      return { success: true };
    },
  };
}
