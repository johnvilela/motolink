import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
          <FileQuestion className="size-6 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <h2 className="text-xl font-semibold tracking-tight">Página não encontrada</h2>
          <p className="text-sm text-muted-foreground">A página que você está procurando não existe ou foi removida.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">Voltar ao início</Link>
        </Button>
      </div>
    </main>
  );
}
