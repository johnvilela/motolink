"use server";

import { revalidatePath } from "next/cache";

import { safeAction } from "@/lib/safe-action";
import { cleanMask } from "@/utils/masks/clean-mask";
import { verifyActionSession } from "@/utils/verify-action-session";
import { deliverymenService } from "./deliverymen-service";
import { deliverymanFormSchema } from "./deliverymen-types";

function normalizeOptional(value?: string) {
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export const mutateDeliverymanAction = safeAction.inputSchema(deliverymanFormSchema).action(async ({ parsedInput }) => {
  const { userId, branchId } = await verifyActionSession({ requireBranch: true });

  const payload = {
    name: parsedInput.name.trim(),
    document: cleanMask(parsedInput.document),
    phone: cleanMask(parsedInput.phone),
    contractType: parsedInput.contractType,
    mainPixKey: parsedInput.mainPixKey.trim(),
    secondPixKey: normalizeOptional(parsedInput.secondPixKey),
    thridPixKey: normalizeOptional(parsedInput.thridPixKey),
    agency: normalizeOptional(parsedInput.agency),
    account: normalizeOptional(parsedInput.account),
    vehicleModel: normalizeOptional(parsedInput.vehicleModel),
    vehiclePlate: normalizeOptional(parsedInput.vehiclePlate),
    vehicleColor: normalizeOptional(parsedInput.vehicleColor),
    files: parsedInput.files,
    branchId,
    regionId: normalizeOptional(parsedInput.regionId),
  };

  if (parsedInput.id) {
    const result = await deliverymenService().update(parsedInput.id, payload, userId);

    if (result.isErr()) {
      return { error: result.error.reason };
    }

    revalidatePath("/gestao/entregadores");
    revalidatePath(`/gestao/entregadores/${parsedInput.id}`);
    return { success: true, id: parsedInput.id };
  }

  const result = await deliverymenService().create(payload, userId);

  if (result.isErr()) {
    return { error: result.error.reason };
  }

  revalidatePath("/gestao/entregadores");
  revalidatePath(`/gestao/entregadores/${result.value.id}`);
  return { success: true, id: result.value.id };
});

export async function deleteDeliverymanAction(id: string) {
  const { userId } = await verifyActionSession();

  const result = await deliverymenService().delete(id, userId);

  if (result.isErr()) {
    return { error: result.error.reason };
  }

  revalidatePath("/gestao/entregadores");
  return { success: true };
}

export async function toggleBlockDeliverymanAction(id: string) {
  const { userId } = await verifyActionSession();

  const result = await deliverymenService().toggleBlock(id, userId);

  if (result.isErr()) {
    return { error: result.error.reason };
  }

  revalidatePath("/gestao/entregadores");
  revalidatePath(`/gestao/entregadores/${id}`);
  return { success: true, isBlocked: result.value.isBlocked };
}
