import {
  Calendar,
  MessageSquare,
  Newspaper,
  Plus,
  Settings,
  Trophy,
  User,
  Users,
  Video
} from "lucide-react";

import Link from "next/link";
import { auth } from "@/auth";
import { createClientServer } from "@/lib/supabase";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const supabase = await createClientServer();
  
  // Obtener perfil completo
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  const role = session.user.role || "suscriptor";

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    redactor: "Redactor",
    colaborador: "Colaborador",
    suscriptor: "Suscriptor",
  };

  const roleColors: Record<string, string> = {
    admin: "bg-red-500/10 text-red-400",
    redactor: "bg-violet-500/10 text-violet-400",
    colaborador: "bg-blue-500/10 text-blue-400",
    suscriptor: "bg-zinc-500/10 text-zinc-400",
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
            <span className="text-violet-500">GH</span>
            Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${roleColors[role]}`}>
              {roleLabels[role]}
            </span>
            <span className="text-sm text-zinc-400">{session.user.email}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Rol" value={roleLabels[role]} icon={<User className="h-5 w-5" />} />
          <StatCard title="Email" value={session.user.email || "-"} icon={<User className="h-5 w-5" />} />
          <StatCard title="Nombre" value={profile?.name || "Sin nombre"} icon={<User className="h-5 w-5" />} />
          <StatCard title="Miembro desde" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString("es-ES") : "-"} icon={<Calendar className="h-5 w-5" />} />
        </div>

        {/* Acciones por rol */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Admin: Gestión completa */}
          {role === "admin" && (
            <>
              <ActionCard
                icon={<Users className="h-6 w-6" />}
                title="Gestión de usuarios"
                description="Administrar roles y permisos de usuarios"
                href="/admin/users"
              />
              <ActionCard
                icon={<MessageSquare className="h-6 w-6" />}
                title="Mensajes de contacto"
                description="Ver y gestionar mensajes del formulario"
                href="/admin/messages"
              />
              <ActionCard
                icon={<Settings className="h-6 w-6" />}
                title="Configuración"
                description="Ajustes generales de la plataforma"
                href="/admin/settings"
              />
            </>
          )}

          {/* Redactor: Crear y editar contenido */}
          {(role === "admin" || role === "redactor") && (
            <>
              <ActionCard
                icon={<Plus className="h-6 w-6" />}
                title="Nueva noticia"
                description="Crear una noticia para la portada"
                href="/dashboard/write/news"
              />
              <ActionCard
                icon={<Newspaper className="h-6 w-6" />}
                title="Mis noticias"
                description="Gestionar tus publicaciones"
                href="/dashboard/my-news"
              />
              <ActionCard
                icon={<Trophy className="h-6 w-6" />}
                title="Gestionar juegos"
                description="Añadir o editar videojuegos"
                href="/dashboard/games"
              />
              <ActionCard
                icon={<Video className="h-6 w-6" />}
                title="Multimedia"
                description="Añadir videos y streams"
                href="/dashboard/multimedia"
              />
              <ActionCard
                icon={<Calendar className="h-6 w-6" />}
                title="Eventos"
                description="Gestionar calendario de eventos"
                href="/dashboard/events"
              />
            </>
          )}

          {/* Colaborador: Blog y comentarios */}
          {role === "colaborador" && (
            <>
              <ActionCard
                icon={<Plus className="h-6 w-6" />}
                title="Nueva entrada de blog"
                description="Comparte tu opinión con la comunidad"
                href="/dashboard/write/blog"
              />
              <ActionCard
                icon={<MessageSquare className="h-6 w-6" />}
                title="Mis publicaciones"
                description="Ver y editar tus posts"
                href="/dashboard/my-posts"
              />
            </>
          )}

          {/* Suscriptor: Perfil y comentarios */}
          {role === "suscriptor" && (
            <>
              <ActionCard
                icon={<User className="h-6 w-6" />}
                title="Editar perfil"
                description="Actualizar tu información personal"
                href="/dashboard/profile"
              />
              <ActionCard
                icon={<MessageSquare className="h-6 w-6" />}
                title="Mis comentarios"
                description="Ver tus comentarios en el blog"
                href="/dashboard/comments"
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-violet-500/10 p-2 text-violet-500">{icon}</div>
        <div>
          <p className="text-xs text-zinc-500">{title}</p>
          <p className="text-sm font-medium text-white truncate">{value}</p>
        </div>
      </div>
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
      className="group flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-violet-500/50 hover:bg-zinc-900"
    >
      <div className="rounded-lg bg-violet-500/10 p-3 text-violet-500 group-hover:bg-violet-500 group-hover:text-white transition">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-white group-hover:text-violet-400">{title}</h3>
        <p className="mt-1 text-sm text-zinc-400">{description}</p>
      </div>
    </Link>
  );
}
