"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cookieNames } from "@/lib/constants/cookie-names";
import { actionClient } from "@/lib/services/safe-action";
import { groupsService } from "./groups-service";
import { MutateGroupSchema } from "./groups-types";

const GROUPS_REDIRECT_PATH = "/app/gestao/grupos";

export const mutateGroupAction = actionClient
  .inputSchema(MutateGroupSchema.omit({ branch: true }))
  .action(async ({ clientInput }) => {
    const cookieStore = await cookies();
    const currentBranch =
      cookieStore.get(cookieNames.CURRENT_BRANCH)?.value || "";

    const dataWithBranch = { ...clientInput, branch: currentBranch };

    if (clientInput.id) {
      await groupsService().edit(clientInput.id, dataWithBranch);
    } else {
      await groupsService().create(dataWithBranch);
    }

    return redirect(GROUPS_REDIRECT_PATH);
  });

export const deleteGroupAction = actionClient
  .inputSchema(MutateGroupSchema.pick({ id: true }))
  .action(async ({ clientInput: { id } }) => {
    await groupsService().delete(id!);

    return redirect(GROUPS_REDIRECT_PATH);
  });
