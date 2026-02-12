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
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentHeader } from "@/components/composite/content-header";
import { extractFilenameFromUrl } from "@/components/composite/file-input";
import { StatusBadge } from "@/components/composite/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
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
import { usersService } from "@/modules/users/users-service";
import { applyCpfMask } from "@/utils/masks/cpf-mask";
import { applyPhoneMask } from "@/utils/masks/phone-mask";

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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heading variant="h3">{user.name}</Heading>
          <StatusBadge status={user.status} />
        </div>
        <Button variant="outline" asChild>
          <Link href={`/gestao/colaboradores/${id}/editar`}>
            <PencilIcon />
            Editar
          </Link>
        </Button>
      </div>

      <div>
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
          <Text variant="muted">Nenhuma filial atribuída.</Text>
        )}
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <Heading variant="h4">Informação Pessoal</Heading>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              <Text variant="small">{user.email}</Text>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground" />
              <Text variant="small">{formattedPhone}</Text>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <Text variant="small">{formattedBirthDate}</Text>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              <Text variant="small">{formattedDocument}</Text>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Paperclip className="size-4 text-muted-foreground" />
              <Text variant="small" className="font-medium">
                Documentos
              </Text>
            </div>
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
              <Text variant="muted">Nenhum documento anexado.</Text>
            )}
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <Heading variant="h4">Permissões e Acessos</Heading>

          <div className="flex items-center gap-2">
            <Building className="size-4 shrink-0 text-muted-foreground" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Briefcase className="size-4 text-muted-foreground" />
              <Text variant="small" className="font-medium">
                Cargo
              </Text>
            </div>
            <Text variant="small">{user.role}</Text>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-muted-foreground" />
              <Text variant="small" className="font-medium">
                Permissões
              </Text>
            </div>
            <ReadOnlyPermissionsTable permissions={user.permissions} />
          </div>
        </section>
      </div>
    </div>
  );
}
