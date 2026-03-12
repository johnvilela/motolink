import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { ContentHeader } from "@/components/composite/content-header";
import { ClientForm } from "@/components/forms/client-form";
import { cookieConst } from "@/constants/cookies";
import { clientsService } from "@/modules/clients/clients-service";
import { groupsService } from "@/modules/groups/groups-service";
import { regionsService } from "@/modules/regions/regions-service";
import { applyCepMask } from "@/utils/masks/cep-mask";
import { applyCnpjMask } from "@/utils/masks/cnpj-mask";
import { applyPhoneMask } from "@/utils/masks/phone-mask";

interface EditarClientePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarClientePage({ params }: EditarClientePageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const branchId = cookieStore.get(cookieConst.SELECTED_BRANCH)?.value;

  const [clientResult, regionsResult, groupsResult] = await Promise.all([
    clientsService().getById(id),
    regionsService().listAll({ page: 1, pageSize: 100, branchId }),
    groupsService().listAll({ page: 1, pageSize: 100, branchId }),
  ]);

  if (clientResult.isErr() || !clientResult.value) {
    notFound();
  }

  const client = clientResult.value;
  const comm = client.commercialCondition;
  const regions = regionsResult.isOk() ? regionsResult.value.data : [];
  const groups = groupsResult.isOk() ? groupsResult.value.data : [];

  const defaultValues = {
    id: client.id,
    name: client.name,
    cnpj: applyCnpjMask(client.cnpj),
    contactName: client.contactName,
    contactPhone: client.contactPhone ? applyPhoneMask(client.contactPhone) : "",
    observations: client.observations ?? "",
    cep: applyCepMask(client.cep),
    street: client.street,
    number: client.number,
    complement: client.complement ?? "",
    neighborhood: client.neighborhood,
    city: client.city,
    uf: client.uf,
    regionId: client.regionId ?? "",
    groupId: client.groupId ?? "",
    provideMeal: client.provideMeal,
    bagsStatus: comm?.bagsStatus ?? "UNKNOWN",
    bagsAllocated: comm?.bagsAllocated ?? 0,
    hasRainTax: (comm?.rainTax ?? 0) > 0,
    rainTax: comm?.rainTax ?? 0,
    deliveryAreaKm: comm?.deliveryAreaKm ?? 0,
    isMotolinkCovered: comm?.isMotolinkCovered ?? false,
    paymentForm: comm?.paymentForm ?? [],
    dailyPeriods: comm?.dailyPeriods ?? [],
    guaranteedPeriods: comm?.guaranteedPeriods ?? [],
    clientDailyDay: comm?.clientDailyDay ?? 0,
    clientDailyNight: comm?.clientDailyNight ?? 0,
    clientDailyDayWknd: comm?.clientDailyDayWknd ?? 0,
    clientDailyNightWknd: comm?.clientDailyNightWknd ?? 0,
    deliverymanDailyDay: comm?.deliverymanDailyDay ?? 0,
    deliverymanDailyNight: comm?.deliverymanDailyNight ?? 0,
    deliverymanDailyDayWknd: comm?.deliverymanDailyDayWknd ?? 0,
    deliverymanDailyNightWknd: comm?.deliverymanDailyNightWknd ?? 0,
    clientPerDelivery: comm?.clientPerDelivery ?? 0,
    clientAdditionalKm: comm?.clientAdditionalKm ?? 0,
    deliverymanPerDelivery: comm?.deliverymanPerDelivery ?? 0,
    deliverymanAdditionalKm: comm?.deliverymanAdditionalKm ?? 0,
    guaranteedDay: comm?.guaranteedDay ?? 0,
    guaranteedNight: comm?.guaranteedNight ?? 0,
    guaranteedDayWeekend: comm?.guaranteedDayWeekend ?? 0,
    guaranteedNightWeekend: comm?.guaranteedNightWeekend ?? 0,
    guaranteedDayTax: comm?.guaranteedDayTax ?? 0,
    guaranteedNightTax: comm?.guaranteedNightTax ?? 0,
    guaranteedDayWeekendTax: comm?.guaranteedDayWeekendTax ?? 0,
    guaranteedNightWeekendTax: comm?.guaranteedNightWeekendTax ?? 0,
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 py-6">
      <ContentHeader
        breadcrumbItems={[
          { title: "Clientes", href: "/gestao/clientes" },
          { title: client.name, href: `/gestao/clientes/${id}` },
          { title: "Editar" },
        ]}
      />
      <ClientForm
        regions={regions}
        groups={groups}
        defaultValues={defaultValues}
        isEditing
        redirectTo={`/gestao/clientes/${id}`}
      />
    </main>
  );
}
