"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { cookieConst } from "@/constants/cookies";
import { safeAction } from "@/lib/safe-action";
import { AppError } from "@/utils/app-error";
import { clientsService } from "./clients-service";
import { clientMutateSchema } from "./clients-types";

async function getLoggedUserId() {
  const store = await cookies();
  return store.get(cookieConst.USER_ID)?.value ?? "";
}

async function getBranchId() {
  const store = await cookies();
  return store.get(cookieConst.SELECTED_BRANCH)?.value ?? "";
}

export const mutateClientAction = safeAction
  .inputSchema(clientMutateSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...data } = parsedInput;
    const loggedUserId = await getLoggedUserId();
    const branchId = await getBranchId();

    const result = id
      ? await clientsService().update(id, { ...data, branchId }, loggedUserId)
      : await clientsService().create({ ...data, branchId }, loggedUserId);

    if (result instanceof AppError) {
      return { error: result.message };
    }

    revalidatePath("/gestao/clientes");
    if (id) {
      revalidatePath(`/gestao/clientes/${id}`);
    }

    return { success: true, data: result };
  });

export async function deleteClientAction(clientId: string) {
  const loggedUserId = await getLoggedUserId();
  const result = await clientsService().delete(clientId, loggedUserId);

  if (result instanceof AppError) {
    return { error: result.message };
  }

  revalidatePath("/gestao/clientes");

  return { success: true } as const;
}
