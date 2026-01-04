"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { deleteSessionAction } from "@/lib/modules/sessions/sessions-actions";
import type { GetBytokenResponse } from "@/lib/modules/sessions/sessions-service";
import { Avatar, AvatarFallback } from "../avatar";
import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../sidebar";

type User = GetBytokenResponse["user"] | null | undefined;

export function AppFooter({ user }: { user?: User }) {
  const { isMobile } = useSidebar();
  const { execute: logout, isExecuting } = useAction(deleteSessionAction);

  const userName = user?.name ?? "Guest";
  const userEmail = user?.email ?? "";
  const userInitials =
    userName === "Guest"
      ? "G"
      : userName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userName}</span>
                <span className="truncate text-xs">{userEmail}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem asChild>
              <Button
                type="button"
                variant="ghost"
                onClick={() => logout()}
                isLoading={isExecuting}
              >
                <LogOut />
                Sair da conta
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
