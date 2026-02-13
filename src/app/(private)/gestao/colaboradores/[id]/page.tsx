import dayjs from "dayjs";
import type { LucideIcon } from "lucide-react";
import {
  Ban,
  Briefcase,
  Building,
  Calendar,
  CheckCircle2,
  EyeIcon,
  FileIcon,
  FileText,
  Lock,
  Mail,
  Paperclip,
  PencilIcon,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentHeader } from "@/components/composite/content-header";
import { extractFilenameFromUrl } from "@/components/composite/file-input";
import { StatusBadge } from "@/components/composite/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Text } from "@/components/ui/text";
import {
  buildPermissionKey,
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
} from "@/constants/permissions";
import { branchesService } from "@/modules/branches/branches-service";
import { getCurrentUser } from "@/modules/users/users-queries";
import { usersService } from "@/modules/users/users-service";
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

function ReadOnlyPermissionsTable({
  permissions,
  isAdmin = false,
}: {
  permissions: string[];
  isAdmin?: boolean;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-37.5">Módulo</TableHead>
          {PERMISSION_ACTIONS.map((action) => (
            <TableHead key={action.key} className="text-center">
              {action.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {PERMISSION_MODULES.map((module) => (
          <TableRow key={module.key}>
            <TableCell className="font-medium">{module.label}</TableCell>
            {PERMISSION_ACTIONS.map((action) => {
              const hasPermission =
                isAdmin ||
                permissions.includes(
                  buildPermissionKey(module.key, action.key),
                );
              return (
                <TableCell key={action.key} className="text-center">
                  {hasPermission ? (
                    <CheckCircle2
                      className="mx-auto size-4 text-green-600 dark:text-green-400"
                      aria-label={`${module.label}: ${action.label} permitido`}
                    />
                  ) : (
                    <Ban
                      className="mx-auto size-4 text-muted-foreground/40"
                      aria-label={`${module.label}: ${action.label} não permitido`}
                    />
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface DetalheColaboradorPageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalheColaboradorPage({
  params,
}: DetalheColaboradorPageProps) {
  const { id } = await params;

  const currentUser = await getCurrentUser();
  requirePermissions(currentUser, ["users.view"], "Colaboradores");

  const user = await usersService().getById(id);

  if (!user) {
    notFound();
  }

  const branches =
    user.branches.length > 0
      ? await branchesService().getByIds(user.branches)
      : [];

  const branchMap = new Map(branches.map((b) => [b.id, b]));

  const formattedPhone = user.phone
    ? applyPhoneMask(user.phone)
    : "Não informado";
  const formattedDocument = user.document
    ? applyCpfMask(user.document)
    : "Não informado";
  const formattedBirthDate = user.birthDate
    ? dayjs(user.birthDate).format("DD/MM/YYYY")
    : "Não informado";
  const userFiles = (user.files ?? []) as string[];

  return (
    <div className="space-y-6">
      <ContentHeader
        breadcrumbItems={[
          { title: "Gestão", href: "/gestao" },
          { title: "Colaboradores", href: "/gestao/colaboradores" },
          { title: user.name },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heading variant="h3">{user.name}</Heading>
          <StatusBadge status={user.status} />
        </div>
        {hasPermissions(currentUser, ["users.edit"]) && (
          <Button variant="outline" asChild>
            <Link href={`/gestao/colaboradores/${id}/editar`}>
              <PencilIcon />
              Editar
            </Link>
          </Button>
        )}
      </div>

      {user.branches.length > 0 ? (
        <div className="flex items-center gap-3">
          <Building className="size-4 shrink-0 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {user.branches.map((branchId) => {
              const branch = branchMap.get(branchId);
              return (
                <Badge key={branchId} variant="secondary">
                  {branch ? branch.name : branchId}
                </Badge>
              );
            })}
          </div>
        </div>
      ) : (
        <Text variant="muted">Nenhuma filial atribuída.</Text>
      )}

      <div className="grid gap-6">
        {/* Personal Info */}
        <section className="space-y-5 rounded-xl border p-6">
          <Heading variant="h4">Informação Pessoal</Heading>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InfoItem icon={Mail} value={user.email} />
            <InfoItem icon={Phone} value={formattedPhone} />
            <InfoItem
              icon={Calendar}
              label="Nascimento"
              value={formattedBirthDate}
            />
            <InfoItem icon={FileText} label="CPF" value={formattedDocument} />
          </div>
        </section>

        {/* Documents */}
        <section className="space-y-4 rounded-xl border p-6">
          <div className="flex items-center gap-2">
            <Paperclip className="size-4 text-muted-foreground" />
            <Heading variant="h4">Documentos</Heading>
          </div>

          {userFiles.length > 0 ? (
            <ul className="grid gap-2">
              {userFiles.map((url) => (
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

        {/* Permissions & Access */}
        <section className="space-y-5 rounded-xl border p-6">
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-muted-foreground" />
            <Heading variant="h4">Permissões e Acessos</Heading>
          </div>

          <InfoItem icon={Briefcase} label="Cargo" value={user.role} />

          <div className="overflow-x-auto rounded-lg bg-muted/50 p-4">
            <ReadOnlyPermissionsTable
              permissions={user.permissions}
              isAdmin={user.role === "ADMIN"}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
