import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { locales, defaultLocale, type Locale } from "./config";

export default getRequestConfig(async () => {
  // Try to get locale from cookie
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value as Locale | undefined;

  // Try to get locale from header (Accept-Language)
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");

  let locale: Locale = defaultLocale;

  if (cookieLocale && locales.includes(cookieLocale)) {
    locale = cookieLocale;
  } else if (acceptLanguage) {
    // Parse Accept-Language header
    const preferredLocale = acceptLanguage
      .split(",")[0]
      .split("-")[0] as Locale;
    if (locales.includes(preferredLocale)) {
      locale = preferredLocale;
    }
  }

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
    timeZone: "Europe/Madrid",
    now: new Date(),
  };
});
