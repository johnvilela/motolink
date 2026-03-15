"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { newPasswordAction } from "@/modules/users/users-actions";
import { type NewPasswordFormSchema, newPasswordFormSchema } from "@/modules/users/users-types";

interface NewPasswordFormProps {
  token: string;
  userId: string;
}

function NewPasswordForm({ token, userId }: NewPasswordFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordFormSchema>({
    resolver: zodResolver(newPasswordFormSchema),
    defaultValues: {
      token,
      userId,
    },
  });

  const { execute, isExecuting } = useAction(newPasswordAction, {
    onSuccess: ({ data }) => {
      if (data?.error) {
        setServerError(data.error);
        toast.error(data.error);
        return;
      }

      if (data?.success) {
        toast.success("Senha criada com sucesso!");
        router.push("/login");
      }
    },
    onError: () => {
      setServerError("Ocorreu um erro inesperado.");
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => execute(data))} className="flex flex-col gap-6">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Field data-invalid={!!errors.password}>
        <FieldLabel htmlFor="password">Nova senha</FieldLabel>
        <Input id="password" type="password" placeholder="********" {...register("password")} />
        <FieldError errors={[errors.password]} />
      </Field>

      <Field data-invalid={!!errors.confirmPassword}>
        <FieldLabel htmlFor="confirmPassword">Confirmar senha</FieldLabel>
        <Input id="confirmPassword" type="password" placeholder="********" {...register("confirmPassword")} />
        <FieldError errors={[errors.confirmPassword]} />
      </Field>

      <Button type="submit" isLoading={isExecuting}>
        Criar senha
      </Button>
    </form>
  );
}

export { NewPasswordForm };
