import { getLocale, getMessages, setRequestLocale } from "next-intl/server";

import { Footer } from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import { NextIntlClientProvider } from "next-intl";
import { ToastProvider } from "@/components/ui/toast";
import { locales } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }> | { locale: string };
}>) {
  const resolvedParams = "then" in params ? await params : params;
  const locale = resolvedParams?.locale ?? (await getLocale());
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ToastProvider>
        <Navbar />
        {children}
        <Footer />
      </ToastProvider>
    </NextIntlClientProvider>
  );
}
