import { usersService } from "@/lib/modules/users/user-service";
import { apiWrapper } from "@/lib/utils/api-wrapper";

export async function POST(req: Request) {
  return await apiWrapper(async () => {
    const authorization = req.headers.get("authorization");

    if (!authorization && authorization !== process.env.AUTH_SECRET) {
      return new Response("Não autorizado", { status: 401 });
    }

    const body = await req.json();

    await usersService().create(body);

    return new Response(null, { status: 201 });
  });  
}