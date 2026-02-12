import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { branchesService } from "@/modules/branches/branches-service";
import { getCurrentUser } from "@/modules/users/users-queries";
import { AppSidebarContent } from "./app-sidebar-content";
import { AppSidebarFooter } from "./app-sidebar-footer";
import { AppSidebarHeader } from "./app-sidebar-header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export async function AppLayout({ children }: AppLayoutProps) {
  const user = await getCurrentUser();

  const branches = await branchesService().getByIds(user?.branches || []);

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <AppSidebarHeader branches={branches} />
        <AppSidebarContent />
        <AppSidebarFooter user={user} />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
