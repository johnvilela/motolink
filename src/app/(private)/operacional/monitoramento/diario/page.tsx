import dayjs from "dayjs";
import { AccessDenied } from "@/components/composite/access-denied";
import { ContentHeader } from "@/components/composite/content-header";
import { MonitoringDailyContent } from "@/components/composite/monitoring-daily-content";
import { clientsService } from "@/modules/clients/clients-service";
import { groupsService } from "@/modules/groups/groups-service";
import { checkPagePermission } from "@/utils/check-page-permission";
import { getCurrentDateKeyInSaoPaulo } from "@/utils/date-time";

interface MonitoramentoDiarioPageProps {
  searchParams: Promise<{
    group?: string;
    client?: string;
    date?: string;
  }>;
}

export default async function MonitoramentoDiarioPage({ searchParams }: MonitoramentoDiarioPageProps) {
  if (!(await checkPagePermission("operational.view"))) return <AccessDenied />;

  const params = await searchParams;
  const selectedGroupId = params.group || undefined;
  const selectedClientId = params.client || undefined;
  const today = getCurrentDateKeyInSaoPaulo();
  const selectedDate = params.date && dayjs(params.date).isValid() ? dayjs(params.date).format("YYYY-MM-DD") : today;

  const [selectedGroupResult, selectedClientResult] = await Promise.all([
    selectedGroupId ? groupsService().getById(selectedGroupId) : Promise.resolve(null),
    selectedClientId ? clientsService().getById(selectedClientId) : Promise.resolve(null),
  ]);

  const selectedGroupName =
    selectedGroupResult && "isOk" in selectedGroupResult && selectedGroupResult.isOk()
      ? selectedGroupResult.value.name
      : undefined;

  const selectedClientName =
    selectedClientResult && "isOk" in selectedClientResult && selectedClientResult.isOk()
      ? selectedClientResult.value.name
      : undefined;

  return (
    <main className="mx-auto max-w-7xl space-y-6 py-6">
      <ContentHeader
        breadcrumbItems={[
          { title: "Operacional", href: "/operacional/planejamento" },
          { title: "Monitoramento Diário" },
        ]}
      />
      <MonitoringDailyContent
        selectedGroupId={selectedGroupId}
        selectedGroupName={selectedGroupName}
        selectedClientId={selectedClientId}
        selectedClientName={selectedClientName}
        selectedDate={selectedDate}
      />
    </main>
  );
}
