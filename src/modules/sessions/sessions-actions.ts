"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cookieConst } from "../../constants/cookies";
import { safeAction } from "../../lib/safe-action";
import { AppError } from "../../utils/app-error";
import { sessionsService } from "./sessions-service";
import { createSessionSchema } from "./sessions-types";

export const createSessionAction = safeAction
  .inputSchema(createSessionSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { session, user } = await sessionsService().create(parsedInput);

      const cookieStore = await cookies();

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        expires: session.expiresAt,
      };

      cookieStore.set(cookieConst.SESSION_TOKEN, session.token, cookieOptions);
      cookieStore.set(
        cookieConst.SESSION_EXPIRES_AT,
        session.expiresAt.toISOString(),
        cookieOptions,
      );
      cookieStore.set(cookieConst.USER_ID, user.id, cookieOptions);
      cookieStore.set(cookieConst.SELECTED_BRANCH, user.branches[0] ?? "", {
        sameSite: "lax",
        expires: session.expiresAt,
        path: "/",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return { error: error.message };
      }
      return { error: "Não foi possivel realizar login" };
    }

    redirect("/dashboard");
  });

export async function deleteSessionAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieConst.SESSION_TOKEN)?.value;

  if (token) {
    try {
      await sessionsService().delete(token);
    } catch {
      // Logout should always succeed even if session deletion fails
    }
  }

  cookieStore.delete(cookieConst.SESSION_TOKEN);
  cookieStore.delete(cookieConst.SESSION_EXPIRES_AT);
  cookieStore.delete(cookieConst.USER_ID);
  cookieStore.delete(cookieConst.SELECTED_BRANCH);

  redirect("/login");
}
