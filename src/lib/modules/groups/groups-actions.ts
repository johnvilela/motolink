"use server";

import { redirect } from "next/navigation";
import { actionClient } from "@/lib/services/safe-action";
import { groupsService } from "./groups-service";
import { MutateGroupSchema } from "./groups-types";

const GROUPS_REDIRECT_PATH = "/app/gestao/grupos";

export const mutateGroupAction = actionClient
  .inputSchema(MutateGroupSchema)
  .action(async ({ clientInput }) => {
    if (clientInput.id) {
      await groupsService().edit(clientInput.id, clientInput);
    } else {
      await groupsService().create(clientInput);
    }

    return redirect(GROUPS_REDIRECT_PATH);
  });

export const deleteGroupAction = actionClient
  .inputSchema(MutateGroupSchema.pick({ id: true }))
  .action(async ({ clientInput: { id } }) => {
    await groupsService().delete(id!);

    return redirect(GROUPS_REDIRECT_PATH);
  });
