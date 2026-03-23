"use server";

import { revalidatePath } from "next/cache";

import { safeAction } from "@/lib/safe-action";
import { verifyActionSession } from "@/utils/verify-action-session";
import { groupsService } from "./groups-service";
import { groupFormSchema } from "./groups-types";

export const mutateGroupAction = safeAction.inputSchema(groupFormSchema).action(async ({ parsedInput }) => {
  const { userId, branchId } = await verifyActionSession({ requireBranch: true });

  const payload = {
    name: parsedInput.name,
    description: parsedInput.description,
    branchId,
  };

  if (parsedInput.id) {
    const result = await groupsService().update(parsedInput.id, payload, userId);

    if (result.isErr()) {
      return { error: result.error.reason };
    }

    revalidatePath("/gestao/grupos");
    revalidatePath(`/gestao/grupos/${parsedInput.id}`);
    return { success: true };
  }

  const result = await groupsService().create(payload, userId);

  if (result.isErr()) {
    return { error: result.error.reason };
  }

  revalidatePath("/gestao/grupos");
  return { success: true };
});

export async function deleteGroupAction(id: string) {
  const { userId } = await verifyActionSession();

  const result = await groupsService().delete(id, userId);

  if (result.isErr()) {
    return { error: result.error.reason };
  }

  revalidatePath("/gestao/grupos");
  return { success: true };
}
