import { userRoles } from "../modules/users/users-constants";

export const redirectByRole = (userRole: string) => {
  if (userRole === userRoles.ADMIN) {
    return "/app/admin/dashboard";
  }

  if (userRole === userRoles.USER) {
    return "/app/dashboard";
  }

  return "/app/dashboard";
};
