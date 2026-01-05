"use client";

import { ChevronsUpDown, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BRANCHS } from "@/lib/constants/app";
import { setCurrentBranch } from "@/lib/modules/branch/branch-actions";
import type { GetBytokenResponse } from "@/lib/modules/sessions/sessions-service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../sidebar";

type User = GetBytokenResponse["user"] | null | undefined;

interface AppSidebarHeaderProps {
  currentBranch?: string;
  user?: User;
}

export function AppSidebarHeader({
  currentBranch = "RJ",
  user,
}: AppSidebarHeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedBranch, setSelectedBranch] = useState(currentBranch);
  const currentBranchName =
    BRANCHS[selectedBranch as keyof typeof BRANCHS] || "Rio de Janeiro";

  // Filter branches based on user role and permissions
  const availableBranches = Object.entries(BRANCHS).filter(([key]) => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    return user.branchs?.includes(key);
  });

  const handleBranchChange = async (branch: string) => {
    setSelectedBranch(branch);
    startTransition(async () => {
      await setCurrentBranch(branch);
      router.refresh();
    });
  };

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <MapPin className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Motolink</span>
                  <span id="current_branch" className="truncate text-xs">
                    {currentBranchName}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width)"
              align="start"
            >
              {availableBranches.map(([key, value]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => handleBranchChange(key)}
                  disabled={isPending}
                >
                  <MapPin className="size-4" />
                  <span>{value}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
