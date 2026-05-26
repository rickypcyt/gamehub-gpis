import { ArrowLeft, BarChart3, MessageSquare, Newspaper, Settings, Shield, Users } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { query } from "@/lib/neon";
import { redirect } from "next/navigation";

export default async function AdminHomePage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const [usersCount, newsCount, commentsCount, recentPendingComments] = await Promise.all([
    query<{ c: number }>("SELECT COUNT(*)::int as c FROM profiles"),
    query<{ c: number }>("SELECT COUNT(*)::int as c FROM news_posts"),
    query<{ c: number }>("SELECT COUNT(*)::int as c FROM comments"),
    query<{ c: number }>("SELECT COUNT(*)::int as c FROM comments WHERE created_at > NOW() - INTERVAL '7 days'"),
  ]);

  const stats = [
    { label: "Usuarios", value: usersCount?.[0]?.c ?? 0, icon: <Users className="h-5 w-5" />, accent: "text-emerald-400 bg-emerald-500/10" },
    { label: "Noticias", value: newsCount?.[0]?.c ?? 0, icon: <Newspaper className="h-5 w-5" />, accent: "text-violet-400 bg-violet-500/10" },
    { label: "Comentarios", value: commentsCount?.[0]?.c ?? 0, icon: <MessageSquare className="h-5 w-5" />, accent: "text-blue-400 bg-blue-500/10" },
    { label: "Esta semana", value: recentPendingComments?.[0]?.c ?? 0, icon: <BarChart3 className="h-5 w-5" />, accent: "text-amber-400 bg-amber-500/10" },
  ];

  const quickLinks = [
    {
      title: "Gestionar usuarios",
      description: "Roles, permisos y perfiles",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Control de noticias",
      description: "Publicaciones y estados",
      href: "/admin/news",
      icon: <Newspaper className="h-5 w-5" />,
    },
    {
      title: "Configuración",
      description: "Preferencias del sistema",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 sm:h-8 sm:w-8">
                <Shield className="h-4 w-4 text-red-400 sm:h-5 sm:w-5" />
              </div>
              <h1 className="text-lg font-bold text-white sm:text-xl">Panel de Administración</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6 sm:py-8 sm:space-y-8">
        <section className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium sm:gap-2 sm:px-2.5 sm:py-1 sm:text-sm ${stat.accent}`}>
                  {stat.icon}
                  {stat.label}
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-white sm:mt-4 sm:text-3xl">{stat.value}</p>
              <p className="text-xs text-zinc-500 sm:text-sm">Total</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-violet-500/40 hover:bg-zinc-900 sm:p-6"
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-violet-500/10 p-2 text-violet-400 group-hover:bg-violet-500/20 sm:mb-4">
                {link.icon}
              </div>
              <h2 className="text-base font-semibold text-white group-hover:text-violet-300 sm:text-lg">{link.title}</h2>
              <p className="mt-1.5 text-sm text-zinc-400 sm:mt-2 sm:text-base">{link.description}</p>
            </Link>
          ))}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
          <div className="flex flex-col gap-4 text-sm text-zinc-400 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-base font-semibold text-white">Recomendación</p>
              <p className="mt-1 text-sm text-zinc-400">
                Revisa las secciones de usuarios y noticias para mantener la plataforma al día.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link
                href="/admin/users"
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:border-violet-500 hover:text-white sm:px-4"
              >
                Gestionar usuarios
              </Link>
              <Link
                href="/admin/news"
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:border-violet-500 hover:text-white sm:px-4"
              >
                Revisar noticias
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
