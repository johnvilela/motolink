import {
  historyTraceActionConst,
  historyTraceEntityConst,
} from "@/constants/history-trace";
import { db } from "@/lib/database";
import { AppError } from "@/utils/app-error";
import { historyTracesService } from "../history-traces/history-traces-service";
import type { ClientListQueryDTO, ClientMutateDTO } from "./clients-types";

export function clientsService() {
  return {
    async create(body: ClientMutateDTO, loggedUserId: string) {
      const existingClient = await db.client.findFirst({
        where: { cnpj: body.cnpj, isDeleted: false },
      });

      if (existingClient) {
        return new AppError("Já existe um cliente com este CNPJ", 400);
      }

      const { commercialCondition, ...clientData } = body;

      const client = await db.client.create({
        data: {
          name: clientData.name,
          cnpj: clientData.cnpj,
          cep: clientData.cep,
          street: clientData.street,
          number: clientData.number,
          complement: clientData.complement,
          city: clientData.city,
          neighborhood: clientData.neighborhood,
          uf: clientData.uf,
          observations: clientData.observations ?? "",
          regionId: clientData.regionId || null,
          groupId: clientData.groupId || null,
          contactName: clientData.contactName,
          contactPhone: clientData.contactPhone ?? "",
          provideMeal: clientData.provideMeal ?? false,
          branchId: clientData.branchId,
          ...(commercialCondition && {
            commercialCondition: {
              create: commercialCondition,
            },
          }),
        },
        include: { branch: true, commercialCondition: true },
      });

      historyTracesService()
        .create({
          userId: loggedUserId,
          action: historyTraceActionConst.CREATED,
          entityType: historyTraceEntityConst.CLIENT,
          entityId: client.id,
          newObject: client,
        })
        .catch(() => {});

      return client;
    },

    async getById(id: string) {
      return db.client.findFirst({
        where: { id, isDeleted: false },
        include: { branch: true, commercialCondition: true },
      });
    },

    async listAll(query: ClientListQueryDTO) {
      const { page, pageSize, search, branchId, regionId, groupId } = query;
      const skip = (page - 1) * pageSize;

      const where = {
        isDeleted: false,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { cnpj: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(branchId && { branchId }),
        ...(regionId && { regionId }),
        ...(groupId && { groupId }),
      };

      const [total, data] = await Promise.all([
        db.client.count({ where }),
        db.client.findMany({
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

    async listAllSmall(query: ClientListQueryDTO) {
      const { search, branchId, regionId, groupId } = query;

      const where = {
        isDeleted: false,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { cnpj: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(branchId && { branchId }),
        ...(regionId && { regionId }),
        ...(groupId && { groupId }),
      };

      return db.client.findMany({
        where,
        orderBy: { name: "asc" },
        select: { id: true, name: true, cnpj: true },
      });
    },

    async update(id: string, body: ClientMutateDTO, loggedUserId: string) {
      const existingClient = await db.client.findUnique({
        where: { id },
        include: { branch: true, commercialCondition: true },
      });

      if (!existingClient) {
        return new AppError("Cliente não encontrado", 404);
      }

      if (existingClient.isDeleted) {
        return new AppError("Cliente já foi excluído", 400);
      }

      const duplicateCnpj = await db.client.findFirst({
        where: { cnpj: body.cnpj, isDeleted: false, id: { not: id } },
      });

      if (duplicateCnpj) {
        return new AppError("Já existe um cliente com este CNPJ", 400);
      }

      const { commercialCondition, ...clientData } = body;

      const updatedClient = await db.client.update({
        where: { id },
        data: {
          name: clientData.name,
          cnpj: clientData.cnpj,
          cep: clientData.cep,
          street: clientData.street,
          number: clientData.number,
          complement: clientData.complement,
          city: clientData.city,
          neighborhood: clientData.neighborhood,
          uf: clientData.uf,
          observations: clientData.observations ?? "",
          regionId: clientData.regionId || null,
          groupId: clientData.groupId || null,
          contactName: clientData.contactName,
          contactPhone: clientData.contactPhone ?? "",
          provideMeal: clientData.provideMeal ?? false,
          branchId: clientData.branchId,
          ...(commercialCondition && {
            commercialCondition: {
              upsert: {
                create: commercialCondition,
                update: commercialCondition,
              },
            },
          }),
        },
        include: { branch: true, commercialCondition: true },
      });

      historyTracesService()
        .create({
          userId: loggedUserId,
          action: historyTraceActionConst.UPDATED,
          entityType: historyTraceEntityConst.CLIENT,
          entityId: id,
          newObject: updatedClient,
          oldObject: existingClient,
        })
        .catch(() => {});

      return updatedClient;
    },

    async delete(id: string, loggedUserId: string) {
      const existingClient = await db.client.findUnique({
        where: { id },
        include: { branch: true, commercialCondition: true },
      });

      if (!existingClient) {
        return new AppError("Cliente não encontrado", 404);
      }

      if (existingClient.isDeleted) {
        return new AppError("Cliente já foi excluído", 400);
      }

      const deletedClient = await db.client.update({
        where: { id },
        data: { isDeleted: true },
        include: { branch: true, commercialCondition: true },
      });

      historyTracesService()
        .create({
          userId: loggedUserId,
          action: historyTraceActionConst.DELETED,
          entityType: historyTraceEntityConst.CLIENT,
          entityId: id,
          newObject: deletedClient,
          oldObject: existingClient,
        })
        .catch(() => {});

      return { success: true };
    },
  };
}
