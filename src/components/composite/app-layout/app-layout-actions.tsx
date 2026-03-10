"use client";

import { LogOutIcon } from "lucide-react";
import { useTransition } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteSessionAction } from "@/modules/sessions/sessions-actions";

interface AppLayoutActionsProps {
  user: { name: string; email: string };
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function AppLayoutActions({ user }: AppLayoutActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await deleteSessionAction();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2">
          <Avatar size="sm">
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="hidden flex-col items-start text-left md:flex">
            <span className="text-sm leading-none font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem variant="destructive" onClick={handleLogout} disabled={isPending}>
          <LogOutIcon />
          Sair da conta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
