import { getLocale, setRequestLocale } from "next-intl/server";

import { FooterVisibility } from "@/components/common/FooterVisibility";
import Navbar from "@/components/common/Navbar";
import { NextIntlClientProvider } from "next-intl";
import { ToastProvider } from "@/components/ui/toast";
import { locales, type Locale } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const resolvedParams = await params;
  const locale = (resolvedParams?.locale ?? (await getLocale())) as Locale;
  setRequestLocale(locale);
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
      <ToastProvider>
        <Navbar />
        {children}
        <FooterVisibility />
      </ToastProvider>
    </NextIntlClientProvider>
  );
}
