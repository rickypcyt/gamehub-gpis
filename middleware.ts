import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = ["/", "/login", "/news", "/games", "/blog", "/multimedia", "/events", "/team", "/contact"].includes(nextUrl.pathname);
  const isAuthRoute = nextUrl.pathname === "/login";

  // Rutas protegidas por rol
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isEditorRoute = nextUrl.pathname.startsWith("/dashboard/write");

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Verificar roles
  if (isAdminRoute && userRole !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (isEditorRoute && !["admin", "redactor", "colaborador"].includes(userRole || "")) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)", "/api/:path*"],
};
