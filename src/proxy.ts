import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/services/auth";
import { redirectByRole } from "./lib/utils/redirect-by-role";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: {},
  });

  if (!session && request.nextUrl.pathname.startsWith("/app")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (session && request.nextUrl.pathname === "/") {
    const url = redirectByRole(session.user.role);

    return NextResponse.redirect(new URL(url, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
