"use server";

import { revalidatePath } from "next/cache";

import { safeAction } from "@/lib/safe-action";
import { verifyActionSession } from "@/utils/verify-action-session";
import { clientBlocksService } from "./client-blocks-service";
import { clientBlockDeleteSchema, clientBlockMutateSchema } from "./client-blocks-types";

export const banDeliverymanAction = safeAction.inputSchema(clientBlockMutateSchema).action(async ({ parsedInput }) => {
  const { userId } = await verifyActionSession();

  const result = await clientBlocksService().ban(parsedInput, userId);

  if (result.isErr()) {
    return { error: result.error.reason };
  }

  revalidatePath("/operacional/monitoramento/diario");
  revalidatePath("/operacional/monitoramento/semanal");
  revalidatePath(`/gestao/entregadores/${parsedInput.deliverymanId}`);
  return { success: true };
});

export const unbanDeliverymanAction = safeAction
  .inputSchema(clientBlockDeleteSchema)
  .action(async ({ parsedInput }) => {
    const { userId } = await verifyActionSession();

    const result = await clientBlocksService().unban(parsedInput, userId);

    if (result.isErr()) {
      return { error: result.error.reason };
    }

    revalidatePath("/operacional/monitoramento/diario");
    revalidatePath("/operacional/monitoramento/semanal");
    revalidatePath(`/gestao/entregadores/${parsedInput.deliverymanId}`);
    return { success: true };
  });
