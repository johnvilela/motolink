export const permissionsConst = [
  {
    role: "ADMIN",
    permissions: [
      "users.view",
      "users.create",
      "users.edit",
      "users.delete",
      "branches.view",
      "branches.create",
      "branches.edit",
      "branches.delete",
    ],
  },
  {
    role: "MANAGER",
    permissions: ["users.view", "users.create", "users.edit", "users.delete"],
  },
];

export const PERMISSION_MODULES = [
  { key: "users", label: "Colaboradores" },
  { key: "branches", label: "Filiais" },
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
