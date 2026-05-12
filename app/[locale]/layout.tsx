import { getLocale, getMessages } from "next-intl/server";

import { Footer } from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { NextIntlClientProvider } from "next-intl";
import { ToastProvider } from "@/components/ui/toast";

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ToastProvider>
        <Navbar />
        {children}
        <Footer />
      </ToastProvider>
    </NextIntlClientProvider>
  );
}
