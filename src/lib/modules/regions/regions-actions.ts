"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cookieNames } from "@/lib/constants/cookie-names";
import { actionClient } from "@/lib/services/safe-action";
import { regionsService } from "./regions-service";
import { MutateRegionSchema } from "./regions-types";

const REGIONS_REDIRECT_PATH = "/app/gestao/regiao";

export const mutateRegionAction = actionClient
  .inputSchema(MutateRegionSchema.omit({ branch: true }))
  .action(async ({ clientInput }) => {
    const cookieStore = await cookies();
    const currentBranch =
      cookieStore.get(cookieNames.CURRENT_BRANCH)?.value || "";

    const dataWithBranch = { ...clientInput, branch: currentBranch };

    if (clientInput.id) {
      await regionsService().edit(clientInput.id, dataWithBranch);
    } else {
      await regionsService().create(dataWithBranch);
    }

    return redirect(REGIONS_REDIRECT_PATH);
  });

export const deleteRegionAction = actionClient
  .inputSchema(MutateRegionSchema.pick({ id: true }))
  .action(async ({ clientInput: { id } }) => {
    await regionsService().delete(id!);

    return redirect(REGIONS_REDIRECT_PATH);
  });
