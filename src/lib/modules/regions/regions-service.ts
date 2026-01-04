import { PAGE_SIZE } from "@/lib/constants/app";
import { db } from "@/lib/services/database";
import { AppError } from "@/lib/utils/app-error";
import type { Prisma } from "../../../../generated/prisma/client";
import {
  type ListRegionsDTO,
  ListRegionsSchema,
  type MutateRegionDTO,
  MutateRegionSchema,
} from "./regions-types";

export function regionsService() {
  return {
    async create(data: Omit<MutateRegionDTO, "id">) {
      const { data: validatedData, error } = MutateRegionSchema.omit({
        id: true,
      }).safeParse(data);

      if (error) {
        throw new AppError("Campos inválidos", 400);
      }

      const region = await db.region.create({
        data: validatedData,
      });

      return region;
    },

    async edit(id: string, data: Partial<Omit<MutateRegionDTO, "id">>) {
      const existingRegion = await db.region.findUnique({
        where: { id },
      });

      if (!existingRegion) {
        throw new AppError("Região não encontrada.", 404);
      }

      const { data: validatedData, error } =
        MutateRegionSchema.partial().safeParse(data);

      if (error) {
        throw new AppError("Campos inválidos", 400);
      }

      const updatedRegion = await db.region.update({
        where: { id },
        data: validatedData,
      });

      return updatedRegion;
    },

    async delete(id: string) {
      const existingRegion = await db.region.findUnique({
        where: { id },
      });

      if (!existingRegion) {
        throw new AppError("Região não encontrada.", 404);
      }

      const deletedRegion = await db.region.delete({
        where: { id },
      });

      return deletedRegion;
    },

    async getById(id: string) {
      const region = await db.region.findUnique({
        where: { id },
        include: {
          clients: {
            select: {
              id: true,
              name: true,
            },
          },
          deliverymans: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!region) {
        throw new AppError("Região não encontrada.", 404);
      }

      return region;
    },

    async listAll(input: ListRegionsDTO = {}) {
      const { data: validatedInput, error } =
        ListRegionsSchema.safeParse(input);

      if (error) {
        throw new AppError("Parâmetros inválidos", 400);
      }

      const { page = 1, limit = PAGE_SIZE, name } = validatedInput;

      const where: Prisma.RegionWhereInput = name
        ? {
            name: {
              contains: name,
              mode: "insensitive",
            },
          }
        : {};

      const [regions, count] = await db.$transaction([
        db.region.findMany({
          take: limit,
          skip: (page - 1) * limit,
          where,
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
          },
        }),
        db.region.count({ where }),
      ]);

      return {
        data: regions,
        count,
      };
    },
  };
}

export type RegionsService = ReturnType<typeof regionsService>;
export type ListRegionsServiceResponse = Awaited<
  ReturnType<RegionsService["listAll"]>
>;
