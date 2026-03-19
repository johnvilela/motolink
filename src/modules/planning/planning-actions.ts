"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { cookieConst } from "@/constants/cookies";
import { safeAction } from "@/lib/safe-action";
import { planningService } from "./planning-service";
import { planningUpsertInputSchema } from "./planning-types";

export const upsertPlanningAction = safeAction
  .inputSchema(planningUpsertInputSchema)
  .action(async ({ parsedInput }) => {
    const cookieStore = await cookies();
    const loggedUserId = cookieStore.get(cookieConst.USER_ID)?.value;
    const branchId = cookieStore.get(cookieConst.SELECTED_BRANCH)?.value;

    if (!loggedUserId) {
      return { error: "Usuário não autenticado" };
    }

    if (!branchId) {
      return { error: "Filial não selecionada" };
    }

    const result = await planningService().upsert({ ...parsedInput, branchId }, loggedUserId);

    if (result.isErr()) {
      return { error: result.error.reason };
    }

    revalidatePath("/operacional/planejamento", "page");
    return { success: true };
  });
