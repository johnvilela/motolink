"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function OperacionalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex items-center justify-center py-20">
      <div className="w-full max-w-md space-y-4">
        <Alert variant="destructive">
          <TriangleAlert className="size-4" />
          <AlertTitle>Erro no operacional</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os dados operacionais. Tente novamente ou entre em contato com o suporte.
          </AlertDescription>
        </Alert>
        <Button onClick={reset} variant="outline" className="w-full">
          <RotateCcw className="size-4" />
          Tentar novamente
        </Button>
      </div>
    </main>
  );
}
