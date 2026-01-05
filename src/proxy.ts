import { cookies, headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { BRANCHS } from "./lib/constants/app";
import { cookieNames } from "./lib/constants/cookie-names";
import type { GetBytokenResponse } from "./lib/modules/sessions/sessions-service";
import { api } from "./lib/utils/api-client";
import { validateBranchAccess } from "./lib/utils/branch-validation";

export async function proxy(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(cookieNames.SESSION_TOKEN)?.value;
  const sessionExpiresAt = cookieStore.get(
    cookieNames.SESSION_EXPIRES_AT,
  )?.value;

  const avoidCheckSession =
    !sessionToken ||
    !sessionExpiresAt ||
    new Date(sessionExpiresAt) < new Date();

  if (avoidCheckSession && !request.nextUrl.pathname.startsWith("/app")) {
    return NextResponse.next();
  }

  if (avoidCheckSession && request.nextUrl.pathname.startsWith("/app")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const headersList = await headers();

  const { data, error } = await api.get<GetBytokenResponse>("/api/sessions", {
    headers: headersList,
    cache: "no-cache",
  });

  if (error) {
    const response = NextResponse.redirect(new URL("/", request.url));

    response.cookies.delete(cookieNames.SESSION_TOKEN);
    response.cookies.delete(cookieNames.SESSION_EXPIRES_AT);
    response.cookies.delete(cookieNames.CURRENT_BRANCH);

    return response;
  }

  if (!data && request.nextUrl.pathname.startsWith("/app")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const currentBranch = cookieStore.get(cookieNames.CURRENT_BRANCH)?.value;
  const hasAccessToCurrentBranch = currentBranch
    ? validateBranchAccess(data?.user, currentBranch)
    : false;

  if (data && request.nextUrl.pathname === "/") {
    const response = NextResponse.redirect(
      new URL("/app/dashboard", request.url),
    );

    if (!hasAccessToCurrentBranch) {
      const firstBranch = data?.user.branchs?.[0] || BRANCHS.RJ;

      response.cookies.set(cookieNames.CURRENT_BRANCH, firstBranch);
    }

    return response;
  }

  const response = NextResponse.next();

  if (!hasAccessToCurrentBranch) {
    const firstBranch = data?.user.branchs?.[0] || BRANCHS.RJ;

    response.cookies.set(cookieNames.CURRENT_BRANCH, firstBranch);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
