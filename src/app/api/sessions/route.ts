import { cookies } from "next/headers";
import { cookieNames } from "@/lib/constants/cookie-names";
import { sessionsService } from "@/lib/modules/sessions/sessions-service";
import { apiWrapper } from "@/lib/utils/api-wrapper";

export async function GET() {
  return await apiWrapper(async () => {
    const cookiesStore = await cookies();
    const token = cookiesStore.get(cookieNames.SESSION_TOKEN)?.value;

    if (!token) {
      return new Response("Sessão inválida", { status: 401 });
    }

    const session = await sessionsService().getByToken(token);

    return new Response(JSON.stringify(session), { status: 200 });
  });
}
