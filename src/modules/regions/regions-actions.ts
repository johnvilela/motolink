"use server";

import { revalidatePath } from "next/cache";

import { safeAction } from "@/lib/safe-action";
import { verifyActionSession } from "@/utils/verify-action-session";
import { regionsService } from "./regions-service";
import { regionFormSchema } from "./regions-types";

export const mutateRegionAction = safeAction.inputSchema(regionFormSchema).action(async ({ parsedInput }) => {
  const { userId, branchId } = await verifyActionSession({ requireBranch: true });

  const payload = {
    name: parsedInput.name,
    description: parsedInput.description,
    branchId,
  };

  if (parsedInput.id) {
    const result = await regionsService().update(parsedInput.id, payload, userId);

    if (result.isErr()) {
      return { error: result.error.reason };
    }

    revalidatePath("/gestao/regioes");
    revalidatePath(`/gestao/regioes/${parsedInput.id}`);
    return { success: true };
  }

  const result = await regionsService().create(payload, userId);

  if (result.isErr()) {
    return { error: result.error.reason };
  }

  revalidatePath("/gestao/regioes");
  return { success: true };
});

export async function deleteRegionAction(id: string) {
  const { userId } = await verifyActionSession();

  const result = await regionsService().delete(id, userId);

  if (result.isErr()) {
    return { error: result.error.reason };
  }

  revalidatePath("/gestao/regioes");
  return { success: true };
}
