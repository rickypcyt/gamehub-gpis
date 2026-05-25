import { redirect } from "next/navigation";

interface ContactAliasProps {
  params: Promise<{ locale: string }> | { locale: string };
}

export default async function ContactAlias({ params }: ContactAliasProps) {
  const resolvedParams = "then" in params ? await params : params;
  redirect(`/${resolvedParams.locale}/public/contact`);
}
