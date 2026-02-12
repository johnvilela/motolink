import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookieConst } from "./constants/cookies";

const publicPaths = ["/login"];

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;

  if (nextUrl.pathname === "/") {
    return Response.redirect(new URL("/login", request.url));
  }

  const cookieStore = await cookies();
  const sessionExpiresAt = cookieStore.get(
    cookieConst.SESSION_EXPIRES_AT,
  )?.value;
  const sessionToken = cookieStore.get(cookieConst.SESSION_TOKEN)?.value;

  const isSessionValid =
    sessionToken && sessionExpiresAt && new Date(sessionExpiresAt) > new Date();
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

  if (!isPublicPath && !isSessionValid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isSessionValid && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$).*)"],
};
