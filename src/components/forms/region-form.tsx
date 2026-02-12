"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { mutateRegionAction } from "@/modules/regions/regions-actions";
import {
  type RegionMutateInput,
  regionMutateSchema,
} from "@/modules/regions/regions-types";

interface RegionFormProps {
  defaultValues?: Partial<RegionMutateInput>;
  isEditing?: boolean;
  redirectTo?: string;
}

export function RegionForm({
  defaultValues,
  isEditing = false,
  redirectTo,
}: RegionFormProps) {
  const router = useRouter();
  const { execute, isExecuting, result } = useAction(mutateRegionAction);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegionMutateInput>({
    resolver: zodResolver(regionMutateSchema),
    defaultValues: {
      id: defaultValues?.id,
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
    },
  });

  useEffect(() => {
    if (result.data?.success) {
      toast.success(isEditing ? "Região atualizada." : "Região criada.");
      if (redirectTo) {
        router.push(redirectTo);
      }
      return;
    }

    if (result.data?.error) {
      toast.error(result.data.error);
    }
  }, [result, isEditing, redirectTo, router]);

  function onSubmit(data: RegionMutateInput) {
    execute(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Nome</FieldLabel>
          <Input
            id="name"
            placeholder="Nome da região"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">Descrição</FieldLabel>
          <Textarea
            id="description"
            placeholder="Descrição da região (opcional)"
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          <FieldError errors={[errors.description]} />
        </Field>
      </FieldGroup>

      <div className="flex md:justify-end">
        <Button
          type="submit"
          isLoading={isExecuting}
          className="w-full md:w-auto"
        >
          {isEditing ? "Salvar Alterações" : "Criar Região"}
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
