"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cookieNames } from "@/lib/constants/cookie-names";
import { actionClient } from "@/lib/services/safe-action";
import { clientsService } from "./clients-service";
import { MutateClientSchema } from "./clients-types";

const CLIENTS_REDIRECT_PATH = "/app/clientes";

export const mutateClientAction = actionClient
  .inputSchema(MutateClientSchema.omit({ branch: true, createdBy: true }))
  .action(async ({ clientInput }) => {
    const cookieStore = await cookies();
    const currentBranch =
      cookieStore.get(cookieNames.CURRENT_BRANCH)?.value || "";
    const currentUserId = cookieStore.get(cookieNames.USER_ID)?.value || "";

    const fullData = {
      ...clientInput,
      branch: currentBranch,
      createdBy: clientInput.id ? undefined : currentUserId,
    };

    if (clientInput.id) {
      await clientsService().edit(clientInput.id, fullData);
    } else {
      await clientsService().create(fullData);
    }

    return redirect(CLIENTS_REDIRECT_PATH);
  });

export const deleteClientAction = actionClient
  .inputSchema(MutateClientSchema.pick({ id: true }))
  .action(async ({ clientInput: { id } }) => {
    await clientsService().delete(id!);

    return redirect(CLIENTS_REDIRECT_PATH);
  });
