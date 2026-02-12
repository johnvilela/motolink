"use client";

import { Button } from "@/components/ui/button";
import { deleteSessionAction } from "@/modules/sessions/sessions-actions";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Button variant="destructive" onClick={() => deleteSessionAction()}>
        Sair da conta
      </Button>
    </div>
  );
}
