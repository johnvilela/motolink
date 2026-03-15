import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cookieConst } from "@/constants/cookies";
import { branchesService } from "@/modules/branches/branches-service";
import { usersService } from "@/modules/users/users-service";
import { AppLayoutNavbar } from "./app-layout-navbar";
import { AppLayoutSidebar } from "./app-layout-sidebar";

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get(cookieConst.USER_ID)?.value;
  const selectedBranchId = cookieStore.get(cookieConst.SELECTED_BRANCH)?.value;

  if (!userId) {
    redirect("/login");
  }

  const userResult = await usersService().getById(userId);

  if (userResult.isErr() || !userResult.value) {
    redirect("/login");
  }

  const user = userResult.value;

  const branchesResult = await branchesService().listAll({ page: 1, pageSize: 100 });

  const allBranches = branchesResult.isOk() ? branchesResult.value.data : [];
  const userBranches = allBranches
    .filter((branch) => user.branches.includes(branch.id))
    .map((branch) => ({ id: branch.id, name: branch.name, code: branch.code }));

  const selectedBranch = userBranches.find((branch) => branch.id === selectedBranchId) ?? userBranches[0];

  if (!selectedBranch) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppLayoutSidebar
        branches={userBranches}
        selectedBranch={selectedBranch}
        user={{ role: user.role, permissions: user.permissions }}
      />
      <SidebarInset>
        <AppLayoutNavbar
          user={{ name: user.name, email: user.email }}
          branches={userBranches}
          selectedBranch={selectedBranch}
        />
        <div className="flex-1 p-4 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
