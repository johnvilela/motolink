"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cookieNames } from "@/lib/constants/cookie-names";
import { actionClient } from "@/lib/services/safe-action";
import { AppError } from "@/lib/utils/app-error";
import { usersService } from "./user-service";
import { changePasswordSchema, MutateUserSchema } from "./user-types";

export async function getUserLogged() {
  const cookiesStore = await cookies();
  const userId = cookiesStore.get(cookieNames.USER_ID)?.value;

  if (!userId) {
    redirect("/");
  }

  const user = await usersService().getById(userId);
  return user;
}

export const changePasswordAction = actionClient
  .inputSchema(changePasswordSchema)
  .action(async ({ clientInput: { password, token } }) => {
    if (!token) {
      throw new AppError("Acesso não autorizado.", 401);
    }

    await usersService().changePassword(token, password);

    return redirect("/app/dashboard");
  });

export const mutateUserAction = actionClient
  .inputSchema(MutateUserSchema)
  .action(async ({ clientInput }) => {
    if (clientInput.id) {
      await usersService().update(clientInput.id, clientInput);
    } else {
      await usersService().create(clientInput);
    }

    return redirect("/app/colaboradores");
  });

export const deleteUserAction = actionClient
  .inputSchema(MutateUserSchema.pick({ id: true }))
  .action(async ({ clientInput: { id } }) => {
    await usersService().delete(id!);

    return redirect("/app/colaboradores");
  });
