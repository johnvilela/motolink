"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { cookieConst } from "@/constants/cookies";
import { safeAction } from "@/lib/safe-action";
import { AppError } from "@/utils/app-error";
import { regionsService } from "./regions-service";
import { regionMutateSchema } from "./regions-types";

async function getLoggedUserId() {
  const store = await cookies();
  return store.get(cookieConst.USER_ID)?.value ?? "";
}

async function getBranchId() {
  const store = await cookies();
  return store.get(cookieConst.SELECTED_BRANCH)?.value ?? "";
}

export const mutateRegionAction = safeAction
  .inputSchema(regionMutateSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...data } = parsedInput;
    const loggedUserId = await getLoggedUserId();
    const branchId = await getBranchId();

    const result = id
      ? await regionsService().update(id, { ...data, branchId }, loggedUserId)
      : await regionsService().create({ ...data, branchId }, loggedUserId);

    if (result instanceof AppError) {
      return { error: result.message };
    }

    revalidatePath("/gestao/regioes");
    if (id) {
      revalidatePath(`/gestao/regioes/${id}`);
    }

    return { success: true, data: result };
  });

export async function deleteRegionAction(regionId: string) {
  const loggedUserId = await getLoggedUserId();
  const result = await regionsService().delete(regionId, loggedUserId);

  if (result instanceof AppError) {
    return { error: result.message };
  }

  revalidatePath("/gestao/regioes");

  return { success: true } as const;
}
