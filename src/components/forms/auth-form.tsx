"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { createSessionAction } from "@/lib/modules/sessions/sessions-actions";
import {
  type CreateSessionDTO,
  createSessionSchema,
} from "@/lib/modules/sessions/sessions-types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Textfield } from "../ui/textfield";

export const AuthForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSessionDTO>({
    resolver: zodResolver(createSessionSchema),
  });
  const { execute, isExecuting, result } = useAction(createSessionAction);

  return (
    <form className="flex flex-col gap-2 my-2" onSubmit={handleSubmit(execute)}>
      {result.serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error {result.serverError.code}</AlertTitle>
          <AlertDescription>{result.serverError.message}</AlertDescription>
        </Alert>
      )}
      <Textfield
        type="email"
        label="Email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Textfield
        type="password"
        label="Senha"
        error={errors.password?.message}
        {...register("password")}
      />
      <Button type="submit" isLoading={isExecuting} className="mt-4">
        Entrar
      </Button>
    </form>
  );
};
