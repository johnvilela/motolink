import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import z from "zod";
import { cookieConst } from "@/constants/cookies";
import { planningService } from "@/modules/planning/planning-service";
import { planningListQuerySchema } from "@/modules/planning/planning-types";
import { verifySession } from "@/utils/verify-session";

export async function GET(request: NextRequest) {
  const auth = await verifySession();
  if (auth.error) return auth.error;

  const cookieStore = await cookies();
  const branchId = cookieStore.get(cookieConst.SELECTED_BRANCH)?.value;

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = planningListQuerySchema.safeParse({ ...params, branchId });

  if (!parsed.success) {
    return NextResponse.json({ error: "Parâmetros inválidos", details: z.treeifyError(parsed.error) }, { status: 400 });
  }

  const result = await planningService().listAll(parsed.data);

  if (result.isErr()) {
    return NextResponse.json({ error: result.error.reason }, { status: result.error.statusCode });
  }

  return NextResponse.json(result.value);
}
