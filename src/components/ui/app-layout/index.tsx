import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cookieNames } from "@/lib/constants/cookie-names";
import { sessionsService } from "@/lib/modules/sessions/sessions-service";
import { AppSidebar } from "./app-sidebar";

interface AppLayoutWrapperProps {
  children: ReactNode;
}

export async function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieNames.SESSION_TOKEN)?.value;

  const session = token
    ? await sessionsService()
        .getByToken(token)
        .catch(() => null)
    : null;

  return (
    <SidebarProvider>
      <AppSidebar user={session?.user} />
      <SidebarInset className="p-4">{children}</SidebarInset>
    </SidebarProvider>
  );
}
