import { redirect } from "next/navigation";

interface RegisterAliasProps {
  params: Promise<{ locale: string }> | { locale: string };
}

export default async function RegisterAlias({ params }: RegisterAliasProps) {
  const resolvedParams = "then" in params ? await params : params;
  redirect(`/${resolvedParams.locale}/auth/register`);
}
