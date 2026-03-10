"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppLayoutActions } from "./app-layout-actions";
import { AppLayoutBranchSelector } from "./app-layout-branch-selector";

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface AppLayoutNavbarProps {
  user: { name: string; email: string };
  branches: Branch[];
  selectedBranch: Branch;
}

export function AppLayoutNavbar({ user, branches, selectedBranch }: AppLayoutNavbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b px-4">
      <SidebarTrigger />

      <AppLayoutBranchSelector branches={branches} selectedBranch={selectedBranch} className="md:hidden" />

      <AppLayoutActions user={user} />
    </header>
  );
}
