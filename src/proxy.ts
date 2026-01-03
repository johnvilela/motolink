import { cookies, headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { cookieNames } from "./lib/constants/cookie-names";
import type { GetBytokenResponse } from "./lib/modules/sessions/sessions-service";
import { api } from "./lib/utils/api-client";
import { redirectByRole } from "./lib/utils/redirect-by-role";

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

  if ((!data || error) && request.nextUrl.pathname.startsWith("/app")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (data && request.nextUrl.pathname === "/") {
    const url = redirectByRole(data.user.role);

    return NextResponse.redirect(new URL(url, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
