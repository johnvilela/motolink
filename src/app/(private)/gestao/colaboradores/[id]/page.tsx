import dayjs from "dayjs";
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
  Shield,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentHeader } from "@/components/composite/content-header";
import { extractFilenameFromUrl } from "@/components/composite/file-input";
import { StatusBadge } from "@/components/composite/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  buildPermissionKey,
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
} from "@/constants/permissions";
import { branchesService } from "@/modules/branches/branches-service";
import { usersService } from "@/modules/users/users-service";
import { applyCpfMask } from "@/utils/masks/cpf-mask";
import { applyPhoneMask } from "@/utils/masks/phone-mask";

function DetailField({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Field>
      <FieldTitle>
        <Icon className="size-4 text-muted-foreground" />
        {label}
      </FieldTitle>
      <p className="text-sm">{children}</p>
    </Field>
  );
}

function ReadOnlyPermissionsTable({ permissions }: { permissions: string[] }) {
  return (
    <div className="rounded-lg bg-muted/50 p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Módulo</TableHead>
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
                const hasPermission = permissions.includes(
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
                        className="mx-auto size-4 text-red-500 dark:text-red-400"
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
    </div>
  );
}

interface DetalheColaboradorPageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalheColaboradorPage({
  params,
}: DetalheColaboradorPageProps) {
  const { id } = await params;

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
    <div className="space-y-4">
      <ContentHeader
        breadcrumbItems={[
          { title: "Gestão", href: "/gestao" },
          { title: "Colaboradores", href: "/gestao/colaboradores" },
          { title: user.name },
        ]}
      />

      <div className="flex items-center justify-end">
        <Button variant="outline" asChild>
          <Link href={`/gestao/colaboradores/${id}/editar`}>
            <PencilIcon />
            Editar
          </Link>
        </Button>
      </div>

      <div className="space-y-8">
        <FieldSet>
          <FieldLegend>Informação Pessoal</FieldLegend>

          <FieldGroup className="grid grid-cols-1 md:grid-cols-2">
            <DetailField icon={UserIcon} label="Nome">
              {user.name}
            </DetailField>

            <DetailField icon={Mail} label="E-mail">
              {user.email}
            </DetailField>

            <DetailField icon={Phone} label="Telefone">
              {formattedPhone}
            </DetailField>

            <DetailField icon={Calendar} label="Data de Nascimento">
              {formattedBirthDate}
            </DetailField>

            <DetailField icon={FileText} label="CPF/RG">
              {formattedDocument}
            </DetailField>

            <Field>
              <FieldTitle>
                <Shield className="size-4 text-muted-foreground" />
                Status
              </FieldTitle>
              <div>
                <StatusBadge status={user.status} />
              </div>
            </Field>
          </FieldGroup>

          <Field className="mt-4">
            <FieldTitle>
              <Paperclip className="size-4 text-muted-foreground" />
              Documentos
            </FieldTitle>
            {userFiles.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {userFiles.map((url) => (
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
              <p className="text-sm text-muted-foreground">
                Nenhum documento anexado.
              </p>
            )}
          </Field>
        </FieldSet>

        <Separator />

        <FieldSet>
          <FieldLegend>Permissões e Acessos</FieldLegend>

          <FieldGroup>
            <Field>
              <FieldTitle>
                <Building className="size-4 text-muted-foreground" />
                Filiais
              </FieldTitle>
              {user.branches.length > 0 ? (
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
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma filial atribuída.
                </p>
              )}
            </Field>

            <DetailField icon={Briefcase} label="Cargo">
              {user.role}
            </DetailField>

            <Field>
              <FieldTitle>
                <Lock className="size-4 text-muted-foreground" />
                Permissões
              </FieldTitle>
              <ReadOnlyPermissionsTable permissions={user.permissions} />
            </Field>
          </FieldGroup>
        </FieldSet>
      </div>
    </div>
  );
}
