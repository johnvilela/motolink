export function hasPermissions(
  user:
    | { role?: string | null; permissions?: string[] | null }
    | null
    | undefined,
  requiredPermissions: string[] = [],
): boolean {
  if (!user) return false;

  if (user.role === "ADMIN") return true;

  if (!requiredPermissions || requiredPermissions.length === 0) return true;

  const userPermissions = user.permissions ?? [];

  return requiredPermissions.every((p) => userPermissions.includes(p));
}
