import { defaultLocale } from "./config";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  return {
    locale: defaultLocale,
    messages: (await import(`@/messages/${defaultLocale}.json`)).default,
    timeZone: "Europe/Madrid",
    now: new Date(),
  };
});
