import {
  Bell,
  ChevronRight,
  Handshake,
  Landmark,
  LayoutDashboard,
  MapPin,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import type { GetBytokenResponse } from "@/lib/modules/sessions/sessions-service";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../sidebar";
import { AppFooter } from "./app-footer";

type User = GetBytokenResponse["user"] | null | undefined;

const items = [
  {
    title: "Operacional",
    isActive: false,
    icon: Target,
    requiredPermission: "manager.view",
    items: [
      {
        title: "Dashboard",
        url: "/operacional",
      },
      {
        title: "Planejamento",
        url: "/operacional/planejamento",
      },
      {
        title: "Monitoramento",
        url: "/operacional/monitoramento",
      },
    ],
  },
  {
    title: "Financeiro",
    isActive: false,
    icon: Landmark,
    requiredPermission: "financial.view",
    items: [
      {
        title: "Resumo",
        url: "/financeiro",
      },
      {
        title: "Solicitação de Pagamento",
        url: "/financeiro/solicitacao-pagamento",
      },
    ],
  },
  {
    title: "Comercial",
    isActive: false,
    icon: Handshake,
    requiredPermission: "commercial.view",
    items: [
      {
        title: "Captações",
        url: "/comercial/captacoes",
      },
      {
        title: "Clientes",
        url: "/comercial/clientes",
      },
    ],
  },
];

export function AppSidebar({
  user,
  ...props
}: ComponentProps<typeof Sidebar> & { user?: User }) {
  const canAccess = (requiredPermission?: string) => {
    if (!requiredPermission) {
      return true;
    }

    if (!user) {
      return false;
    }

    return checkUserPermissions(user, [requiredPermission]);
  };

  const accessibleItems = items.filter((item) =>
    canAccess(item.requiredPermission),
  );

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <MapPin className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Motolink</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenuButton asChild tooltip="Dashboard">
            <Link href="/app/dashboard">
              <LayoutDashboard />
              <span>Dashboard</span>
            </Link>
          </SidebarMenuButton>
          <SidebarMenuButton asChild tooltip="Notificações">
            <Link href="/app/notificacoes">
              <Bell />
              <span>Notificações</span>
            </Link>
          </SidebarMenuButton>
          {canAccess("employee.view") ? (
            <SidebarMenuButton asChild tooltip="Colaboradores">
              <Link href="/app/colaboradores">
                <Users />
                <span>Colaboradores</span>
              </Link>
            </SidebarMenuButton>
          ) : null}
        </SidebarGroup>
        {accessibleItems.length ? (
          <SidebarGroup>
            <SidebarGroupLabel>Modulos</SidebarGroupLabel>
            <SidebarMenu>
              {accessibleItems.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <div>
                        <item.icon />
                        <span>{item.title}</span>
                      </div>
                    </SidebarMenuButton>
                    {item.items?.length ? (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction className="data-[state=open]:rotate-90">
                            <ChevronRight />
                            <span className="sr-only">Toggle</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <Link href={`/app${subItem.url}`}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : null}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarFooter>
        <AppFooter user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
