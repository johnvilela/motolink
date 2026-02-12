"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createSessionAction } from "@/modules/sessions/sessions-actions";
import {
  type CreateSessionDTO,
  createSessionSchema,
} from "@/modules/sessions/sessions-types";

export function LoginForm() {
  const { execute, isExecuting, result } = useAction(createSessionAction);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSessionDTO>({
    resolver: zodResolver(createSessionSchema),
  });

  function onSubmit(data: CreateSessionDTO) {
    execute(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {result.data?.error && (
        <Alert variant="destructive">
          <AlertDescription>{result.data.error}</AlertDescription>
        </Alert>
      )}

      <Field>
        <FieldLabel htmlFor="email">E-mail</FieldLabel>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          {...register("email")}
        />
        <FieldError errors={[errors.email]} />
      </Field>

      <Field>
        <FieldLabel htmlFor="password">Senha</FieldLabel>
        <Input
          id="password"
          type="password"
          placeholder="Sua senha"
          {...register("password")}
        />
        <FieldError errors={[errors.password]} />
      </Field>

      <Button type="submit" isLoading={isExecuting} className="w-full">
        Entrar na conta
      </Button>
    </form>
  );
}
