import { userRoles } from "../modules/users/users-constants";

type UserWithPermissions = {
  role: string;
  permissions?: string[] | null;
};

export const checkUserPermissions = (
  user: UserWithPermissions,
  requiredPermissions: string[],
): boolean => {
  if (user.role === userRoles.ADMIN) {
    return true;
  }

  if (!requiredPermissions.length) {
    return true;
  }

  const userPermissions = user.permissions ?? [];

  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission),
  );
};
