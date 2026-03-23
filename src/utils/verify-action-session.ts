import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cookieConst } from "@/constants/cookies";
import { sessionsService } from "@/modules/sessions/sessions-service";

type VerifySuccess = { userId: string; branchId: string | undefined };
type VerifySuccessWithBranch = { userId: string; branchId: string };

function clearSessionCookies(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  cookieStore.delete(cookieConst.SESSION_TOKEN);
  cookieStore.delete(cookieConst.SESSION_EXPIRES_AT);
  cookieStore.delete(cookieConst.USER_ID);
  cookieStore.delete(cookieConst.SELECTED_BRANCH);
}

export async function verifyActionSession(options: { requireBranch: true }): Promise<VerifySuccessWithBranch>;
export async function verifyActionSession(options?: { requireBranch?: false }): Promise<VerifySuccess>;
export async function verifyActionSession(options?: { requireBranch?: boolean }): Promise<VerifySuccess> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(cookieConst.SESSION_TOKEN)?.value;
  const expiresAt = cookieStore.get(cookieConst.SESSION_EXPIRES_AT)?.value;
  const userId = cookieStore.get(cookieConst.USER_ID)?.value;

  if (!userId || !sessionToken || !expiresAt || new Date(expiresAt) <= new Date()) {
    clearSessionCookies(cookieStore);
    redirect("/login");
  }

  const session = await sessionsService().validate(sessionToken);

  if (session.isErr()) {
    clearSessionCookies(cookieStore);
    redirect("/login");
  }

  const branchId = cookieStore.get(cookieConst.SELECTED_BRANCH)?.value;

  if (options?.requireBranch && !branchId) {
    clearSessionCookies(cookieStore);
    redirect("/login");
  }

  return { userId, branchId };
}
