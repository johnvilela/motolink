import {
  Banknote,
  Car,
  EyeIcon,
  FileIcon,
  FileText,
  Key,
  Landmark,
  MapPin,
  Palette,
  Paperclip,
  PencilIcon,
  Phone,
  RectangleEllipsis,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentHeader } from "@/components/composite/content-header";
import { extractFilenameFromUrl } from "@/components/composite/file-input";
import { StatusBadge } from "@/components/composite/status-badge";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { ContractTypeOptions } from "@/constants/contract-type";
import { deliverymanService } from "@/modules/deliveryman/deliveryman-service";
import { getCurrentUser } from "@/modules/users/users-queries";
import { hasPermissions } from "@/utils/has-permissions";
import { applyCpfMask } from "@/utils/masks/cpf-mask";
import { applyPhoneMask } from "@/utils/masks/phone-mask";
import requirePermissions from "@/utils/require-permissions";

interface DetalheEntregadorPageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalheEntregadorPage({
  params,
}: DetalheEntregadorPageProps) {
  const { id } = await params;

  const currentUser = await getCurrentUser();
  requirePermissions(currentUser, ["deliverymen.view"], "Entregadores");

  const deliveryman = await deliverymanService().getById(id);

  if (!deliveryman) {
    notFound();
  }

  const formattedPhone = deliveryman.phone
    ? applyPhoneMask(deliveryman.phone)
    : "Não informado";
  const formattedDocument = deliveryman.document
    ? applyCpfMask(deliveryman.document)
    : "Não informado";
  const contractTypeLabel =
    ContractTypeOptions.find((o) => o.value === deliveryman.contractType)
      ?.label ?? deliveryman.contractType;

  return (
    <div className="space-y-4">
      <ContentHeader
        breadcrumbItems={[
          { title: "Gestão", href: "/gestao" },
          { title: "Entregadores", href: "/gestao/entregadores" },
          { title: deliveryman.name },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heading variant="h3">{deliveryman.name}</Heading>
          <StatusBadge status={deliveryman.isBlocked ? "BLOCKED" : "ACTIVE"} />
        </div>
        {hasPermissions(currentUser, ["deliverymen.edit"]) && (
          <Button variant="outline" asChild>
            <Link href={`/gestao/entregadores/${id}/editar`}>
              <PencilIcon />
              Editar
            </Link>
          </Button>
        )}
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <Heading variant="h4">Informações Pessoais</Heading>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              <Text variant="small">
                <span className="font-medium">CPF:</span> {formattedDocument}
              </Text>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground" />
              <Text variant="small">
                <span className="font-medium">Telefone:</span> {formattedPhone}
              </Text>
            </div>

            <div className="flex items-center gap-2">
              <UserIcon className="size-4 text-muted-foreground" />
              <Text variant="small">
                <span className="font-medium">Tipo de Contrato:</span>{" "}
                {contractTypeLabel}
              </Text>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              <Text variant="small">
                <span className="font-medium">Região:</span>{" "}
                {deliveryman.region?.name ?? "Não informado"}
              </Text>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Paperclip className="size-4 text-muted-foreground" />
              <Text variant="small" className="font-medium">
                Documentos
              </Text>
            </div>
            {deliveryman.files.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {deliveryman.files.map((url) => (
                  <li
                    key={url}
                    className="flex items-center gap-3 rounded-md border bg-background p-3"
                  >
                    <FileIcon className="size-5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {extractFilenameFromUrl(url)}
                    </span>
                    <Button variant="ghost" size="icon-sm" asChild>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Abrir ${extractFilenameFromUrl(url)}`}
                      >
                        <EyeIcon className="size-4" />
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <Text variant="muted">Nenhum documento anexado.</Text>
            )}
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <Heading variant="h4">Informações Financeiras</Heading>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Key className="size-4 text-muted-foreground" />
              <Text variant="small">
                <span className="font-medium">PIX Principal:</span>{" "}
                {deliveryman.mainPixKey}
              </Text>
            </div>

            <div className="flex items-center gap-2">
              <Key className="size-4 text-muted-foreground" />
              <Text variant="small">
                <span className="font-medium">PIX Secundária:</span>{" "}
                {deliveryman.secondPixKey || "Não informado"}
              </Text>
            </div>

            <div className="flex items-center gap-2">
              <Key className="size-4 text-muted-foreground" />
              <Text variant="small">
                <span className="font-medium">PIX Terciária:</span>{" "}
                {deliveryman.thridPixKey || "Não informado"}
              </Text>
            </div>

            <div className="flex items-center gap-2">
              <Landmark className="size-4 text-muted-foreground" />
              <Text variant="small">
                <span className="font-medium">Agência:</span>{" "}
                {deliveryman.agency || "Não informado"}
              </Text>
            </div>

            <div className="flex items-center gap-2">
              <Banknote className="size-4 text-muted-foreground" />
              <Text variant="small">
                <span className="font-medium">Conta:</span>{" "}
                {deliveryman.account || "Não informado"}
              </Text>
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <Heading variant="h4">Veículo</Heading>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Car className="size-4 text-muted-foreground" />
              <Text variant="small">
                <span className="font-medium">Modelo:</span>{" "}
                {deliveryman.vehicleModel || "Não informado"}
              </Text>
            </div>

            <div className="flex items-center gap-2">
              <RectangleEllipsis className="size-4 text-muted-foreground" />
              <Text variant="small">
                <span className="font-medium">Placa:</span>{" "}
                {deliveryman.vehiclePlate || "Não informado"}
              </Text>
            </div>

            <div className="flex items-center gap-2">
              <Palette className="size-4 text-muted-foreground" />
              <Text variant="small">
                <span className="font-medium">Cor:</span>{" "}
                {deliveryman.vehicleColor || "Não informado"}
              </Text>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
