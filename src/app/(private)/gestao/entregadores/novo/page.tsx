import { cookies } from "next/headers";

import { AccessDenied } from "@/components/composite/access-denied";
import { ContentHeader } from "@/components/composite/content-header";
import { DeliverymanForm } from "@/components/forms/deliveryman-form";
import { cookieConst } from "@/constants/cookies";
import { regionsService } from "@/modules/regions/regions-service";
import { checkPagePermission } from "@/utils/check-page-permission";

export default async function NovoEntregadorPage() {
  if (!(await checkPagePermission("deliverymen.create"))) return <AccessDenied />;
  const cookieStore = await cookies();
  const branchId = cookieStore.get(cookieConst.SELECTED_BRANCH)?.value;

  const regionsResult = await regionsService().listAll({
    page: 1,
    pageSize: 100,
    branchId,
  });

  const regions = regionsResult.isOk() ? regionsResult.value.data : [];

  return (
    <main className="mx-auto max-w-6xl space-y-6 py-6">
      <ContentHeader
        breadcrumbItems={[{ title: "Entregadores", href: "/gestao/entregadores" }, { title: "Novo Entregador" }]}
      />
      <DeliverymanForm regions={regions} redirectTo="/gestao/entregadores" />
    </main>
  );
}
