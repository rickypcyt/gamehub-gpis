import { defaultLocale, locales } from "./i18n/config";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import createMiddleware from "next-intl/middleware";

// Create next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always"
});

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Apply next-intl middleware first for locale handling
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  const isPublicRoute = ["/", "/news", "/games", "/blog", "/multimedia", "/events", "/team", "/contact"]
    .map(p => `/${defaultLocale}${p}`)
    .concat(["/", "/news", "/games", "/blog", "/multimedia", "/events", "/team", "/contact"])
    .includes(nextUrl.pathname);

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth") || nextUrl.pathname.startsWith("/api/register");
  const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === `/${defaultLocale}/login`;

  // Rutas protegidas por rol
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isColaboradorRoute = nextUrl.pathname.startsWith("/dashboard/write/blog") || nextUrl.pathname.startsWith("/dashboard/my-posts");

  // Rutas API protegidas
  const isProtectedApiRoute = nextUrl.pathname.startsWith("/api/news") || nextUrl.pathname.startsWith("/api/games");

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Protección de API routes
  if (isProtectedApiRoute) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Solo admin/redactor pueden POST/PUT/DELETE a news y games
    if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
      if (!["admin", "redactor"].includes(userRole || "")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(`/${defaultLocale}/dashboard`, nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL(`/${defaultLocale}/login`, nextUrl));
  }

  // Verificar roles para rutas protegidas
  if (isAdminRoute && userRole !== "admin") {
    return NextResponse.redirect(new URL(`/${defaultLocale}/dashboard`, nextUrl));
  }

  // Redactor tiene acceso a escribir noticias, juegos, multimedia, eventos
  if (nextUrl.pathname.startsWith("/dashboard/write/news") || 
      nextUrl.pathname.startsWith("/dashboard/my-news") ||
      nextUrl.pathname.startsWith("/dashboard/games") ||
      nextUrl.pathname.startsWith("/dashboard/multimedia") ||
      nextUrl.pathname.startsWith("/dashboard/events") ||
      nextUrl.pathname.startsWith("/dashboard/edit/news")) {
    if (!["admin", "redactor"].includes(userRole || "")) {
      return NextResponse.redirect(new URL(`/${defaultLocale}/dashboard`, nextUrl));
    }
  }

  // Colaborador solo blog
  if (isColaboradorRoute && userRole !== "colaborador" && userRole !== "admin") {
    return NextResponse.redirect(new URL(`/${defaultLocale}/dashboard`, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"]
};
