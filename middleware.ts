import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/utils/auth";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (pathname.startsWith("/admin") && !session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/admin") && session) {
    const userRole = session.user?.roles;

    if (userRole === "USER") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (userRole === "MOD") {
      if (pathname.startsWith("/admin/users")) {
        return NextResponse.redirect(new URL("/admin/docs", request.url));
      }
    }

    if (pathname === "/admin" || pathname === "/admin/") {
      if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/users", request.url));
      } else if (userRole === "MOD") {
        return NextResponse.redirect(new URL("/admin/docs", request.url));
      }
    }
  }

  if (pathname.startsWith("/api") && !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.next();

  response.headers.set("x-pathname", pathname);

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
    "/",
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
};
