import dayjs from "dayjs";
import { errAsync, okAsync } from "neverthrow";
import { db } from "@/lib/database";
import { convertDecimals } from "@/utils/convert-decimals";
import type { MonitoringQueryDTO } from "./monitoring-types";

const monitoringClientInclude = {
  branch: { select: { id: true, name: true } },
  group: { select: { id: true, name: true } },
  region: { select: { id: true, name: true } },
  commercialCondition: true,
} as const;

const monitoringWorkShiftInclude = {
  deliveryman: { select: { id: true, name: true } },
} as const;

export function monitoringService() {
  return {
    async getDaily(query: MonitoringQueryDTO) {
      try {
        const { branchId, clientId, groupId, targetDate } = query;
        const targetDateTime = dayjs(targetDate).toISOString();

        const clients = await db.client.findMany({
          where: {
            isDeleted: false,
            ...(branchId && { branchId }),
            ...(clientId && { id: clientId }),
            ...(groupId && { groupId }),
          },
          orderBy: { createdAt: "desc" },
          include: monitoringClientInclude,
        });

        if (clients.length === 0) {
          return okAsync({ clients: [] });
        }

        const clientIds = clients.map((client) => client.id);

        const [planned, workShifts] = await Promise.all([
          db.planning.findMany({
            where: {
              ...(branchId && { branchId }),
              clientId: { in: clientIds },
              plannedDate: targetDateTime,
            },
            orderBy: [{ clientId: "asc" }, { period: "asc" }],
          }),
          db.workShiftSlot.findMany({
            where: {
              clientId: { in: clientIds },
              shiftDate: targetDateTime,
            },
            orderBy: [{ clientId: "asc" }, { createdAt: "desc" }],
            include: monitoringWorkShiftInclude,
          }),
        ]);

        const plannedByClientId = new Map<string, typeof planned>();
        for (const planning of planned) {
          const clientPlannings = plannedByClientId.get(planning.clientId) ?? [];
          clientPlannings.push(planning);
          plannedByClientId.set(planning.clientId, clientPlannings);
        }

        const workShiftsByClientId = new Map<string, typeof workShifts>();
        for (const workShift of workShifts) {
          const clientWorkShifts = workShiftsByClientId.get(workShift.clientId) ?? [];
          clientWorkShifts.push(workShift);
          workShiftsByClientId.set(workShift.clientId, clientWorkShifts);
        }

        return okAsync({
          clients: clients.map((client) =>
            convertDecimals({
              ...client,
              planned: plannedByClientId.get(client.id) ?? [],
              workShifts: workShiftsByClientId.get(client.id) ?? [],
            }),
          ),
        });
      } catch (error) {
        console.error("Error fetching daily monitoring:", error);
        return errAsync({ reason: "Não foi possível buscar os dados de monitoramento", statusCode: 500 });
      }
    },
  };
}
