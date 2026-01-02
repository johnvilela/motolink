import type { NextRequest } from "next/server";
import { userService } from "@/lib/modules/users/service";
import { createUserSchema } from "@/lib/modules/users/types";
import { apiWrapper } from "@/lib/utils/api-wrapper";

export async function POST(req: NextRequest) {
  return await apiWrapper(async () => {
    const authorization = req.headers.get("authorization");

    if (!authorization && authorization !== process.env.AUTH_SECRET) {
      return new Response("Não autorizado", { status: 401 });
    }

    const body = await req.json();

    const parseResult = createUserSchema.safeParse(body);

    if (!parseResult.success) {
      return new Response("Campos inválidos", { status: 400 });
    }

    await userService().create(body);

    return new Response(null, { status: 201 });
  });
}
