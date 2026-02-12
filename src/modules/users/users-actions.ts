"use server";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { cookieConst } from "@/constants/cookies";
import { safeAction } from "@/lib/safe-action";
import { AppError } from "@/utils/app-error";
import { cleanMask } from "@/utils/masks/clean-mask";
import { usersService } from "./users-service";
import { userMutateSchema } from "./users-types";

dayjs.extend(customParseFormat);

async function getLoggedUserId() {
  const store = await cookies();
  return store.get(cookieConst.USER_ID)?.value ?? "";
}

export const mutateUserAction = safeAction
  .inputSchema(userMutateSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...data } = parsedInput;
    const loggedUserId = await getLoggedUserId();

    const transformedData = {
      name: data.name,
      email: data.email,
      phone: data.phone ? cleanMask(data.phone) : undefined,
      document: data.document ? cleanMask(data.document) : undefined,
      birthDate: data.birthDate
        ? dayjs(data.birthDate, "DD/MM/YYYY").toISOString()
        : undefined,
      branches: data.branches,
      role: data.role,
      permissions: data.permissions,
    };

    const result = id
      ? await usersService().update(id, transformedData, loggedUserId)
      : await usersService().create(transformedData, loggedUserId);

    if (result instanceof AppError) {
      return { error: result.message };
    }

    revalidatePath("/gestao/colaboradores");
    if (id) {
      revalidatePath(`/gestao/colaboradores/${id}`);
    }

    return { success: true, data: result };
  });

export async function deleteUserAction(userId: string) {
  const loggedUserId = await getLoggedUserId();
  const result = await usersService().delete(userId, loggedUserId);

  if (result instanceof AppError) {
    return { error: result.message };
  }

  revalidatePath("/gestao/colaboradores");

  return { success: true } as const;
}
