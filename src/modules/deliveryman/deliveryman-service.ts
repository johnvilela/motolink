import {
  historyTraceActionConst,
  historyTraceEntityConst,
} from "@/constants/history-trace";
import { db } from "@/lib/database";
import { AppError } from "@/utils/app-error";
import { historyTracesService } from "../history-traces/history-traces-service";
import type {
  DeliverymanListQueryDTO,
  DeliverymanMutateDTO,
} from "./deliveryman-types";

export function deliverymanService() {
  return {
    async create(body: DeliverymanMutateDTO, loggedUserId: string) {
      const deliveryman = await db.deliveryman.create({
        data: {
          name: body.name,
          document: body.document,
          phone: body.phone,
          contractType: body.contractType,
          mainPixKey: body.mainPixKey,
          secondPixKey: body.secondPixKey,
          thridPixKey: body.thridPixKey,
          agency: body.agency,
          account: body.account,
          vehicleModel: body.vehicleModel,
          vehiclePlate: body.vehiclePlate,
          vehicleColor: body.vehicleColor,
          files: body.files ?? [],
          branchId: body.branchId,
          regionId: body.regionId,
        },
        include: { branch: true, region: true },
      });

      historyTracesService()
        .create({
          userId: loggedUserId,
          action: historyTraceActionConst.CREATED,
          entityType: historyTraceEntityConst.DELIVERYMAN,
          entityId: deliveryman.id,
          newObject: deliveryman,
        })
        .catch(() => {});

      return deliveryman;
    },

    async getById(id: string) {
      return db.deliveryman.findUnique({
        where: { id, isDeleted: false },
        include: { branch: true, region: true },
      });
    },

    async listAll(query: DeliverymanListQueryDTO) {
      const { page, pageSize, search, branchId } = query;
      const skip = (page - 1) * pageSize;

      const where = {
        isDeleted: false,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { document: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(branchId && { branchId }),
      };

      const [total, data] = await Promise.all([
        db.deliveryman.count({ where }),
        db.deliveryman.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          include: { branch: true, region: true },
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

    async update(id: string, body: DeliverymanMutateDTO, loggedUserId: string) {
      const existingDeliveryman = await db.deliveryman.findUnique({
        where: { id },
        include: { branch: true, region: true },
      });

      if (!existingDeliveryman) {
        return new AppError("Entregador nao encontrado", 404);
      }

      if (existingDeliveryman.isDeleted) {
        return new AppError("Entregador ja foi excluido", 400);
      }

      const updatedDeliveryman = await db.deliveryman.update({
        where: { id },
        data: {
          name: body.name,
          document: body.document,
          phone: body.phone,
          contractType: body.contractType,
          mainPixKey: body.mainPixKey,
          secondPixKey: body.secondPixKey,
          thridPixKey: body.thridPixKey,
          agency: body.agency,
          account: body.account,
          vehicleModel: body.vehicleModel,
          vehiclePlate: body.vehiclePlate,
          vehicleColor: body.vehicleColor,
          files: body.files ?? [],
          branchId: body.branchId,
          regionId: body.regionId,
        },
        include: { branch: true, region: true },
      });

      historyTracesService()
        .create({
          userId: loggedUserId,
          action: historyTraceActionConst.UPDATED,
          entityType: historyTraceEntityConst.DELIVERYMAN,
          entityId: id,
          newObject: updatedDeliveryman,
          oldObject: existingDeliveryman,
        })
        .catch(() => {});

      return updatedDeliveryman;
    },

    async delete(id: string, loggedUserId: string) {
      const existingDeliveryman = await db.deliveryman.findUnique({
        where: { id },
        include: { branch: true, region: true },
      });

      if (!existingDeliveryman) {
        return new AppError("Entregador nao encontrado", 404);
      }

      if (existingDeliveryman.isDeleted) {
        return new AppError("Entregador ja foi excluido", 400);
      }

      const deletedDeliveryman = await db.deliveryman.update({
        where: { id },
        data: { isDeleted: true },
        include: { branch: true, region: true },
      });

      historyTracesService()
        .create({
          userId: loggedUserId,
          action: historyTraceActionConst.DELETED,
          entityType: historyTraceEntityConst.DELIVERYMAN,
          entityId: id,
          newObject: deletedDeliveryman,
          oldObject: existingDeliveryman,
        })
        .catch(() => {});

      return { success: true };
    },

    async toggleBlock(id: string, loggedUserId: string) {
      const existingDeliveryman = await db.deliveryman.findUnique({
        where: { id },
        include: { branch: true, region: true },
      });

      if (!existingDeliveryman) {
        return new AppError("Entregador nao encontrado", 404);
      }

      if (existingDeliveryman.isDeleted) {
        return new AppError("Entregador ja foi excluido", 400);
      }

      const updatedDeliveryman = await db.deliveryman.update({
        where: { id },
        data: { isBlocked: !existingDeliveryman.isBlocked },
        include: { branch: true, region: true },
      });

      historyTracesService()
        .create({
          userId: loggedUserId,
          action: historyTraceActionConst.UPDATED,
          entityType: historyTraceEntityConst.DELIVERYMAN,
          entityId: id,
          newObject: updatedDeliveryman,
          oldObject: existingDeliveryman,
        })
        .catch(() => {});

      return updatedDeliveryman;
    },
  };
}
