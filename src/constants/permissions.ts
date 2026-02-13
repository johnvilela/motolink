export const permissionsConst = [
  {
    role: "ADMIN",
    permissions: [],
  },
  {
    role: "MANAGER",
    permissions: [
      "users.view",
      "users.create",
      "users.edit",
      "users.delete",
      "groups.view",
      "groups.create",
      "groups.edit",
      "groups.delete",
      "regions.view",
      "regions.create",
      "regions.edit",
      "regions.delete",
      "deliverymen.view",
      "deliverymen.create",
      "deliverymen.edit",
      "deliverymen.delete",
    ],
  },
];

export const PERMISSION_MODULES = [
  { key: "users", label: "Colaboradores" },
  { key: "branches", label: "Filiais" },
  { key: "groups", label: "Grupos" },
  { key: "regions", label: "Regioes" },
  { key: "deliverymen", label: "Entregadores" },
] as const;

export const PERMISSION_ACTIONS = [
  { key: "view", label: "Visualizar" },
  { key: "create", label: "Criar" },
  { key: "edit", label: "Editar" },
  { key: "delete", label: "Excluir" },
] as const;

export type PermissionModuleKey = (typeof PERMISSION_MODULES)[number]["key"];
export type PermissionActionKey = (typeof PERMISSION_ACTIONS)[number]["key"];

export const buildPermissionKey = (
  module: PermissionModuleKey,
  action: PermissionActionKey,
) => `${module}.${action}`;
