import { redirect } from "next/navigation";

interface RegisterAliasProps {
  params: Promise<{ locale: string }>;
}

export default async function RegisterAlias({ params }: RegisterAliasProps) {
  const { locale } = await params;
  redirect(`/${locale}/auth/register`);
}
