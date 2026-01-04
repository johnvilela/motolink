"use server";

import { redirect } from "next/navigation";
import { actionClient } from "@/lib/services/safe-action";
import { regionsService } from "./regions-service";
import { MutateRegionSchema } from "./regions-types";

const REGIONS_REDIRECT_PATH = "/app/gestao/regiao";

export const mutateRegionAction = actionClient
  .inputSchema(MutateRegionSchema)
  .action(async ({ clientInput }) => {
    if (clientInput.id) {
      await regionsService().edit(clientInput.id, clientInput);
    } else {
      await regionsService().create(clientInput);
    }

    return redirect(REGIONS_REDIRECT_PATH);
  });

export const deleteRegionAction = actionClient
  .inputSchema(MutateRegionSchema.pick({ id: true }))
  .action(async ({ clientInput: { id } }) => {
    await regionsService().delete(id!);

    return redirect(REGIONS_REDIRECT_PATH);
  });
