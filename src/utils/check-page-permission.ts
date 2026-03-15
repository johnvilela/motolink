import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cookieConst } from "@/constants/cookies";
import { usersService } from "@/modules/users/users-service";
import { hasPermission } from "@/utils/has-permission";

export async function checkPagePermission(permission: string): Promise<boolean> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(cookieConst.USER_ID)?.value;
  if (!userId) redirect("/login");
  const userResult = await usersService().getById(userId);
  if (userResult.isErr() || !userResult.value) redirect("/login");
  return hasPermission(userResult.value, permission);
}
