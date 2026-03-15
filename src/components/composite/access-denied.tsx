import { ShieldAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AccessDenied() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 py-6">
      <Alert variant="destructive">
        <ShieldAlertIcon />
        <AlertTitle>Acesso negado</AlertTitle>
        <AlertDescription>Você não tem permissão para acessar esta página.</AlertDescription>
      </Alert>
    </main>
  );
}
