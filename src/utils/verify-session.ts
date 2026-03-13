import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cookieConst } from "@/constants/cookies";
import { sessionsService } from "@/modules/sessions/sessions-service";

export async function verifySession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(cookieConst.SESSION_TOKEN)?.value;
  const expiresAt = cookieStore.get(cookieConst.SESSION_EXPIRES_AT)?.value;

  if (!sessionToken || !expiresAt || new Date(expiresAt) <= new Date()) {
    return { error: NextResponse.json({ error: "Sessão inválida" }, { status: 401 }) };
  }

  const session = await sessionsService().validate(sessionToken);

  if (session.isErr()) {
    return { error: NextResponse.json({ error: session.error.reason }, { status: session.error.statusCode }) };
  }

  return { session: session.value };
}
