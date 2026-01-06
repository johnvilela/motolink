import { PAGE_SIZE } from "@/lib/constants/app";
import { db } from "@/lib/services/database";
import { AppError } from "@/lib/utils/app-error";
import type { Prisma } from "../../../../generated/prisma/client";
import {
  type ListDeliverymenDTO,
  ListDeliverymenSchema,
  type MutateDeliverymanDTO,
  MutateDeliverymanSchema,
} from "./deliverymen-types";

export function deliverymenService() {
  return {
    async create(data: Omit<MutateDeliverymanDTO, "id">) {
      const { data: validatedData, error } = MutateDeliverymanSchema.omit({
        id: true,
      }).safeParse(data);

      if (error) {
        throw new AppError("Campos inválidos", 400);
      }

      const deliveryman = await db.deliveryman.create({
        data: {
          ...validatedData,
          regionId: validatedData.regionId || null,
        },
      });

      return deliveryman;
    },

    async edit(id: string, data: Partial<Omit<MutateDeliverymanDTO, "id">>) {
      const existingDeliveryman = await db.deliveryman.findUnique({
        where: { id },
      });

      if (!existingDeliveryman || existingDeliveryman.isDeleted) {
        throw new AppError("Motoboy não encontrado.", 404);
      }

      const { data: validatedData, error } =
        MutateDeliverymanSchema.partial().safeParse(data);

      if (error) {
        throw new AppError("Campos inválidos", 400);
      }

      const updatedDeliveryman = await db.deliveryman.update({
        where: { id },
        data: {
          ...validatedData,
          ...(validatedData.regionId !== undefined
            ? { regionId: validatedData.regionId || null }
            : {}),
        },
      });

      return updatedDeliveryman;
    },

    async delete(id: string) {
      const existingDeliveryman = await db.deliveryman.findUnique({
        where: { id },
      });

      if (!existingDeliveryman || existingDeliveryman.isDeleted) {
        throw new AppError("Motoboy não encontrado.", 404);
      }

      const deletedDeliveryman = await db.deliveryman.update({
        where: { id },
        data: { isDeleted: true },
      });

      return deletedDeliveryman;
    },

    async toggleBlock(id: string) {
      const existingDeliveryman = await db.deliveryman.findUnique({
        where: { id },
      });

      if (!existingDeliveryman || existingDeliveryman.isDeleted) {
        throw new AppError("Motoboy não encontrado.", 404);
      }

      const updatedDeliveryman = await db.deliveryman.update({
        where: { id },
        data: { isBlocked: !existingDeliveryman.isBlocked },
      });

      return updatedDeliveryman;
    },

    async getById(id: string) {
      const deliveryman = await db.deliveryman.findUnique({
        where: { id },
        include: {
          region: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!deliveryman || deliveryman.isDeleted) {
        throw new AppError("Motoboy não encontrado.", 404);
      }

      return deliveryman;
    },

    async list(input: ListDeliverymenDTO = {}) {
      const { data: validatedInput, error } =
        ListDeliverymenSchema.safeParse(input);

      if (error) {
        throw new AppError("Parâmetros inválidos", 400);
      }

      const {
        page = 1,
        limit = PAGE_SIZE,
        name,
        document,
        phone,
        branch,
        regionId,
        contractType,
      } = validatedInput;

      const where: Prisma.DeliverymanWhereInput = {
        isDeleted: false,
        ...(name
          ? {
              name: {
                contains: name,
                mode: "insensitive",
              },
            }
          : {}),
        ...(document
          ? {
              document: {
                contains: document,
                mode: "insensitive",
              },
            }
          : {}),
        ...(phone
          ? {
              phone: {
                contains: phone,
                mode: "insensitive",
              },
            }
          : {}),
        ...(branch ? { branch } : {}),
        ...(regionId ? { regionId } : {}),
        ...(contractType ? { contractType } : {}),
      };

      const [deliverymen, count] = await db.$transaction([
        db.deliveryman.findMany({
          take: limit,
          skip: (page - 1) * limit,
          where,
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            document: true,
            phone: true,
            contractType: true,
            isBlocked: true,
            createdAt: true,
          },
        }),
        db.deliveryman.count({ where }),
      ]);

      return {
        data: deliverymen,
        count,
      };
    },
  };
}

export type DeliverymenService = ReturnType<typeof deliverymenService>;
export type ListDeliverymenServiceResponse = Awaited<
  ReturnType<DeliverymenService["list"]>
>;
