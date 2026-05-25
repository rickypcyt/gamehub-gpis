import { redirect } from "next/navigation";

interface LoginAliasProps {
  params: Promise<{ locale: string }> | { locale: string };
}

export default async function LoginAlias({ params }: LoginAliasProps) {
  const resolvedParams = "then" in params ? await params : params;
  redirect(`/${resolvedParams.locale}/auth/login`);
}
