import type { LucideIcon } from "lucide-react";
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
import { Text } from "@/components/ui/text";
import { ContractTypeOptions } from "@/constants/contract-type";
import { deliverymanService } from "@/modules/deliveryman/deliveryman-service";
import { getCurrentUser } from "@/modules/users/users-queries";
import { hasPermissions } from "@/utils/has-permissions";
import { applyCpfMask } from "@/utils/masks/cpf-mask";
import { applyPhoneMask } from "@/utils/masks/phone-mask";
import requirePermissions from "@/utils/require-permissions";

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label?: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        {label && (
          <p className="text-xs leading-none text-muted-foreground">{label}</p>
        )}
        <p className="truncate text-sm">{value}</p>
      </div>
    </div>
  );
}

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
    <div className="space-y-6">
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

      <div className="grid gap-6">
        {/* Personal Info */}
        <section className="space-y-5 rounded-xl border p-6">
          <Heading variant="h4">Informações Pessoais</Heading>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InfoItem icon={FileText} label="CPF" value={formattedDocument} />
            <InfoItem icon={Phone} label="Telefone" value={formattedPhone} />
            <InfoItem
              icon={UserIcon}
              label="Tipo de Contrato"
              value={contractTypeLabel}
            />
            <InfoItem
              icon={MapPin}
              label="Região"
              value={deliveryman.region?.name ?? "Não informado"}
            />
          </div>
        </section>

        {/* Documents */}
        <section className="space-y-4 rounded-xl border p-6">
          <div className="flex items-center gap-2">
            <Paperclip className="size-4 text-muted-foreground" />
            <Heading variant="h4">Documentos</Heading>
          </div>

          {deliveryman.files.length > 0 ? (
            <ul className="grid gap-2">
              {deliveryman.files.map((url) => (
                <li
                  key={url}
                  className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3"
                >
                  <FileIcon className="size-5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-sm">
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
        </section>

        {/* Financial Info */}
        <section className="space-y-5 rounded-xl border p-6">
          <div className="flex items-center gap-2">
            <Banknote className="size-4 text-muted-foreground" />
            <Heading variant="h4">Informações Financeiras</Heading>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InfoItem
              icon={Key}
              label="PIX Principal"
              value={deliveryman.mainPixKey}
            />
            <InfoItem
              icon={Key}
              label="PIX Secundária"
              value={deliveryman.secondPixKey || "Não informado"}
            />
            <InfoItem
              icon={Key}
              label="PIX Terciária"
              value={deliveryman.thridPixKey || "Não informado"}
            />
            <InfoItem
              icon={Landmark}
              label="Agência"
              value={deliveryman.agency || "Não informado"}
            />
            <InfoItem
              icon={Banknote}
              label="Conta"
              value={deliveryman.account || "Não informado"}
            />
          </div>
        </section>

        {/* Vehicle */}
        <section className="space-y-5 rounded-xl border p-6">
          <div className="flex items-center gap-2">
            <Car className="size-4 text-muted-foreground" />
            <Heading variant="h4">Veículo</Heading>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <InfoItem
              icon={Car}
              label="Modelo"
              value={deliveryman.vehicleModel || "Não informado"}
            />
            <InfoItem
              icon={RectangleEllipsis}
              label="Placa"
              value={deliveryman.vehiclePlate || "Não informado"}
            />
            <InfoItem
              icon={Palette}
              label="Cor"
              value={deliveryman.vehicleColor || "Não informado"}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
