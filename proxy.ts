import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "./lib/i18n";

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get("locale")?.value;
  if (cookie && (locales as readonly string[]).includes(cookie)) return cookie;

  const header = request.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const code = part.split(";")[0].trim().toLowerCase().slice(0, 2);
    if ((locales as readonly string[]).includes(code)) return code;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const locale = detectLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
