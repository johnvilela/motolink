"use client";

import { CheckIcon, ChevronsUpDownIcon, MapPin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cookieConst } from "@/constants/cookies";
import { setClientCookie } from "@/utils/client-cookie";

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface AppLayoutBranchSelectorProps {
  branches: Branch[];
  selectedBranch: Branch;
  className?: string;
}

function handleBranchChange(branchId: string) {
  setClientCookie(cookieConst.SELECTED_BRANCH, branchId, { maxAge: 60 * 60 * 24 * 365 });
  window.location.reload();
}

export function AppLayoutBranchSelector({ branches, selectedBranch, className }: AppLayoutBranchSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`${className} flex items-center gap-2`}>
        <div className="hidden items-center gap-3 md:flex w-full">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <MapPin className="size-4" />
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="text-sm leading-none font-medium">{selectedBranch.name}</span>
            <span className="text-xs text-muted-foreground">{selectedBranch.code}</span>
          </div>
        </div>
        <span className="truncate text-sm font-medium md:hidden">{selectedBranch.name}</span>

        <ChevronsUpDownIcon className="size-4 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-60">
        <DropdownMenuLabel>Filiais</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {branches.map((branch) => (
          <DropdownMenuItem key={branch.id} onClick={() => handleBranchChange(branch.id)}>
            {branch.name}
            {branch.id === selectedBranch.id && <CheckIcon className="ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
