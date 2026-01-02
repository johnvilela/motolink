import { UserTypes } from "../constants/user-types";

export const redirectByRole = (userRole: string) => {
  if (userRole === UserTypes.ADMIN) {
    return "/app/admin/dashboard";
  }

  if (userRole === UserTypes.HR) {
    return "/app/hr";
  }

  if (userRole === UserTypes.USER) {
    return "/app/dashboard";
  }

  return "/app/desconhecido";
};
