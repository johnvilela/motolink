import { PAGE_SIZE } from "@/lib/constants/app";
import { db } from "@/lib/services/database";
import { AppError } from "@/lib/utils/app-error";
import type { Prisma } from "../../../../generated/prisma/client";
import {
  type ListGroupsDTO,
  ListGroupsSchema,
  type MutateGroupDTO,
  MutateGroupSchema,
} from "./groups-types";

export function groupsService() {
  return {
    async create(data: Omit<MutateGroupDTO, "id">) {
      const { data: validatedData, error } = MutateGroupSchema.omit({
        id: true,
      }).safeParse(data);

      if (error) {
        throw new AppError("Campos inválidos", 400);
      }

      const group = await db.group.create({
        data: validatedData,
      });

      return group;
    },

    async edit(id: string, data: Partial<Omit<MutateGroupDTO, "id">>) {
      const existingGroup = await db.group.findUnique({
        where: { id },
      });

      if (!existingGroup) {
        throw new AppError("Grupo não encontrado.", 404);
      }

      const { data: validatedData, error } =
        MutateGroupSchema.partial().safeParse(data);

      if (error) {
        throw new AppError("Campos inválidos", 400);
      }

      const updatedGroup = await db.group.update({
        where: { id },
        data: validatedData,
      });

      return updatedGroup;
    },

    async delete(id: string) {
      const existingGroup = await db.group.findUnique({
        where: { id },
      });

      if (!existingGroup) {
        throw new AppError("Grupo não encontrado.", 404);
      }

      const deletedGroup = await db.group.delete({
        where: { id },
      });

      return deletedGroup;
    },

    async getById(id: string) {
      const group = await db.group.findUnique({
        where: { id },
        include: {
          clients: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!group) {
        throw new AppError("Grupo não encontrado.", 404);
      }

      return group;
    },

    async listAll(input: ListGroupsDTO = {}) {
      const { data: validatedInput, error } = ListGroupsSchema.safeParse(input);

      if (error) {
        throw new AppError("Parâmetros inválidos", 400);
      }

      const { page = 1, limit = PAGE_SIZE, name, branch } = validatedInput;

      const where: Prisma.GroupWhereInput = {
        ...(name
          ? {
              name: {
                contains: name,
                mode: "insensitive",
              },
            }
          : {}),
        ...(branch ? { branch } : {}),
      };

      const [groups, count] = await db.$transaction([
        db.group.findMany({
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
        db.group.count({ where }),
      ]);

      return {
        data: groups,
        count,
      };
    },
  };
}

export type GroupsService = ReturnType<typeof groupsService>;
export type ListGroupsServiceResponse = Awaited<
  ReturnType<GroupsService["listAll"]>
>;
