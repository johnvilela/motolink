"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { BadgeSelect } from "@/components/composite/badge-select";
import { FileInput } from "@/components/composite/file-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildPermissionKey, PERMISSION_ACTIONS, PERMISSION_MODULES, ROLE_PERMISSIONS } from "@/constants/permissions";
import { storage } from "@/lib/firebase";
import { mutateUserAction } from "@/modules/users/users-actions";
import { type UserMutateInput, userMutateSchema } from "@/modules/users/users-types";
import { applyCpfMask } from "@/utils/masks/cpf-mask";
import { applyDateMask } from "@/utils/masks/date-mask";
import { applyPhoneMask } from "@/utils/masks/phone-mask";

interface UserFormProps {
  branches: { id: string; name: string; code: string }[];
  defaultValues?: Partial<UserMutateInput>;
  isEditing?: boolean;
  onSuccess?: () => void;
  redirectTo?: string;
}

export function UserForm({ branches, defaultValues, isEditing, onSuccess, redirectTo }: UserFormProps) {
  const router = useRouter();
  const [formFiles, setFormFiles] = useState<(File | string)[]>(defaultValues?.files ?? []);
  const [isUploading, setIsUploading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const preserveInitialPermissionsRef = useRef(isEditing && defaultValues?.permissions !== undefined);
  const previousRoleRef = useRef(defaultValues?.role ?? "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
      files: defaultValues?.files ?? [],
    },
  });

  const { execute, isExecuting } = useAction(mutateUserAction, {
    onSuccess: ({ data }) => {
      if (data?.error) {
        setServerError(data.error);
        toast.error(data.error);
        return;
      }

      if (data?.success) {
        toast.success(isEditing ? "Colaborador atualizado." : "Colaborador criado.");
        onSuccess?.();
        if (redirectTo) {
          router.push(redirectTo);
        }
      }
    },
    onError: () => {
      setServerError("Ocorreu um erro inesperado.");
    },
  });

  const selectedRole = watch("role");
  const selectedPermissions = watch("permissions");
  const selectedBranches = watch("branches");

  const isAdmin = selectedRole === "ADMIN";

  useEffect(() => {
    if (!selectedRole) return;

    if (preserveInitialPermissionsRef.current) {
      preserveInitialPermissionsRef.current = false;
      previousRoleRef.current = selectedRole;
      return;
    }

    if (previousRoleRef.current === selectedRole) return;

    previousRoleRef.current = selectedRole;

    const roleConfig = ROLE_PERMISSIONS.find((r) => r.role === selectedRole);
    if (roleConfig) {
      setValue("permissions", roleConfig.permissions);
    }
  }, [selectedRole, setValue]);

  const togglePermission = useCallback(
    (key: string) => {
      const current = selectedPermissions ?? [];
      if (current.includes(key)) {
        setValue(
          "permissions",
          current.filter((p) => p !== key),
        );
      } else {
        setValue("permissions", [...current, key]);
      }
    },
    [selectedPermissions, setValue],
  );

  const onSubmit = useCallback(
    async (data: UserMutateInput) => {
      setServerError(null);

      const existingUrls = formFiles.filter((f): f is string => typeof f === "string");
      const newFiles = formFiles.filter((f): f is File => f instanceof File);

      let allFileUrls = [...existingUrls];

      if (newFiles.length > 0) {
        setIsUploading(true);
        try {
          const userStorage = storage("users");
          const uploadPromises = newFiles.map((file) => userStorage.upload(file));
          const uploadedUrls = await Promise.all(uploadPromises);
          allFileUrls = [...allFileUrls, ...uploadedUrls];
        } catch {
          toast.error("Erro ao enviar arquivos. Tente novamente.");
          return;
        } finally {
          setIsUploading(false);
        }
      }

      execute({ ...data, files: allFileUrls });
    },
    [formFiles, execute],
  );

  const phoneRegister = register("phone");
  const birthDateRegister = register("birthDate");
  const documentRegister = register("document");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <FieldSet>
        <FieldLegend>Informações Pessoais</FieldLegend>
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Nome</FieldLabel>
            <Input id="name" placeholder="Nome completo" {...register("name")} />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input id="email" type="email" placeholder="email@exemplo.com" {...register("email")} />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone">Telefone</FieldLabel>
            <Input
              id="phone"
              placeholder="(00) 00000-0000"
              {...phoneRegister}
              onChange={(e) => {
                e.target.value = applyPhoneMask(e.target.value);
                phoneRegister.onChange(e);
              }}
            />
            <FieldError errors={[errors.phone]} />
          </Field>

          <Field data-invalid={!!errors.birthDate}>
            <FieldLabel htmlFor="birthDate">Data de Nascimento</FieldLabel>
            <Input
              id="birthDate"
              placeholder="DD/MM/AAAA"
              {...birthDateRegister}
              onChange={(e) => {
                e.target.value = applyDateMask(e.target.value);
                birthDateRegister.onChange(e);
              }}
            />
            <FieldError errors={[errors.birthDate]} />
          </Field>

          <Field data-invalid={!!errors.document}>
            <FieldLabel htmlFor="document">CPF/RG</FieldLabel>
            <Input
              id="document"
              placeholder="000.000.000-00"
              {...documentRegister}
              onChange={(e) => {
                e.target.value = applyCpfMask(e.target.value);
                documentRegister.onChange(e);
              }}
            />
            <FieldError errors={[errors.document]} />
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel>Documentos</FieldLabel>
            <FileInput value={formFiles} onChange={setFormFiles} />
          </Field>
        </div>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Permissões e Acesso</FieldLegend>
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
          <Field data-invalid={!!errors.branches}>
            <FieldLabel>Filiais</FieldLabel>
            <BadgeSelect
              value={selectedBranches}
              onChange={(val) => setValue("branches", val)}
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
              placeholder="Selecionar filiais..."
            />
            <FieldError errors={[errors.branches]} />
          </Field>

          <Field data-invalid={!!errors.role} className="md:col-span-2">
            <FieldLabel>Cargo</FieldLabel>
            <Select value={selectedRole} onValueChange={(val) => setValue("role", val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar cargo..." />
              </SelectTrigger>
              <SelectContent>
                {ROLE_PERMISSIONS.map((r) => (
                  <SelectItem key={r.role} value={r.role}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[errors.role]} />
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel>Permissões</FieldLabel>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Módulo</TableHead>
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
                        const key = buildPermissionKey(module.key, action.key);
                        const isChecked = isAdmin || (selectedPermissions ?? []).includes(key);

                        return (
                          <TableCell key={action.key} className="text-center">
                            <Checkbox
                              checked={isChecked}
                              disabled={isAdmin}
                              onCheckedChange={() => togglePermission(key)}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Field>
        </div>
      </FieldSet>

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" isLoading={isExecuting || isUploading}>
        {isUploading ? "Enviando arquivos..." : isEditing ? "Salvar Alterações" : "Criar Colaborador"}
      </Button>
    </form>
  );
}
