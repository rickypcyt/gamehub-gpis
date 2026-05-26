import { redirect } from "next/navigation";

interface ContactAliasProps {
  params: Promise<{ locale: string }>;
}

export default async function ContactAlias({ params }: ContactAliasProps) {
  const { locale } = await params;
  redirect(`/${locale}/public/contact`);
}
