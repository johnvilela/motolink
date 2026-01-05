"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { mutateRegionAction } from "@/lib/modules/regions/regions-actions";
import {
  type MutateRegionDTO,
  MutateRegionSchema,
} from "@/lib/modules/regions/regions-types";
import type { Region } from "../../../generated/prisma/client";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Textfield } from "../ui/textfield";

interface RegionFormProps {
  regionToBeEdited?: Region | null;
}

export function RegionForm({ regionToBeEdited }: RegionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<MutateRegionDTO, "createdBy" | "branch">>({
    resolver: zodResolver(
      MutateRegionSchema.omit({ createdBy: true, branch: true }),
    ),
    defaultValues: {
      id: regionToBeEdited?.id,
      name: regionToBeEdited?.name ?? "",
      description: regionToBeEdited?.description ?? "",
    },
  });

  const { execute, isExecuting, result } = useAction(mutateRegionAction);

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

      <Textfield
        type="text"
        label="Nome"
        error={errors.name?.message}
        {...register("name")}
      />

      <Textarea
        label="Descrição"
        error={errors.description?.message}
        {...register("description", {
          setValueAs: (value) => value?.trim() ?? "",
        })}
      />

      <Button type="submit" isLoading={isExecuting} className="mt-4">
        {regionToBeEdited ? "Atualizar Região" : "Criar Região"}
      </Button>
    </form>
  );
}
