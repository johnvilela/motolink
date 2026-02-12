"use client";

import { ChevronsUpDown, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cookieConst } from "@/constants/cookies";
import type { Branch } from "../../../../generated/prisma/client";

interface AppSidebarHeaderProps {
  branches: Branch[];
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, maxAge = 31536000) {
  // biome-ignore lint/suspicious/noDocumentCookie: Intentional direct cookie write for simple storage
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
}

export function AppSidebarHeader({ branches }: AppSidebarHeaderProps) {
  const router = useRouter();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  useEffect(() => {
    if (branches.length === 0) return;

    const savedBranchId = getCookie(cookieConst.SELECTED_BRANCH);

    if (savedBranchId) {
      const branch = branches.find((b) => b.id === savedBranchId);
      if (branch) {
        setSelectedBranch(branch);
        return;
      }
    }
    setSelectedBranch(branches[0]);
  }, [branches]);

  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    setCookie(cookieConst.SELECTED_BRANCH, branch.id);
    router.refresh();
  };

  if (branches.length === 0) {
    return (
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" disabled>
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <MapPin className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-muted-foreground">
                  Nenhuma filial atribuída
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
    );
  }

  if (!selectedBranch) {
    return null;
  }

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
                  <span className="truncate font-medium">
                    {selectedBranch.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {selectedBranch.code}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side="bottom"
              sideOffset={4}
            >
              {branches.map((branch) => (
                <DropdownMenuItem
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch)}
                >
                  {branch.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
