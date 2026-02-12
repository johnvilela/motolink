"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { cookieConst } from "@/constants/cookies";
import { safeAction } from "@/lib/safe-action";
import { AppError } from "@/utils/app-error";
import { groupsService } from "./groups-service";
import { groupMutateSchema } from "./groups-types";

async function getLoggedUserId() {
  const store = await cookies();
  return store.get(cookieConst.USER_ID)?.value ?? "";
}

export const mutateGroupAction = safeAction
  .inputSchema(groupMutateSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...data } = parsedInput;
    const loggedUserId = await getLoggedUserId();

    const result = id
      ? await groupsService().update(id, data, loggedUserId)
      : await groupsService().create(data, loggedUserId);

    if (result instanceof AppError) {
      return { error: result.message };
    }

    revalidatePath("/gestao/grupos");
    if (id) {
      revalidatePath(`/gestao/grupos/${id}`);
    }

    return { success: true, data: result };
  });

export async function deleteGroupAction(groupId: string) {
  const loggedUserId = await getLoggedUserId();
  const result = await groupsService().delete(groupId, loggedUserId);

  if (result instanceof AppError) {
    return { error: result.message };
  }

  revalidatePath("/gestao/grupos");

  return { success: true } as const;
}
