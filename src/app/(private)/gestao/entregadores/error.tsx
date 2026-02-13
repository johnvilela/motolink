"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

interface ErrorProps {
  reset: () => void;
}

export default function EntregadoresError({ reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <AlertCircle className="size-10 text-destructive" />
      <Heading variant="h3">Algo deu errado</Heading>
      <Text variant="muted" className="text-center">
        Ocorreu um erro ao carregar os dados. Tente novamente ou volte para a
        lista de entregadores.
      </Text>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          <RotateCcw />
          Tentar novamente
        </Button>
        <Button asChild>
          <Link href="/gestao/entregadores">Voltar para lista</Link>
        </Button>
      </div>
    </div>
  );
}
