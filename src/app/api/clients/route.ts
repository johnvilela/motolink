import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import z from "zod";
import { cookieConst } from "@/constants/cookies";
import { clientsService } from "@/modules/clients/clients-service";
import { clientListQuerySchema } from "@/modules/clients/clients-types";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const branchId = cookieStore.get(cookieConst.SELECTED_BRANCH)?.value;

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = clientListQuerySchema.safeParse({ ...params, branchId });

  if (!parsed.success) {
    return NextResponse.json({ error: "Parâmetros inválidos", details: z.treeifyError(parsed.error) }, { status: 400 });
  }

  const result = await clientsService().listAllSmall(parsed.data);

  if (result.isErr()) {
    return NextResponse.json({ error: result.error.reason }, { status: result.error.statusCode });
  }

  return NextResponse.json(result.value);
}
