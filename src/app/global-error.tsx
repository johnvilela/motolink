"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen items-center justify-center bg-background p-4 font-sans text-foreground antialiased">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <TriangleAlert className="size-6 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">Algo deu errado</h2>
            <p className="text-sm text-muted-foreground">
              Ocorreu um erro inesperado no sistema. Tente novamente ou entre em contato com o suporte caso o problema
              persista.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
          >
            <RotateCcw className="size-4" />
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
