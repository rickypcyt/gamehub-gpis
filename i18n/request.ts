import { defaultLocale } from "./config";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ requestLocale }: { requestLocale?: string | Promise<string> }) => {
  const locale = (await requestLocale) || defaultLocale;

  if (!["en", "es"].includes(locale)) {
    return {
      locale: defaultLocale,
      messages: (await import(`@/messages/${defaultLocale}.json`)).default,
      timeZone: "Europe/Madrid",
      now: new Date(),
    };
  }

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
    timeZone: "Europe/Madrid",
    now: new Date(),
  };
});
