"use server";

import { redirect } from "next/navigation";
import { actionClient } from "@/lib/services/safe-action";
import { actionResponseBuilder } from "@/lib/utils/action-response-builder";
import { createSession } from "./service";
import { createSessionSchema } from "./types";

export const createSessionAction = actionClient
  .inputSchema(createSessionSchema)
  .action(async ({ parsedInput }) => {
    let canRedirect = false;
    try {
      const res = await createSession(parsedInput);

      canRedirect = !!res.token
    } catch (_) {
      return actionResponseBuilder().error("Erro ao criar sessão");
    }

    if (canRedirect) redirect("/app/dashboard");
  });
