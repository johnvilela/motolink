import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { AlertCircleIcon } from "lucide-react";
import { cookies } from "next/headers";

import { ContentHeader } from "@/components/composite/content-header";
import { PlanningWeekView } from "@/components/composite/planning-week-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cookieConst } from "@/constants/cookies";
import { normalizePlanningPeriod, type PlanningPeriod } from "@/constants/planning-period";
import { clientsService } from "@/modules/clients/clients-service";
import { groupsService } from "@/modules/groups/groups-service";
import { planningService } from "@/modules/planning/planning-service";

dayjs.extend(isoWeek);

interface PlanejamentoPageProps {
  searchParams: Promise<{
    group?: string;
    client?: string;
    week?: string;
  }>;
}

export default async function PlanejamentoPage({ searchParams }: PlanejamentoPageProps) {
  const cookieStore = await cookies();
  const branchId = cookieStore.get(cookieConst.SELECTED_BRANCH)?.value;

  if (!branchId) {
    return (
      <main className="mx-auto max-w-7xl space-y-6 py-6">
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>Filial não selecionada</AlertDescription>
        </Alert>
      </main>
    );
  }

  const params = await searchParams;
  const weekStart = params.week ? dayjs(params.week).startOf("isoWeek") : dayjs().startOf("isoWeek");
  const weekEnd = weekStart.add(6, "day").endOf("day");

  const selectedGroupId = params.group || undefined;
  const selectedClientId = params.client || undefined;

  const [planningResult, clientsDataResult, selectedGroupResult] = await Promise.all([
    planningService().listByWeek({
      branchId,
      startAt: weekStart.toDate(),
      endAt: weekEnd.toDate(),
      ...(selectedGroupId && { groupId: selectedGroupId }),
      ...(selectedClientId && { clientId: selectedClientId }),
    }),
    selectedGroupId
      ? clientsService().listAll({ page: 1, pageSize: 200, branchId, groupId: selectedGroupId })
      : selectedClientId
        ? clientsService().getById(selectedClientId)
        : Promise.resolve(null),
    selectedGroupId ? groupsService().getById(selectedGroupId) : Promise.resolve(null),
  ]);

  if (planningResult.isErr()) {
    return (
      <main className="mx-auto max-w-7xl space-y-6 py-6">
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{planningResult.error.reason}</AlertDescription>
        </Alert>
      </main>
    );
  }

  const clientsData: Array<{
    id: string;
    name: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    uf: string;
    observations: string;
    provideMeal: boolean;
  }> = [];

  let selectedGroupName: string | undefined;
  let selectedClientName: string | undefined;

  if (clientsDataResult && "isErr" in clientsDataResult && clientsDataResult.isOk()) {
    const value = clientsDataResult.value;
    if ("data" in value && Array.isArray(value.data)) {
      clientsData.push(...value.data);
    } else if ("id" in value) {
      clientsData.push(value as (typeof clientsData)[number]);
      selectedClientName = (value as { name: string }).name;
    }
  }

  if (selectedGroupResult && "isErr" in selectedGroupResult && selectedGroupResult.isOk()) {
    selectedGroupName = selectedGroupResult.value.name;
  }

  const planningMap: Record<string, Record<string, Partial<Record<PlanningPeriod, number>>>> = {};
  for (const record of planningResult.value) {
    const normalizedPeriod = normalizePlanningPeriod(record.period);

    if (!normalizedPeriod) {
      continue;
    }

    const dateKey = dayjs(record.plannedDate).format("YYYY-MM-DD");
    if (!planningMap[record.clientId]) {
      planningMap[record.clientId] = {};
    }
    if (!planningMap[record.clientId][dateKey]) {
      planningMap[record.clientId][dateKey] = {};
    }
    planningMap[record.clientId][dateKey][normalizedPeriod] = record.plannedCount;
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 py-6">
      <ContentHeader
        breadcrumbItems={[{ title: "Operacional", href: "/operacional/planejamento" }, { title: "Planejamento" }]}
      />
      <PlanningWeekView
        clientsData={clientsData}
        planningMap={planningMap}
        weekStart={weekStart.format("YYYY-MM-DD")}
        selectedGroupId={selectedGroupId}
        selectedGroupName={selectedGroupName}
        selectedClientId={selectedClientId}
        selectedClientName={selectedClientName}
      />
    </main>
  );
}
