import { PAGE_SIZE } from "@/lib/constants/app";
import { db } from "@/lib/services/database";
import { AppError } from "@/lib/utils/app-error";
import type { Prisma } from "../../../../generated/prisma/client";
import {
  type HistoryTraceAction,
  historyTraceActions,
} from "./history-trace-constants";

type HistoryTraceCreateInput = {
  new: Record<string, unknown> | null;
  old: Record<string, unknown> | null;
  user: string;
  action: HistoryTraceAction;
};

type HistoryTraceListInput = {
  page?: number;
  limit?: number;
  userId?: string;
  action?: HistoryTraceAction;
  entityType?: string;
  entityId?: string;
};

const ignoredFields = new Set(["id", "createdAt", "updatedAt", "entityType"]);

const stripIgnoredFields = (payload: Record<string, unknown> | null) => {
  if (!payload) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => !ignoredFields.has(key)),
  );
};

const areValuesEqual = (next: unknown, prev: unknown) => {
  if (Object.is(next, prev)) {
    return true;
  }

  if (
    typeof next !== "object" ||
    typeof prev !== "object" ||
    next === null ||
    prev === null
  ) {
    return false;
  }

  try {
    return JSON.stringify(next) === JSON.stringify(prev);
  } catch {
    return false;
  }
};

const buildDiff = (
  next: Record<string, unknown>,
  prev: Record<string, unknown>,
) => {
  const diff: Record<string, { new: unknown; old: unknown }> = {};
  const keys = new Set([...Object.keys(next), ...Object.keys(prev)]);

  for (const key of keys) {
    if (areValuesEqual(next[key], prev[key])) {
      continue;
    }

    diff[key] = {
      new: next[key] ?? null,
      old: prev[key] ?? null,
    };
  }

  return diff;
};

const extractEntityId = (
  nextPayload: Record<string, unknown> | null,
  prevPayload: Record<string, unknown> | null,
) => {
  const id = nextPayload?.id ?? prevPayload?.id;

  if (!id || typeof id !== "string") {
    throw new AppError("Entidade inválida.", 400);
  }

  return id;
};

const extractEntityType = (
  nextPayload: Record<string, unknown> | null,
  prevPayload: Record<string, unknown> | null,
) => {
  const entityType =
    nextPayload?.entityType ??
    prevPayload?.entityType ??
    nextPayload?.__typename ??
    prevPayload?.__typename;

  if (!entityType || typeof entityType !== "string") {
    throw new AppError("Tipo da entidade é obrigatório.", 400);
  }

  return entityType;
};

export function historyTraceService() {
  return {
    async create({
      new: next,
      old: prev,
      user,
      action,
    }: HistoryTraceCreateInput) {
      if (!user) {
        throw new AppError("Usuário é obrigatório.", 400);
      }

      const entityId = extractEntityId(next, prev);
      const entityType = extractEntityType(next, prev);
      const nextPayload = stripIgnoredFields(next);
      const prevPayload = stripIgnoredFields(prev);

      const changesRaw =
        action === historyTraceActions.CREATE || !prev
          ? nextPayload
          : buildDiff(nextPayload, prevPayload);

      const changes = changesRaw as Prisma.InputJsonValue;

      const historyTrace = await db.historyTrace.create({
        data: {
          userId: user,
          action,
          entityType,
          entityId,
          changes,
        },
      });

      return historyTrace;
    },

    async getById(id: string) {
      const historyTrace = await db.historyTrace.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!historyTrace) {
        throw new AppError("Histórico não encontrado.", 404);
      }

      return historyTrace;
    },

    async list(input: HistoryTraceListInput = {}) {
      const {
        page = 1,
        limit = PAGE_SIZE,
        userId,
        action,
        entityType,
        entityId,
      } = input;

      const where: Prisma.HistoryTraceWhereInput = {
        ...(userId ? { userId } : {}),
        ...(action ? { action } : {}),
        ...(entityType ? { entityType } : {}),
        ...(entityId ? { entityId } : {}),
      };

      const [historyTraces, count] = await db.$transaction([
        db.historyTrace.findMany({
          take: limit,
          skip: (page - 1) * limit,
          where,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        db.historyTrace.count({ where }),
      ]);

      return {
        data: historyTraces,
        count,
      };
    },
  };
}

export type HistoryTraceService = ReturnType<typeof historyTraceService>;
export type ListHistoryTraceServiceResponse = Awaited<
  ReturnType<HistoryTraceService["list"]>
>;
