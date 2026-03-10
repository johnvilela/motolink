import { CirclePlus, Home, Target } from "lucide-react";

export const navigationItems = [
  {
    title: "Dashboard",
    icon: Home,
    url: "/dashboard",
  },
  {
    title: "Operacional",
    icon: Target,
    items: [
      {
        title: "Planejamento",
        url: "/operacional/planejamento",
        requiredPermission: [],
      },
      {
        title: "Monitoramento Diario",
        url: "/operacional/monitoramento/diario",
        requiredPermission: [],
      },
      {
        title: "Monitoramento Semanal",
        url: "/operacional/monitoramento/semanal",
        requiredPermission: [],
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
        requiredPermission: [],
      },
      {
        title: "Entregadores",
        url: "/gestao/entregadores",
        requiredPermission: [],
      },
      {
        title: "Grupos",
        url: "/gestao/grupos",
        requiredPermission: [],
      },
      {
        title: "Regiões",
        url: "/gestao/regioes",
        requiredPermission: [],
      },
      {
        title: "Colaboradores",
        url: "/gestao/colaboradores",
        requiredPermission: [],
      },
    ],
  },
];
