import type { NextRequest } from "next/server";
import { createUser } from "@/lib/modules/users/service";
import { createUserSchema } from "@/lib/modules/users/types";

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("authorization");

  if (!authorization && authorization !== process.env.AUTH_SECRET) {
    return new Response("Não autorizado", { status: 401 });
  }

  const body = await req.json();

  const parseResult = createUserSchema.safeParse(body);

  if (!parseResult.success) {
    return new Response("Campos inválidos", { status: 400 });
  }

  await createUser(body);

  return new Response(null, { status: 201 });
}
