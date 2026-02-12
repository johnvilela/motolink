"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

interface NaoAutorizadoPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function NaoAutorizadoPage({
  searchParams,
}: NaoAutorizadoPageProps) {
  const params = await searchParams;

  const rawModule = params.moduleName;
  let moduleName = "module";

  if (typeof rawModule === "string" && rawModule.trim().length > 0) {
    moduleName = rawModule;
  } else if (
    Array.isArray(rawModule) &&
    rawModule[0]?.toString().trim().length
  ) {
    moduleName = String(rawModule[0]);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <AlertCircle className="size-10 text-destructive" />
      <Heading variant="h3">Sem permissão</Heading>
      <Text variant="muted" className="text-center">
        Você não tem permissão para acessar o módulo{" "}
        <span className="font-semibold">{moduleName}</span>.
      </Text>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Voltar</Link>
        </Button>
      </div>
    </div>
  );
}
