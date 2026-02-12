"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { cookieConst } from "@/constants/cookies";
import { safeAction } from "@/lib/safe-action";
import { AppError } from "@/utils/app-error";
import { deliverymanService } from "./deliveryman-service";
import { deliverymanMutateSchema } from "./deliveryman-types";

async function getLoggedUserId() {
  const store = await cookies();
  return store.get(cookieConst.USER_ID)?.value ?? "";
}

async function getBranchId() {
  const store = await cookies();
  return store.get(cookieConst.SELECTED_BRANCH)?.value ?? "";
}

export const mutateDeliverymanAction = safeAction
  .inputSchema(deliverymanMutateSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...data } = parsedInput;
    const loggedUserId = await getLoggedUserId();
    const branchId = await getBranchId();

    const result = id
      ? await deliverymanService().update(
          id,
          { ...data, branchId },
          loggedUserId,
        )
      : await deliverymanService().create({ ...data, branchId }, loggedUserId);

    if (result instanceof AppError) {
      return { error: result.message };
    }

    revalidatePath("/gestao/entregadores");
    if (id) {
      revalidatePath(`/gestao/entregadores/${id}`);
    }

    return { success: true, data: result };
  });

export async function deleteDeliverymanAction(deliverymanId: string) {
  const loggedUserId = await getLoggedUserId();
  const result = await deliverymanService().delete(deliverymanId, loggedUserId);

  if (result instanceof AppError) {
    return { error: result.message };
  }

  revalidatePath("/gestao/entregadores");

  return { success: true } as const;
}

export async function toggleDeliverymanAction(deliverymanId: string) {
  const loggedUserId = await getLoggedUserId();
  const result = await deliverymanService().toggleBlock(
    deliverymanId,
    loggedUserId,
  );

  if (result instanceof AppError) {
    return { error: result.message };
  }

  revalidatePath("/gestao/entregadores");
  revalidatePath(`/gestao/entregadores/${deliverymanId}`);

  return { success: true, data: result };
}
