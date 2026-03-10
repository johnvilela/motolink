import dayjs from "dayjs";
import { errAsync, okAsync } from "neverthrow";
import { historyTraceActionConst, historyTraceEntityConst } from "@/constants/history-trace";
import { db } from "@/lib/database";
import { historyTracesService } from "../history-traces/history-traces-service";
import type { PlanningListQueryDTO, PlanningUpsertDTO } from "./planning-types";

export function planningService() {
  return {
    async upsert(body: PlanningUpsertDTO, loggedUserId: string) {
      try {
        const today = dayjs().startOf("day");

        if (dayjs(body.plannedDate).isBefore(today)) {
          return errAsync({
            reason: "Não é possível criar ou editar planejamentos para datas anteriores ao dia atual",
            statusCode: 422,
          });
        }

        const { clientId, branchId, plannedDate, plannedCount, period } = body;

        const planning = await db.planning.upsert({
          where: { clientId_plannedDate_period: { clientId, plannedDate, period } },
          create: { clientId, branchId, plannedDate, plannedCount, period },
          update: { clientId, branchId, plannedDate, plannedCount, period },
        });

        historyTracesService()
          .create({
            userId: loggedUserId,
            action: historyTraceActionConst.CREATED,
            entityType: historyTraceEntityConst.PLANNING,
            entityId: planning.id,
            newObject: planning,
          })
          .catch(() => {});

        return okAsync(planning);
      } catch (error) {
        console.error("Error upserting planning:", error);
        return errAsync({ reason: "Não foi possível salvar o planejamento", statusCode: 500 });
      }
    },

    async listAll(query: PlanningListQueryDTO) {
      try {
        const { page, pageSize, branchId, groupId, regionId, clientId, startAt, endAt } = query;
        const skip = (page - 1) * pageSize;

        const where = {
          ...(branchId && { branchId }),
          ...(clientId && { clientId }),
          ...((groupId || regionId) && {
            client: {
              ...(groupId && { groupId }),
              ...(regionId && { regionId }),
            },
          }),
          ...((startAt || endAt) && {
            plannedDate: {
              ...(startAt && { gte: startAt }),
              ...(endAt && { lte: endAt }),
            },
          }),
        };

        const [total, data] = await Promise.all([
          db.planning.count({ where }),
          db.planning.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: { plannedDate: "desc" },
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
        console.error("Error listing plannings:", error);
        return errAsync({ reason: "Não foi possível listar os planejamentos", statusCode: 500 });
      }
    },

    async getById(id: string) {
      try {
        const planning = await db.planning.findUnique({ where: { id } });

        if (!planning) {
          return errAsync({ reason: "Planejamento não encontrado", statusCode: 404 });
        }

        return okAsync(planning);
      } catch (error) {
        console.error("Error fetching planning:", error);
        return errAsync({ reason: "Não foi possível buscar o planejamento", statusCode: 500 });
      }
    },
  };
}
