"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cookieNames } from "@/lib/constants/cookie-names";
import { actionClient } from "@/lib/services/safe-action";
import { deliverymenService } from "./deliverymen-service";
import { MutateDeliverymanSchema } from "./deliverymen-types";

const DELIVERYMEN_REDIRECT_PATH = "/app/gestao/motoboys";

export const mutateDeliverymanAction = actionClient
  .inputSchema(MutateDeliverymanSchema.omit({ branch: true }))
  .action(async ({ clientInput }) => {
    const cookieStore = await cookies();
    const currentBranch =
      cookieStore.get(cookieNames.CURRENT_BRANCH)?.value || "";

    const fullData = {
      ...clientInput,
      branch: currentBranch,
    };

    if (clientInput.id) {
      await deliverymenService().edit(clientInput.id, fullData);
    } else {
      await deliverymenService().create(fullData);
    }

    return redirect(DELIVERYMEN_REDIRECT_PATH);
  });

export const deleteDeliverymanAction = actionClient
  .inputSchema(MutateDeliverymanSchema.pick({ id: true }))
  .action(async ({ clientInput: { id } }) => {
    await deliverymenService().delete(id!);

    return redirect(DELIVERYMEN_REDIRECT_PATH);
  });

export const blockDeliverymanAction = actionClient
  .inputSchema(MutateDeliverymanSchema.pick({ id: true }))
  .action(async ({ clientInput: { id } }) => {
    await deliverymenService().block(id!);

    return redirect(DELIVERYMEN_REDIRECT_PATH);
  });
