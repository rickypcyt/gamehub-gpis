import { Footer } from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import { NextIntlClientProvider } from "next-intl";
import { ToastProvider } from "@/components/ui/toast";
import { getMessages } from "next-intl/server";

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
