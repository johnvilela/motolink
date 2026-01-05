import { Pencil } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppContentHeader } from "@/components/ui/app-layout/app-content-header";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cpfMask } from "@/lib/masks/cpf-mask";
import { phoneMask } from "@/lib/masks/phone-mask";
import { CONTRACT_TYPE } from "@/lib/modules/deliverymen/deliverymen-constants";
import { deliverymenService } from "@/lib/modules/deliverymen/deliverymen-service";
import { getUserLogged } from "@/lib/modules/users/users-actions";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";

const contractTypeLabels: Record<string, string> = {
  [CONTRACT_TYPE.FREELANCER]: "Freelancer",
  [CONTRACT_TYPE.INDEPENDENT_COLLABORATOR]: "Colaborador independente",
};

const statusLabels = {
  active: "Ativo",
  blocked: "Bloqueado",
};

const formatDate = (value: Date | string) =>
  new Intl.DateTimeFormat("pt-BR").format(new Date(value));

export default async function DeliverymanDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const loggedUser = await getUserLogged();
  const canViewDeliverymen = checkUserPermissions(loggedUser, ["manager.view"]);

  if (!canViewDeliverymen) {
    return redirect("/app/sem-permissao");
  }

  const deliveryman = await deliverymenService()
    .getById(id)
    .catch(() => null);

  if (!deliveryman) {
    return <div>Entregador não encontrado</div>;
  }

  const canEditDeliveryman = checkUserPermissions(loggedUser, ["manager.edit"]);
  const statusKey = deliveryman.isBlocked ? "blocked" : "active";

  return (
    <>
      <AppContentHeader
        breadcrumbItems={[
          {
            title: "Entregadores",
            href: "/app/entregadores",
          },
          {
            title: deliveryman.name || "Detalhes do Entregador",
          },
        ]}
      />
      <main className="container mx-auto py-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Heading variant="h2" className="mb-0">
            {deliveryman.name}
          </Heading>
          {canEditDeliveryman ? (
            <Button asChild>
              <Link href={`/app/entregadores/${deliveryman.id}/editar`}>
                <Pencil className="mr-2 size-4" />
                Editar
              </Link>
            </Button>
          ) : null}
        </div>

        <section className="space-y-4">
          <Heading variant="h3" className="mb-0">
            Informações gerais
          </Heading>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <Text variant="muted">Documento</Text>
              <Text variant="large">
                {deliveryman.document ? cpfMask(deliveryman.document) : "—"}
              </Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">Telefone</Text>
              <Text variant="large">
                {deliveryman.phone ? phoneMask(deliveryman.phone) : "—"}
              </Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">Tipo de contrato</Text>
              <Text variant="large">
                {contractTypeLabels[deliveryman.contractType] ||
                  deliveryman.contractType}
              </Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">Região</Text>
              <Text variant="large">
                {deliveryman.region?.name || "Sem região"}
              </Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">Situação</Text>
              <Text variant="large">{statusLabels[statusKey]}</Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">Cadastrado em</Text>
              <Text variant="large">
                {deliveryman.createdAt
                  ? formatDate(deliveryman.createdAt)
                  : "—"}
              </Text>
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <Heading variant="h3" className="mb-0">
            Chaves PIX
          </Heading>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <Text variant="muted">Principal</Text>
              <Text variant="large">{deliveryman.mainPixKey || "—"}</Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">Secundária</Text>
              <Text variant="large">{deliveryman.secondPixKey || "—"}</Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">Terciária</Text>
              <Text variant="large">{deliveryman.thridPixKey || "—"}</Text>
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <Heading variant="h3" className="mb-0">
            Dados bancários
          </Heading>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Text variant="muted">Agência</Text>
              <Text variant="large">{deliveryman.agency || "—"}</Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">Conta</Text>
              <Text variant="large">{deliveryman.account || "—"}</Text>
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <Heading variant="h3" className="mb-0">
            Veículo
          </Heading>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <Text variant="muted">Modelo</Text>
              <Text variant="large">{deliveryman.vehicleModel || "—"}</Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">Placa</Text>
              <Text variant="large">{deliveryman.vehiclePlate || "—"}</Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">Cor</Text>
              <Text variant="large">{deliveryman.vehicleColor || "—"}</Text>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
