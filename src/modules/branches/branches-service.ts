import { errAsync, okAsync } from "neverthrow";
import { db } from "@/lib/database";
import type { BranchListQueryDTO } from "./branches-types";

export function branchesService() {
  return {
    async getById(id: string) {
      try {
        const branch = await db.branch.findUnique({ where: { id } });

        if (!branch) {
          return errAsync({ reason: "Filial não encontrada", statusCode: 404 });
        }

        return okAsync(branch);
      } catch (error) {
        console.error("Error getting branch by id:", error);
        return errAsync({
          reason: "Não foi possível buscar filial",
          statusCode: 500,
        });
      }
    },

    async listAll(query: BranchListQueryDTO) {
      try {
        const { page, pageSize, search } = query;
        const skip = (page - 1) * pageSize;

        const where = search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { code: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {};

        const [total, data] = await Promise.all([
          db.branch.count({ where }),
          db.branch.findMany({
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
        console.error("Error listing branches:", error);
        return errAsync({
          reason: "Não foi possível listar filiais",
          statusCode: 500,
        });
      }
    },
  };
}
