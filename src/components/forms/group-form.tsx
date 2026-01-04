"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { mutateGroupAction } from "@/lib/modules/groups/groups-actions";
import { MutateGroupSchema } from "@/lib/modules/groups/groups-types";
import type { Group } from "../../../generated/prisma/client";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Textfield } from "../ui/textfield";

type GroupFormDTO = z.infer<typeof MutateGroupSchema>;

interface GroupFormProps {
  user: { id: string };
  groupToBeEdited?: Group | null;
}

export function GroupForm({ user, groupToBeEdited }: GroupFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GroupFormDTO>({
    resolver: zodResolver(MutateGroupSchema),
    defaultValues: {
      id: groupToBeEdited?.id,
      name: groupToBeEdited?.name ?? "",
      description: groupToBeEdited?.description ?? undefined,
      createdBy: groupToBeEdited?.createdBy ?? user.id,
    },
  });

  const { execute, isExecuting, result } = useAction(mutateGroupAction);

  const onSubmit = (data: GroupFormDTO) =>
    execute({
      ...data,
      description: data.description?.trim() || undefined,
    });

  return (
    <form
      className="flex flex-col gap-4 my-2 p-4"
      onSubmit={handleSubmit(onSubmit)}
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
      <input type="hidden" {...register("createdBy")} />

      <Textfield
        type="text"
        label="Nome"
        error={errors.name?.message}
        {...register("name")}
      />

      <Textarea
        label="Descrição (opcional)"
        error={errors.description?.message}
        {...register("description", {
          setValueAs: (value) => (value?.trim() ? value : undefined),
        })}
      />

      <Button type="submit" isLoading={isExecuting} className="mt-4">
        {groupToBeEdited ? "Atualizar Grupo" : "Criar Grupo"}
      </Button>
    </form>
  );
}
