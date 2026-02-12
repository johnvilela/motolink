import type { Prisma } from "@/../generated/prisma/client";
import { db } from "@/lib/database";
import { AppError } from "@/utils/app-error";
import type {
  CreateTraceDTO,
  HistoryTraceListQueryDTO,
} from "./history-traces-types";

function computeChanges(
  newObject: Record<string, unknown>,
  oldObject?: Record<string, unknown>,
): Prisma.InputJsonValue {
  const changes: Record<string, { old: unknown; new: unknown }> = {};
  const allKeys = new Set([
    ...Object.keys(newObject),
    ...(oldObject ? Object.keys(oldObject) : []),
  ]);

  for (const key of allKeys) {
    const oldVal = oldObject?.[key] ?? null;
    const newVal = newObject[key] ?? null;

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes[key] = { old: oldVal, new: newVal };
    }
  }

  return changes as Prisma.InputJsonValue;
}

export function historyTracesService() {
  return {
    async create(body: CreateTraceDTO) {
      const user = await db.user.findUnique({
        where: { id: body.userId },
        select: { id: true, name: true, email: true, role: true },
      });

      if (!user) {
        return new AppError("Usuário não encontrado", 404);
      }

      const changes = computeChanges(body.newObject, body.oldObject);

      const trace = await db.historyTrace.create({
        data: {
          userId: body.userId,
          user,
          action: body.action,
          entityType: body.entityType,
          entityId: body.entityId,
          changes,
        },
      });

      return trace;
    },

    async listAll(query: HistoryTraceListQueryDTO) {
      const { page, pageSize, entityType, userId, entityId, action } = query;
      const skip = (page - 1) * pageSize;

      const where = {
        ...(entityType && { entityType }),
        ...(userId && { userId }),
        ...(entityId && { entityId }),
        ...(action && { action }),
      };

      const [total, data] = await Promise.all([
        db.historyTrace.count({ where }),
        db.historyTrace.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
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

    async getById(id: string) {
      const trace = await db.historyTrace.findUnique({
        where: { id },
      });

      if (!trace) {
        return new AppError("Registro não encontrado", 404);
      }

      return trace;
    },
  };
}
