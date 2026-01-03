"use client";

import { useAction } from "next-safe-action/hooks";
import { deleteSessionAction } from "@/lib/modules/sessions/sessions-actions";

export default function DashboardPage() {
  const { execute, isExecuting } = useAction(deleteSessionAction);

  return (
    <main>
      <h1>Dashboard</h1>
      <button type="button" disabled={isExecuting} onClick={() => execute()}>
        {isExecuting ? "Saindo..." : "Sair"}
      </button>
    </main>
  );
}
