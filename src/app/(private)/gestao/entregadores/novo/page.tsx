import { cookies } from "next/headers";
import { ContentHeader } from "@/components/composite/content-header";
import { DeliverymanForm } from "@/components/forms/deliveryman-form";
import { cookieConst } from "@/constants/cookies";
import { regionsService } from "@/modules/regions/regions-service";
import { getCurrentUser } from "@/modules/users/users-queries";
import requirePermissions from "@/utils/require-permissions";

export default async function NovoEntregadorPage() {
  const currentUser = await getCurrentUser();
  requirePermissions(currentUser, ["deliverymen.create"], "Entregadores");

  const store = await cookies();
  const branchId = store.get(cookieConst.SELECTED_BRANCH)?.value;

  const { data: regions } = await regionsService().listAll({
    page: 1,
    pageSize: 999,
    branchId,
  });

  return (
    <div className="space-y-4">
      <ContentHeader
        breadcrumbItems={[
          { title: "Gestão", href: "/gestao" },
          { title: "Entregadores", href: "/gestao/entregadores" },
          { title: "Novo Entregador" },
        ]}
      />

      <DeliverymanForm regions={regions} redirectTo="/gestao/entregadores" />
    </div>
  );
}
