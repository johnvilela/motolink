"use server";

import { revalidatePath } from "next/cache";

import { safeAction } from "@/lib/safe-action";
import { verifyActionSession } from "@/utils/verify-action-session";
import { planningService } from "./planning-service";
import { planningUpsertInputSchema } from "./planning-types";

export const upsertPlanningAction = safeAction
  .inputSchema(planningUpsertInputSchema)
  .action(async ({ parsedInput }) => {
    const { userId, branchId } = await verifyActionSession({ requireBranch: true });

    const result = await planningService().upsert({ ...parsedInput, branchId }, userId);

    if (result.isErr()) {
      return { error: result.error.reason };
    }

    revalidatePath("/operacional/planejamento", "page");
    return { success: true };
  });
