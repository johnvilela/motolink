type UserWithPermissions = {
  role: string;
  permissions: string[];
};

export function hasPermission(user: UserWithPermissions, permission: string): boolean {
  if (user.role === "ADMIN") return true;
  return user.permissions.includes(permission);
}
