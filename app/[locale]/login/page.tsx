import { redirect } from "next/navigation";

interface LoginAliasProps {
  params: Promise<{ locale: string }>;
}

export default async function LoginAlias({ params }: LoginAliasProps) {
  const { locale } = await params;
  redirect(`/${locale}/auth/login`);
}
