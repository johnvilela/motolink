import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { AlertCircleIcon } from "lucide-react";
import { cookies } from "next/headers";

import { AccessDenied } from "@/components/composite/access-denied";
import { ContentHeader } from "@/components/composite/content-header";
import { PlanningWeekView } from "@/components/composite/planning-week-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cookieConst } from "@/constants/cookies";
import { normalizePlanningPeriod, type PlanningPeriod } from "@/constants/planning-period";
import { clientsService } from "@/modules/clients/clients-service";
import { groupsService } from "@/modules/groups/groups-service";
import { planningService } from "@/modules/planning/planning-service";
import { checkPagePermission } from "@/utils/check-page-permission";
import { getCurrentDateKeyInSaoPaulo } from "@/utils/date-time";

dayjs.extend(isoWeek);

interface PlanejamentoPageProps {
  searchParams: Promise<{
    group?: string;
    client?: string;
    week?: string;
  }>;
}

export default async function PlanejamentoPage({ searchParams }: PlanejamentoPageProps) {
  if (!(await checkPagePermission("operational.view"))) return <AccessDenied />;

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
  const today = getCurrentDateKeyInSaoPaulo();
  const requestedWeek = params.week ? dayjs(params.week) : dayjs(today);
  const weekReference = requestedWeek.isValid() ? requestedWeek : dayjs(today);
  const weekStart = weekReference.startOf("isoWeek");
  const weekStartDate = weekStart.format("YYYY-MM-DD");
  const weekEndDate = weekStart.add(6, "day").format("YYYY-MM-DD");

  const selectedGroupId = params.group || undefined;
  const selectedClientId = params.client || undefined;

  const [planningResult, clientsDataResult, selectedGroupResult] = await Promise.all([
    planningService().listAll({
      branchId,
      startAt: weekStartDate,
      endAt: weekEndDate,
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

  for (const record of planningResult.value.data) {
    const normalizedPeriod = normalizePlanningPeriod(record.period);

    if (!normalizedPeriod) {
      continue;
    }

    if (!planningMap[record.clientId]) {
      planningMap[record.clientId] = {};
    }

    if (!planningMap[record.clientId][record.plannedDate]) {
      planningMap[record.clientId][record.plannedDate] = {};
    }

    planningMap[record.clientId][record.plannedDate][normalizedPeriod] = record.plannedCount;
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 py-6">
      <ContentHeader
        breadcrumbItems={[{ title: "Operacional", href: "/operacional/planejamento" }, { title: "Planejamento" }]}
      />
      <PlanningWeekView
        clientsData={clientsData}
        planningMap={planningMap}
        weekStart={weekStartDate}
        selectedGroupId={selectedGroupId}
        selectedGroupName={selectedGroupName}
        selectedClientId={selectedClientId}
        selectedClientName={selectedClientName}
      />
    </main>
  );
}
