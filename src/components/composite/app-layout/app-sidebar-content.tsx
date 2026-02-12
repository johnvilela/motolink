"use client";

import { BookUser, ChevronDown, CirclePlus, Home, Target } from "lucide-react";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type SubItem = {
  title: string;
  url: string;
  requiredPermission?: string;
};

type MenuItem = {
  title: string;
  icon: React.ComponentType;
  requiredPermission?: string;
  items: SubItem[];
};

const menuItems: MenuItem[] = [
  {
    title: "Operacional",
    icon: Target,
    requiredPermission: "operational.view",
    items: [
      {
        title: "Planejamento",
        url: "/operacional/planejamento",
      },
      {
        title: "Monitoramento Diario",
        url: "/operacional/monitoramento/diario",
      },
      {
        title: "Monitoramento Semanal",
        url: "/operacional/monitoramento/semanal",
      },
    ],
  },
  {
    title: "Gestão",
    icon: CirclePlus,
    items: [
      {
        title: "Clientes",
        url: "/gestao/clientes",
        requiredPermission: "client.view",
      },
      {
        title: "Entregadores",
        url: "/gestao/entregadores",
        requiredPermission: "deliveryman.view",
      },
      {
        title: "Grupos",
        url: "/gestao/grupos",
        requiredPermission: "group.view",
      },
      {
        title: "Regiões",
        url: "/gestao/regioesC",
        requiredPermission: "region.view",
      },
      {
        title: "Colaboradores",
        url: "/gestao/colaboradores",
      },
    ],
  },
  // {
  //   title: "Financeiro",
  //   icon: Landmark,
  //   requiredPermission: "financial.view",
  //   items: [
  //     {
  //       title: "Resumo",
  //       url: "/financeiro",
  //     },
  //     {
  //       title: "Solicitação de Pagamento",
  //       url: "/financeiro/solicitacao-pagamento",
  //     },
  //   ],
  // },
];

export function AppSidebarContent() {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard">
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {menuItems.map((item) => (
              <Collapsible key={item.title} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <item.icon />
                      <span>{item.title}</span>
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
