"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { BadgeSelect } from "@/components/composite/badge-select";
import {
  FileInput,
  type FileInputItem,
  type FileValidationError,
  isFileObject,
} from "@/components/composite/file-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  type PermissionActionKey,
  type PermissionModuleKey,
  permissionsConst,
} from "@/constants/permissions";

import { mutateUserAction } from "@/modules/users/users-actions";
import {
  type UserMutateInput,
  userMutateSchema,
} from "@/modules/users/users-types";
import { fileManagement } from "@/utils/file-management";
import { applyCpfMask } from "@/utils/masks/cpf-mask";
import { applyDateMask } from "@/utils/masks/date-mask";
import { applyPhoneMask } from "@/utils/masks/phone-mask";

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface UserFormProps {
  branches: Branch[];
  defaultValues?: Partial<UserMutateInput>;
  isEditing?: boolean;
  onSuccess?: () => void;
  redirectTo?: string;
}
interface PermissionsTableProps {
  permissions: string[];
  onPermissionToggle: (permission: string) => void;
}

function PermissionsTable({
  permissions,
  onPermissionToggle,
}: PermissionsTableProps) {
  const isChecked = useCallback(
    (module: PermissionModuleKey, action: PermissionActionKey) =>
      permissions.includes(buildPermissionKey(module, action)),
    [permissions],
  );

  return (
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
              const permissionKey = buildPermissionKey(module.key, action.key);
              return (
                <TableCell key={action.key} className="text-center">
                  <Checkbox
                    checked={isChecked(module.key, action.key)}
                    onCheckedChange={() => onPermissionToggle(permissionKey)}
                    aria-label={`${action.label} ${module.label}`}
                  />
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function UserForm({
  branches,
  defaultValues,
  isEditing = false,
  onSuccess,
  redirectTo,
}: UserFormProps) {
  const router = useRouter();
  const { execute, isExecuting, result } = useAction(mutateUserAction);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<UserMutateInput>({
    resolver: zodResolver(userMutateSchema),
    defaultValues: {
      id: defaultValues?.id,
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      birthDate: defaultValues?.birthDate ?? "",
      document: defaultValues?.document ?? "",
      branches: defaultValues?.branches ?? [],
      role: defaultValues?.role ?? "",
      permissions: defaultValues?.permissions ?? [],
    },
  });

  const [isUploading, setIsUploading] = useState(false);
  const [formFiles, setFormFiles] = useState<FileInputItem[]>(
    defaultValues?.files ?? [],
  );

  const handleFileValidationError = useCallback(
    (errors: FileValidationError[]) => {
      errors.forEach((error) => {
        toast.error(error.message);
      });
    },
    [],
  );

  const branchOptions = branches.map((branch) => ({
    value: branch.id,
    label: branch.name,
  }));

  const watchedRole = useWatch({ control, name: "role" });

  useEffect(() => {
    if (!watchedRole) return;

    const roleConfig = permissionsConst.find((r) => r.role === watchedRole);
    if (roleConfig) {
      setValue("permissions", roleConfig.permissions);
    }
  }, [watchedRole, setValue]);

  useEffect(() => {
    if (result.data?.success) {
      toast.success(
        isEditing ? "Colaborador atualizado." : "Colaborador criado.",
      );
      if (onSuccess) {
        onSuccess();
      }
      if (redirectTo) {
        router.push(redirectTo);
      }
      return;
    }

    if (result.data?.error) {
      toast.error(result.data.error);
    }
  }, [result, isEditing, onSuccess, redirectTo, router]);

  async function onSubmit(data: UserMutateInput) {
    try {
      setIsUploading(true);

      const existingUrls = formFiles.filter(
        (item): item is string => typeof item === "string",
      );
      const newFiles = formFiles.filter(isFileObject);

      let uploadedUrls: string[] = [];

      if (newFiles.length > 0) {
        try {
          uploadedUrls = await fileManagement().upload({
            files: newFiles,
            path: "users",
          });
        } catch {
          toast.error("Erro ao enviar arquivos. Tente novamente.");
          return;
        }
      }

      const allFileUrls = [...existingUrls, ...uploadedUrls];

      execute({
        ...data,
        files: allFileUrls,
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <FieldSet>
        <FieldLegend>Informação Pessoal</FieldLegend>

        <FieldGroup className="grid grid-cols-1 md:grid-cols-2">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Nome</FieldLabel>
            <Input
              id="name"
              placeholder="Nome completo"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone">Telefone</FieldLabel>
            <Input
              id="phone"
              placeholder="(00) 00000-0000"
              aria-invalid={!!errors.phone}
              {...register("phone", {
                onChange: (e) => {
                  e.target.value = applyPhoneMask(e.target.value);
                },
              })}
            />
            <FieldError errors={[errors.phone]} />
          </Field>

          <Field data-invalid={!!errors.birthDate}>
            <FieldLabel htmlFor="birthDate">Data de Nascimento</FieldLabel>
            <Input
              id="birthDate"
              placeholder="DD/MM/AAAA"
              aria-invalid={!!errors.birthDate}
              {...register("birthDate", {
                onChange: (e) => {
                  e.target.value = applyDateMask(e.target.value);
                },
              })}
            />
            <FieldError errors={[errors.birthDate]} />
          </Field>

          <Field data-invalid={!!errors.document}>
            <FieldLabel htmlFor="document">CPF/RG</FieldLabel>
            <Input
              id="document"
              placeholder="000.000.000-00"
              aria-invalid={!!errors.document}
              {...register("document", {
                onChange: (e) => {
                  e.target.value = applyCpfMask(e.target.value);
                },
              })}
            />
            <FieldError errors={[errors.document]} />
          </Field>
        </FieldGroup>

        <Field className="mt-4">
          <FieldLabel>Documentos</FieldLabel>
          <FileInput
            value={formFiles}
            onChange={setFormFiles}
            disabled={isExecuting || isUploading}
            onValidationError={handleFileValidationError}
          />
          <FieldDescription>
            Adicione documentos do colaborador (CNH, RG, comprovante de
            residência, etc.)
          </FieldDescription>
        </Field>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Permissões e Acessos</FieldLegend>

        <FieldGroup>
          <Field data-invalid={!!errors.branches}>
            <FieldLabel>Filiais</FieldLabel>
            <Controller
              name="branches"
              control={control}
              render={({ field }) => (
                <BadgeSelect
                  options={branchOptions}
                  multiple
                  value={field.value ?? []}
                  onChange={field.onChange}
                  error={!!errors.branches}
                />
              )}
            />
            <FieldError errors={[errors.branches]} />
          </Field>

          <Field data-invalid={!!errors.role}>
            <FieldLabel htmlFor="role">Cargo</FieldLabel>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Selecione um cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {permissionsConst.map((roleConfig) => (
                      <SelectItem key={roleConfig.role} value={roleConfig.role}>
                        {roleConfig.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.role]} />
          </Field>

          <Field>
            <FieldLabel>Permissões</FieldLabel>
            <Controller
              name="permissions"
              control={control}
              render={({ field }) => {
                const permissions = field.value ?? [];
                return (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <PermissionsTable
                      permissions={permissions}
                      onPermissionToggle={(permission) => {
                        const updated = permissions.includes(permission)
                          ? permissions.filter((p) => p !== permission)
                          : [...permissions, permission];
                        field.onChange(updated);
                      }}
                    />
                  </div>
                );
              }}
            />
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex md:justify-end">
        <Button
          type="submit"
          isLoading={isExecuting || isUploading}
          className="w-full md:w-auto"
        >
          {isUploading
            ? "Enviando arquivos..."
            : isEditing
              ? "Salvar Alterações"
              : "Criar Colaborador"}
        </Button>
      </div>

      {result.data?.error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="size-4" />
          <AlertDescription>{result.data.error}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
