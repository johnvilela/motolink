import { PAGE_SIZE } from "@/lib/constants/app";
import { db } from "@/lib/services/database";
import { AppError } from "@/lib/utils/app-error";
import type { Prisma } from "../../../../generated/prisma/client";
import {
  type ListClientsDTO,
  ListClientsSchema,
  type MutateClientDTO,
  MutateClientSchema,
} from "./clients-types";

export function clientsService() {
  return {
    async create(data: Omit<MutateClientDTO, "id">) {
      const { data: validatedData, error } = MutateClientSchema.omit({
        id: true,
      }).safeParse(data);

      if (error) {
        throw new AppError("Campos inválidos", 400);
      }

      const { commercialCondition, ...clientData } = validatedData;

      const client = await db.client.create({
        data: {
          ...clientData,
          regionId: clientData.regionId || null,
          groupId: clientData.groupId || null,
        },
      });

      if (commercialCondition) {
        await db.commercialCondition.create({
          data: {
            ...commercialCondition,
            clientId: client.id,
          },
        });
      }

      return client;
    },

    async edit(id: string, data: Partial<Omit<MutateClientDTO, "id">>) {
      const existingClient = await db.client.findUnique({
        where: { id },
      });

      if (!existingClient || existingClient.isDeleted) {
        throw new AppError("Cliente não encontrado.", 404);
      }

      const { data: validatedData, error } =
        MutateClientSchema.partial().safeParse(data);

      if (error) {
        throw new AppError("Campos inválidos", 400);
      }

      const { commercialCondition, ...clientData } = validatedData;

      const updatedClient = await db.client.update({
        where: { id },
        data: {
          ...clientData,
          ...(clientData.regionId !== undefined
            ? { regionId: clientData.regionId || null }
            : {}),
          ...(clientData.groupId !== undefined
            ? { groupId: clientData.groupId || null }
            : {}),
        },
      });

      if (commercialCondition) {
        const existingCondition = await db.commercialCondition.findUnique({
          where: { clientId: id },
        });

        if (existingCondition) {
          await db.commercialCondition.update({
            where: { clientId: id },
            data: commercialCondition,
          });
        } else {
          await db.commercialCondition.create({
            data: {
              ...commercialCondition,
              clientId: id,
            },
          });
        }
      }

      return updatedClient;
    },

    async delete(id: string) {
      const existingClient = await db.client.findUnique({
        where: { id },
      });

      if (!existingClient || existingClient.isDeleted) {
        throw new AppError("Cliente não encontrado.", 404);
      }

      const deletedClient = await db.client.update({
        where: { id },
        data: { isDeleted: true },
      });

      return deletedClient;
    },

    async getById(id: string) {
      const client = await db.client.findUnique({
        where: { id },
        include: {
          region: {
            select: {
              id: true,
              name: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!client || client.isDeleted) {
        throw new AppError("Cliente não encontrado.", 404);
      }

      return client;
    },

    async list(input: ListClientsDTO = {}) {
      const { data: validatedInput, error } =
        ListClientsSchema.safeParse(input);

      if (error) {
        throw new AppError("Parâmetros inválidos", 400);
      }

      const {
        page = 1,
        limit = PAGE_SIZE,
        name,
        branch,
        cnpj,
      } = validatedInput;

      const where: Prisma.ClientWhereInput = {
        isDeleted: false,
        ...(name
          ? {
              name: {
                contains: name,
                mode: "insensitive",
              },
            }
          : {}),
        ...(cnpj
          ? {
              cnpj: {
                contains: cnpj,
                mode: "insensitive",
              },
            }
          : {}),
        ...(branch ? { branch } : {}),
      };

      const [clients, count] = await db.$transaction([
        db.client.findMany({
          take: limit,
          skip: (page - 1) * limit,
          where,
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            cnpj: true,
            city: true,
            uf: true,
            contactName: true,
            createdAt: true,
          },
        }),
        db.client.count({ where }),
      ]);

      return {
        data: clients,
        count,
      };
    },
  };
}

export type ClientsService = ReturnType<typeof clientsService>;
export type ListClientsServiceResponse = Awaited<
  ReturnType<ClientsService["list"]>
>;
