import { cookies } from "next/headers";
import { cookieConst } from "@/constants/cookies";
import { usersService } from "./users-service";

export async function getCurrentUser() {
  const store = await cookies();
  const userIdCookie = store.get(cookieConst.USER_ID);

  if (!userIdCookie) return null;

  return usersService().getById(userIdCookie?.value);
}
