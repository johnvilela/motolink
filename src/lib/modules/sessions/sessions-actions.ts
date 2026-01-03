"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cookieNames } from "@/lib/constants/cookie-names";
import { actionClient } from "@/lib/services/safe-action";
import { redirectByRole } from "@/lib/utils/redirect-by-role";
import { sessionsService } from "./sessions-service";
import { createSessionSchema } from "./sessions-types";

export const createSessionAction = actionClient
  .inputSchema(createSessionSchema)
  .action(async ({ clientInput: { email, password } }) => {
    const session = await sessionsService().create({ email, password });

    const cookiesStore = await cookies();

    cookiesStore.set({
      name: cookieNames.SESSION_TOKEN,
      value: session.token,
      httpOnly: true,
      expires: session.expiresAt,
      priority: "high",
      secure: process.env.NODE_ENV === "production",
    });
    cookiesStore.set({
      name: cookieNames.SESSION_EXPIRES_AT,
      value: session.expiresAt.toISOString(),
      httpOnly: true,
      priority: "high",
      secure: process.env.NODE_ENV === "production",
    });
    cookiesStore.set({
      name: cookieNames.USER_ID,
      value: session.user.id,
      httpOnly: true,
      expires: session.expiresAt,
      priority: "high",
      secure: process.env.NODE_ENV === "production",
    });

    redirect(redirectByRole(session.user.role));
  });

export const deleteSessionAction = actionClient.action(async () => {
  const cookiesStore = await cookies();

  const sessionToken = cookiesStore.get(cookieNames.SESSION_TOKEN)?.value;

  if (sessionToken) {
    await sessionsService().delete(sessionToken);
  }

  cookiesStore.delete(cookieNames.SESSION_TOKEN);
  cookiesStore.delete(cookieNames.SESSION_EXPIRES_AT);
  cookiesStore.delete(cookieNames.USER_ID);

  redirect("/");
});
