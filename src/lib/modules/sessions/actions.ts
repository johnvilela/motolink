"use server";

import { redirect } from "next/navigation";
import { actionClient } from "@/lib/services/safe-action";
import { redirectByRole } from "@/lib/utils/redirect-by-role";
import { createSession } from "./service";
import { createSessionSchema } from "./types";

export const createSessionAction = actionClient
  .inputSchema(createSessionSchema)
  .action(async ({ parsedInput }) => {
    const res = await createSession(parsedInput);

    redirect(redirectByRole(res.user.role));
  });
