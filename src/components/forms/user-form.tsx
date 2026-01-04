"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ChevronDown } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { BRANCHS } from "@/lib/constants/app";
import { MutateUserSchema } from "@/lib/modules/users/user-types";
import { mutateUserAction } from "@/lib/modules/users/users-actions";
import {
  userPermissions,
  userRolesArr,
} from "@/lib/modules/users/users-constants";
import type { User } from "../../../generated/prisma/client";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textfield } from "../ui/textfield";

type UserFormDTO = z.infer<typeof MutateUserSchema>;

interface UserFormProps {
  user: Omit<User, "password">;
  userToBeEdited?: Omit<User, "password">;
}

export const UserForm = ({ user, userToBeEdited }: UserFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UserFormDTO>({
    resolver: zodResolver(MutateUserSchema),
    defaultValues: {
      id: userToBeEdited?.id || "",
      name: userToBeEdited?.name || "",
      email: userToBeEdited?.email || "",
      branchs: userToBeEdited?.branchs || [],
      permissions: userToBeEdited?.permissions || [],
      role: (userToBeEdited?.role as UserFormDTO["role"]) || "USER",
    },
  });

  const { execute, isExecuting, result } = useAction(mutateUserAction);

  const selectedPermissions = watch("permissions") || [];
  const selectedRole = watch("role");
  const selectedBranchs = watch("branchs") || [];

  const togglePermission = (permission: string) => {
    const newPermissions = selectedPermissions.includes(permission)
      ? selectedPermissions.filter((p) => p !== permission)
      : [...selectedPermissions, permission];
    setValue("permissions", newPermissions, { shouldValidate: true });
  };

  const toggleBranchs = (branch: string) => {
    const newBranchs = selectedBranchs.includes(branch)
      ? selectedBranchs.filter((b) => b !== branch)
      : [...selectedBranchs, branch];
    setValue("branchs", newBranchs, { shouldValidate: true });
  };

  const userRoles = userRolesArr.filter((role) => {
    if (user.role !== "ADMIN" && role === "ADMIN") return false;
    return true;
  });

  return (
    <form
      className="flex flex-col gap-4 my-2 p-4"
      onSubmit={handleSubmit(execute)}
      autoComplete="off"
    >
      {result.serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error {result.serverError.code}</AlertTitle>
          <AlertDescription>{result.serverError.message}</AlertDescription>
        </Alert>
      )}
      <input type="hidden" {...register("id")} />
      <div className="grid grid-cols-2 gap-2">
        <Textfield
          type="text"
          label="Nome"
          error={errors.name?.message}
          {...register("name")}
          autoComplete="off"
        />
        <div>
          <Label htmlFor="role">Tipos de usuário</Label>
          <Select
            defaultValue="USER"
            onValueChange={(value) =>
              setValue("role", value as UserFormDTO["role"])
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a permissão" />
            </SelectTrigger>
            <SelectContent>
              {userRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-xs text-red-600 mt-1">{errors.role.message}</p>
          )}
        </div>
        <Textfield
          type="email"
          label="Email"
          error={errors.email?.message}
          {...register("email")}
          autoComplete="off"
        />
      </div>
      <div>
        <Label>Filiais</Label>
        <div className="space-y-2 rounded-md border p-4">
          <div className="flex flex-wrap gap-2 pl-2">
            {Object.entries(BRANCHS).map(([key, name]) => {
              const isSelected = selectedBranchs.includes(key);
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => toggleBranchs(key)}
                  className="cursor-pointer"
                >
                  {isSelected ? (
                    <Badge>{name}</Badge>
                  ) : (
                    <span className="text-xs px-2 py-0.5">{name}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {selectedRole !== "ADMIN" && (
        <div>
          <Label>Permissões Específicas</Label>
          <div className="space-y-2 rounded-md border p-4">
            {userPermissions.map((group) => {
              const groupSelectedPermissions = group.rules.filter((rule) =>
                selectedPermissions.includes(rule.permission),
              ).length;
              return (
                <Collapsible key={group.type}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full flex justify-between"
                    >
                      <span className="text-sm font-medium">
                        {group.type} ({groupSelectedPermissions})
                      </span>
                      <ChevronDown className="size-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-2">
                    <div className="flex flex-wrap gap-2 pl-2">
                      {group.rules.map((rule) => {
                        const isSelected = selectedPermissions.includes(
                          rule.permission,
                        );
                        return (
                          <button
                            type="button"
                            key={rule.permission}
                            onClick={() => togglePermission(rule.permission)}
                            className="cursor-pointer"
                          >
                            {isSelected ? (
                              <Badge>{rule.description}</Badge>
                            ) : (
                              <span className="text-xs px-2 py-0.5">
                                {rule.description}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
          {errors.permissions && (
            <p className="text-xs text-red-600 mt-1">
              {errors.permissions.message}
            </p>
          )}
        </div>
      )}

      <Button type="submit" isLoading={isExecuting} className="mt-4">
        {userToBeEdited ? "Atualizar Colaborador" : "Criar Colaborador"}
      </Button>
    </form>
  );
};
