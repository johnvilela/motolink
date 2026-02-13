import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ContentHeader } from "@/components/composite/content-header";
import { DeliverymanForm } from "@/components/forms/deliveryman-form";
import { cookieConst } from "@/constants/cookies";
import { deliverymanService } from "@/modules/deliveryman/deliveryman-service";
import { regionsService } from "@/modules/regions/regions-service";
import { getCurrentUser } from "@/modules/users/users-queries";
import { applyCpfMask } from "@/utils/masks/cpf-mask";
import { applyPhoneMask } from "@/utils/masks/phone-mask";
import requirePermissions from "@/utils/require-permissions";

interface EditarEntregadorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarEntregadorPage({
  params,
}: EditarEntregadorPageProps) {
  const { id } = await params;

  const currentUser = await getCurrentUser();
  requirePermissions(currentUser, ["deliverymen.edit"], "Entregadores");

  const store = await cookies();
  const branchId = store.get(cookieConst.SELECTED_BRANCH)?.value;

  const [deliveryman, { data: regions }] = await Promise.all([
    deliverymanService().getById(id),
    regionsService().listAll({ page: 1, pageSize: 999, branchId }),
  ]);

  if (!deliveryman) {
    notFound();
  }

  const defaultValues = {
    id: deliveryman.id,
    name: deliveryman.name,
    document: deliveryman.document ? applyCpfMask(deliveryman.document) : "",
    phone: deliveryman.phone ? applyPhoneMask(deliveryman.phone) : "",
    contractType: deliveryman.contractType,
    mainPixKey: deliveryman.mainPixKey,
    secondPixKey: deliveryman.secondPixKey ?? "",
    thridPixKey: deliveryman.thridPixKey ?? "",
    agency: deliveryman.agency ?? "",
    account: deliveryman.account ?? "",
    vehicleModel: deliveryman.vehicleModel ?? "",
    vehiclePlate: deliveryman.vehiclePlate ?? "",
    vehicleColor: deliveryman.vehicleColor ?? "",
    regionId: deliveryman.regionId ?? "",
    files: deliveryman.files,
  };

  return (
    <div className="space-y-4">
      <ContentHeader
        breadcrumbItems={[
          { title: "Gestão", href: "/gestao" },
          { title: "Entregadores", href: "/gestao/entregadores" },
          {
            title: deliveryman.name,
            href: `/gestao/entregadores/${id}`,
          },
          { title: "Editar" },
        ]}
      />

      <DeliverymanForm
        regions={regions}
        defaultValues={defaultValues}
        isEditing
        redirectTo="/gestao/entregadores"
      />
    </div>
  );
}
