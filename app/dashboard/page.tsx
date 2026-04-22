import {
  BookOpen,
  Calendar,
  Gamepad2,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Newspaper,
  PenLine,
  Plus,
  Settings,
  Shield,
  Trophy,
  User,
  Users,
  Video,
} from "lucide-react";
import { auth, signOut } from "@/auth";

import Link from "next/link";
import type { Profile } from "@/lib/neon";
import { queryOne } from "@/lib/neon";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const profile = await queryOne<Profile>(
    "SELECT * FROM profiles WHERE id = $1",
    [session.user.id]
  );

  const role = session.user.role || "suscriptor";

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    redactor: "Redactor",
    colaborador: "Colaborador",
    suscriptor: "Suscriptor",
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header - Estilo igual a la home */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
            <Gamepad2 className="h-6 w-6 text-violet-500" />
            GameHub
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-base text-zinc-400">
              {roleLabels[role]}
            </span>
            <span className="hidden sm:block text-base text-zinc-400">
              {session.user.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-1.5 text-base text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10">
        {/* Back to home button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            ← Volver a inicio
          </Link>
        </div>

        {/* Welcome - Estilo simple */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">
            ¡Hola, {profile?.name?.split(' ')[0] || "Usuario"}!
          </h1>
          <p className="mt-2 text-lg text-zinc-400">
            {role === "admin" && "Control total de la plataforma"}
            {role === "redactor" && "Crea y gestiona contenido editorial"}
            {role === "colaborador" && "Comparte opiniones en el blog"}
            {role === "suscriptor" && "Participa en la comunidad"}
          </p>
        </div>

        {/* Admin Section */}
        {role === "admin" && (
          <section className="mb-12">
            <SectionHeader icon={<Shield className="h-5 w-5" />} title="Administración" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <ActionCard
                icon={<Users className="h-6 w-6" />}
                title="Usuarios"
                description="Gestiona roles y permisos de usuarios."
                href="/admin/users"
              />
              <ActionCard
                icon={<MessageSquare className="h-6 w-6" />}
                title="Mensajes"
                description="Revisa mensajes del formulario de contacto."
                href="/admin/messages"
              />
              <ActionCard
                icon={<Settings className="h-6 w-6" />}
                title="Configuración"
                description="Ajustes generales de la plataforma."
                href="/admin/settings"
              />
            </div>
          </section>
        )}

        {/* Redactor Section */}
        {(role === "admin" || role === "redactor") && (
          <section className="mb-12">
            <SectionHeader icon={<PenLine className="h-5 w-5" />} title="Gestión de Contenido" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <ActionCard
                icon={<Plus className="h-6 w-6" />}
                title="Nueva Noticia"
                description="Crea una noticia para la portada."
                href="/dashboard/write/news"
              />
              <ActionCard
                icon={<Newspaper className="h-6 w-6" />}
                title="Mis Noticias"
                description="Gestiona tus publicaciones."
                href="/dashboard/my-news"
              />
              <ActionCard
                icon={<Trophy className="h-6 w-6" />}
                title="Juegos"
                description="Añade o edita videojuegos."
                href="/dashboard/games"
              />
              <ActionCard
                icon={<Video className="h-6 w-6" />}
                title="Multimedia"
                description="Gestiona videos y streams."
                href="/dashboard/multimedia"
              />
              <ActionCard
                icon={<Calendar className="h-6 w-6" />}
                title="Eventos"
                description="Calendario de lanzamientos y ferias."
                href="/dashboard/events"
              />
            </div>
          </section>
        )}

        {/* Colaborador Section */}
        {role === "colaborador" && (
          <section className="mb-12">
            <SectionHeader icon={<BookOpen className="h-5 w-5" />} title="Blog" />
            <div className="grid gap-6 md:grid-cols-2">
              <ActionCard
                icon={<Plus className="h-6 w-6" />}
                title="Nueva Entrada"
                description="Escribe una opinión para la comunidad."
                href="/dashboard/write/blog"
              />
              <ActionCard
                icon={<BookOpen className="h-6 w-6" />}
                title="Mis Posts"
                description="Gestiona tus publicaciones."
                href="/dashboard/my-posts"
              />
            </div>
          </section>
        )}

        {/* Suscriptor Section */}
        {role === "suscriptor" && (
          <section className="mb-12">
            <SectionHeader icon={<User className="h-5 w-5" />} title="Mi Cuenta" />
            <div className="grid gap-6 md:grid-cols-2">
              <ActionCard
                icon={<User className="h-6 w-6" />}
                title="Editar Perfil"
                description="Actualiza tu información personal."
                href="/dashboard/profile"
              />
              <ActionCard
                icon={<MessageSquare className="h-6 w-6" />}
                title="Mis Comentarios"
                description="Revisa tus comentarios."
                href="/dashboard/comments"
              />
            </div>
          </section>
        )}

        {/* Stats - Estilo igual a FeatureCards de la home */}
        <section>
          <SectionHeader icon={<LayoutGrid className="h-5 w-5" />} title="Información" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Rol" 
              value={roleLabels[role]} 
              icon={<Shield className="h-6 w-6" />} 
            />
            <StatCard 
              title="Email" 
              value={session.user.email || "-"} 
              icon={<User className="h-6 w-6" />} 
            />
            <StatCard 
              title="Nombre" 
              value={profile?.name || "Sin nombre"} 
              icon={<User className="h-6 w-6" />} 
            />
            <StatCard 
              title="Miembro Desde" 
              value={profile?.created_at 
                ? new Date(profile.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
                : "-"} 
              icon={<Calendar className="h-6 w-6" />} 
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="inline-flex rounded-lg bg-violet-500/10 p-2 text-violet-500">
        {icon}
      </div>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
    </div>
  );
}

function StatCard({ title, value, icon }: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-violet-500/50 hover:bg-zinc-900">
      <div className="mb-4 inline-flex rounded-lg bg-violet-500/10 p-3 text-violet-500">
        {icon}
      </div>
      <p className="text-base text-zinc-500">{title}</p>
      <p className="mt-1 text-lg font-semibold text-white truncate">{value}</p>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-violet-500/50 hover:bg-zinc-900"
    >
      <div className="mb-4 inline-flex rounded-lg bg-violet-500/10 p-3 text-violet-500 transition group-hover:bg-violet-500 group-hover:text-white">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-violet-400">
        {title}
      </h3>
      <p className="text-base text-zinc-400">{description}</p>
    </Link>
  );
}
