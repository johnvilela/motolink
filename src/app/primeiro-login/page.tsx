"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Textfield } from "@/components/ui/textfield";
import { changePasswordSchema } from "@/lib/modules/users/user-types";
import { changePasswordAction } from "@/lib/modules/users/users-actions";

type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;

function ChangePasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordDTO>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      token,
    },
  });
  const { execute, isExecuting, result } = useAction(changePasswordAction);

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(execute)}>
      {result.serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro {result.serverError.code}</AlertTitle>
          <AlertDescription>{result.serverError.message}</AlertDescription>
        </Alert>
      )}
      <input type="hidden" {...register("token")} />
      <Textfield
        type="password"
        label="Nova Senha"
        error={errors.password?.message}
        {...register("password")}
      />
      <Textfield
        type="password"
        label="Repetir a Senha"
        error={errors.passwordConfirmation?.message}
        {...register("passwordConfirmation")}
      />
      <Button type="submit" isLoading={isExecuting} className="mt-4">
        Salvar Senha
      </Button>
    </form>
  );
}

export default function FirstLoginPage() {
  return (
    <main className="bg-background flex items-stretch h-screen overflow-hidden">
      <div className="flex flex-col justify-center items-center w-full lg:max-w-2xl overflow-y-auto bg-light-background">
        <div className="max-w-sm mx-auto w-full p-4">
          <Link href="/login">
            <Image
              src="/motolink.png"
              width={256}
              height={75}
              alt="Logo da Motolink"
              className="mx-auto mb-12"
            />
          </Link>
          <div className="text-center">
            <Heading variant="h2">Criar uma senha</Heading>
            <Text>Por favor, crie uma nova senha para sua conta.</Text>
          </div>

          <ChangePasswordForm />
        </div>
      </div>

      <div className="flex-1 relative hidden lg:block">
        <Image
          className="object-cover"
          src="/rio-de-janeiro.jpg"
          alt="Campo de Hóquei sobre grama"
          fill
        />
      </div>
    </main>
  );
}
