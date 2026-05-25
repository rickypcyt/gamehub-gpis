import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Heart,
  MessageSquare,
  Newspaper,
  PenLine,
  ShieldAlert,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { query, queryOne } from "@/lib/neon";

import { Link } from "@/i18n/navigation";
import type { Profile } from "@/lib/neon";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await queryOne<Profile>(
    "SELECT * FROM profiles WHERE id = $1",
    [session.user.id]
  );

  const role = session.user.role || "suscriptor";

  // Stats for admin
  const totalUsers = role === "admin" ? await query<{ c: number }>("SELECT COUNT(*) as c FROM profiles") : null;
  const totalComments = role === "admin" ? await query<{ c: number }>("SELECT COUNT(*) as c FROM comments") : null;
  const totalNews = role === "admin" ? await query<{ c: number }>("SELECT COUNT(*) as c FROM news_posts") : null;
  const pendingComments = role === "admin" ? await query<{ c: number }>("SELECT COUNT(*) as c FROM comments WHERE created_at > NOW() - INTERVAL '7 days'") : null;

  // Redactor stats
  const myNews = (role === "redactor" || role === "admin") 
    ? await query<{ id: string; title: string; published: boolean; created_at: string }>("SELECT id, title, published, created_at FROM news_posts WHERE author_id = $1 ORDER BY created_at DESC LIMIT 5", [session.user.id])
    : null;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          ¡Hola, {profile?.name?.split(' ')[0] || "Usuario"}!
        </h1>
        <p className="mt-1 text-sm text-zinc-400 capitalize">
          {role === "admin" && "Panel de control total de la plataforma"}
          {role === "redactor" && "Crea y gestiona contenido editorial"}
          {role === "suscriptor" && "Participa en la comunidad gaming"}
        </p>
      </div>

      {/* ============= ADMIN DASHBOARD ============= */}
      {role === "admin" && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Usuarios" value={String(totalUsers?.[0]?.c ?? 0)} icon={<Users className="h-5 w-5" />} trend="+12%" />
            <StatCard title="Noticias" value={String(totalNews?.[0]?.c ?? 0)} icon={<Newspaper className="h-5 w-5" />} trend="+5" />
            <StatCard title="Comentarios" value={String(totalComments?.[0]?.c ?? 0)} icon={<MessageSquare className="h-5 w-5" />} trend="+24%" />
            <StatCard title="Esta semana" value={String(pendingComments?.[0]?.c ?? 0)} icon={<TrendingUp className="h-5 w-5" />} trend="nuevo" />
          </div>

          {/* Row: Moderation + Quick Actions */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Moderation Panel */}
            <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
                <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                  <ShieldAlert className="h-5 w-5 text-amber-400" />
                  Moderación de comentarios
                </h2>
                <Link href="/dashboard/comments" className="text-sm text-violet-400 hover:text-violet-300">
                  Ver todos
                </Link>
              </div>
              <div className="divide-y divide-zinc-800">
                <CommentModerationRow author="AlexM" content="Este juego es una basura completa..." post="Review Elden Ring" status="flagged" />
                <CommentModerationRow author="GameLover" content="Gran artículo, gracias por la info!" post="Nuevos indies 2026" status="approved" />
                <CommentModerationRow author="SpamBot" content="Visita mi sitio web para ganar dinero..." post="Top RPGs" status="pending" />
                <CommentModerationRow author="MariaG" content="¿Cuándo sale la próxima actualización?" post="Roadmap 2026" status="approved" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="border-b border-zinc-800 px-6 py-4">
                <h2 className="text-base font-semibold text-white">Acciones rápidas</h2>
              </div>
              <div className="p-4 space-y-2">
                <QuickAction href="/admin/users" icon={<Users className="h-4 w-4" />} label="Gestionar usuarios" />
                <QuickAction href="/dashboard/write/news" icon={<PenLine className="h-4 w-4" />} label="Crear noticia" />
                <QuickAction href="/admin/settings" icon={<BarChart3 className="h-4 w-4" />} label="Ver estadísticas" />
                <QuickAction href="/dashboard/my-news" icon={<Newspaper className="h-4 w-4" />} label="Editar noticias" />
              </div>
            </div>
          </div>

          {/* News Management Table */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                <Newspaper className="h-5 w-5 text-violet-400" />
                Gestión de noticias
              </h2>
              <Link href="/dashboard/my-news" className="text-sm text-violet-400 hover:text-violet-300">
                Ver todas
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-zinc-500">Título</th>
                    <th className="px-6 py-3 text-left font-medium text-zinc-500">Autor</th>
                    <th className="px-6 py-3 text-left font-medium text-zinc-500">Estado</th>
                    <th className="px-6 py-3 text-left font-medium text-zinc-500">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  <TableRow title="Elden Ring 2: Todo lo que sabemos" author="Carlos R." status="published" date="21 May 2026" />
                  <TableRow title="Nintendo Switch 2: Precio y fecha" author="Ana L." status="draft" date="20 May 2026" />
                  <TableRow title="Top 10 indies del mes" author="Pedro M." status="published" date="18 May 2026" />
                  <TableRow title="Guía completa de Black Myth" author="Carlos R." status="review" date="15 May 2026" />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============= REDACTOR DASHBOARD ============= */}
      {(role === "redactor" || role === "admin") && role !== "admin" && (
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ActionCard
              icon={<PenLine className="h-6 w-6" />}
              title="Nueva Noticia"
              description="Crea contenido editorial"
              href="/dashboard/write/news"
            />
            <ActionCard
              icon={<FileText className="h-6 w-6" />}
              title="Borradores"
              description="Continúa tus borradores"
              href="/dashboard/drafts"
              badge="3"
            />
            <ActionCard
              icon={<Calendar className="h-6 w-6" />}
              title="Programar"
              description="Planifica publicaciones"
              href="/dashboard/schedule"
            />
            <ActionCard
              icon={<Newspaper className="h-6 w-6" />}
              title="Mis Noticias"
              description="Gestiona tus artículos"
              href="/dashboard/my-news"
            />
          </div>

          {/* Drafts + Schedule */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* My Drafts */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-400" />
                  Mis borradores
                </h2>
                <Link href="/dashboard/drafts" className="text-sm text-violet-400 hover:text-violet-300">Ver todos</Link>
              </div>
              <div className="divide-y divide-zinc-800">
                <DraftRow title="Análisis: Stellar Blade" lastEdit="Hace 2 horas" words="1,240" />
                <DraftRow title="Rumor: nuevo hardware Sony" lastEdit="Ayer" words="890" />
                <DraftRow title="Entrevista: Dev indie español" lastEdit="Hace 3 días" words="2,100" />
              </div>
            </div>

            {/* Schedule */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                  Programadas
                </h2>
                <Link href="/dashboard/schedule" className="text-sm text-violet-400 hover:text-violet-300">Calendario</Link>
              </div>
              <div className="divide-y divide-zinc-800">
                <ScheduledRow title="E3 2026: Predicciones" date="22 May, 09:00" status="scheduled" />
                <ScheduledRow title="Review: Hades II" date="25 May, 14:00" status="scheduled" />
                <ScheduledRow title="Guía: 100% Zelda TOTK" date="28 May, 10:00" status="draft" />
              </div>
            </div>
          </div>

          {/* Recent News */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
              <h2 className="text-base font-semibold text-white">Publicaciones recientes</h2>
              <Link href="/dashboard/my-news" className="text-sm text-violet-400 hover:text-violet-300">Ver todas</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-zinc-500">Título</th>
                    <th className="px-6 py-3 text-left font-medium text-zinc-500">Estado</th>
                    <th className="px-6 py-3 text-left font-medium text-zinc-500">Vistas</th>
                    <th className="px-6 py-3 text-left font-medium text-zinc-500">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {myNews && myNews.length > 0 ? myNews.map((n: { id: string; title: string; published: boolean; created_at: string }) => (
                    <TableRow key={n.id} title={n.title} author="" status={n.published ? "published" : "draft"} date={new Date(n.created_at).toLocaleDateString("es-ES")} />
                  )) : (
                    <>
                      <TableRow title="Elden Ring 2: Todo lo que sabemos" author="" status="published" date="21 May 2026" views="1.2k" />
                      <TableRow title="Nintendo Switch 2: Precio y fecha" author="" status="published" date="18 May 2026" views="890" />
                      <TableRow title="Top 10 indies del mes" author="" status="draft" date="15 May 2026" views="-" />
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============= SUSCRIPTOR DASHBOARD ============= */}
      {role === "suscriptor" && (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Comentarios" value="12" icon={<MessageSquare className="h-5 w-5" />} />
            <StatCard title="Favoritos" value="8" icon={<Heart className="h-5 w-5" />} />
            <StatCard title="Noticias leídas" value="34" icon={<Eye className="h-5 w-5" />} />
            <StatCard title="Miembro desde" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString("es-ES", { month: "short", year: "numeric" }) : "-"} icon={<Calendar className="h-5 w-5" />} />
          </div>

          {/* Row: Profile + Comments */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 text-violet-500 text-lg font-bold">
                  {profile?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="font-semibold text-white">{profile?.name || "Usuario"}</h2>
                  <p className="text-sm text-zinc-400">{session.user.email}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-zinc-400">
                <div className="flex justify-between"><span>Rol</span><span className="text-zinc-300 capitalize">{role}</span></div>
                <div className="flex justify-between"><span>Ubicación</span><span className="text-zinc-300">{profile?.location || "No especificada"}</span></div>
                <div className="flex justify-between"><span>Website</span><span className="text-zinc-300 truncate max-w-[180px]">{profile?.website || "-"}</span></div>
              </div>
              <Link href="/dashboard/profile" className="mt-4 block w-full rounded-lg border border-zinc-700 px-4 py-2 text-center text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition">
                Editar perfil
              </Link>
            </div>

            {/* Recent Comments */}
            <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-violet-400" />
                  Mis comentarios recientes
                </h2>
                <Link href="/dashboard/comments" className="text-sm text-violet-400 hover:text-violet-300">Ver todos</Link>
              </div>
              <div className="divide-y divide-zinc-800">
                <CommentRow post="Elden Ring 2: Todo lo que sabemos" content="¡Increíble análisis! La parte del combate me tiene hype." date="21 May 2026" />
                <CommentRow post="Nintendo Switch 2: Precio y fecha" content="Espero que no sea tan cara como dicen..." date="19 May 2026" />
                <CommentRow post="Top 10 indies del mes" content="Faltó Hollow Knight en la lista :(" date="15 May 2026" />
              </div>
            </div>
          </div>

          {/* Favorites + History */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Favorites */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-400" />
                  Favoritos
                </h2>
                <Link href="/dashboard/favorites" className="text-sm text-violet-400 hover:text-violet-300">Ver todos</Link>
              </div>
              <div className="divide-y divide-zinc-800">
                <FavoriteRow title="Elden Ring 2: Todo lo que sabemos" type="Noticia" date="Guardado hoy" />
                <FavoriteRow title="The Witcher 4 - Análisis gráfico" type="Multimedia" date="Guardado ayer" />
                <FavoriteRow title="Guía: 100% Zelda Tears of the Kingdom" type="Guía" date="Guardado hace 3 días" />
              </div>
            </div>

            {/* History */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-400" />
                  Historial de lectura
                </h2>
                <Link href="/dashboard/history" className="text-sm text-violet-400 hover:text-violet-300">Ver todo</Link>
              </div>
              <div className="divide-y divide-zinc-800">
                <HistoryRow title="Elden Ring 2: Todo lo que sabemos" type="Noticia" date="Hoy, 14:30" />
                <HistoryRow title="Nintendo Switch 2: Precio y fecha" type="Noticia" date="Hoy, 10:15" />
                <HistoryRow title="Top 10 RPGs de 2026" type="Ranking" date="Ayer, 18:45" />
                <HistoryRow title="Interview: Hideo Kojima" type="Blog" date="20 May, 09:00" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============= UI COMPONENTS ============= */

function StatCard({ title, value, icon, trend }: { title: string; value: string; icon: React.ReactNode; trend?: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-violet-500/30">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg bg-violet-500/10 p-2.5 text-violet-500">{icon}</div>
        {trend && <span className="text-xs font-medium text-emerald-400">{trend}</span>}
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-zinc-500">{title}</p>
    </div>
  );
}

function ActionCard({ icon, title, description, href, badge }: { icon: React.ReactNode; title: string; description: string; href: string; badge?: string }) {
  return (
    <Link href={href} className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-violet-500/50 hover:bg-zinc-900">
      {badge && <span className="absolute top-4 right-4 rounded-full bg-violet-600 px-2 py-0.5 text-xs font-medium text-white">{badge}</span>}
      <div className="mb-3 inline-flex rounded-lg bg-violet-500/10 p-2.5 text-violet-500 transition group-hover:bg-violet-500 group-hover:text-white">{icon}</div>
      <h3 className="text-sm font-semibold text-white group-hover:text-violet-400">{title}</h3>
      <p className="mt-1 text-xs text-zinc-400">{description}</p>
    </Link>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white">
      <span className="text-violet-400">{icon}</span>
      {label}
    </Link>
  );
}

function TableRow({ title, author, status, date, views }: { title: string; author?: string; status: string; date: string; views?: string }) {
  return (
    <tr className="hover:bg-zinc-800/50">
      <td className="px-6 py-3">
        <div className="font-medium text-white">{title}</div>
        {author && <div className="text-xs text-zinc-500">{author}</div>}
      </td>
      {author && <td className="px-6 py-3 text-zinc-400">{author}</td>}
      <td className="px-6 py-3">
        {status === "published" && <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">Publicada</span>}
        {status === "draft" && <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">Borrador</span>}
        {status === "review" && <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">Revisión</span>}
        {status === "scheduled" && <span className="inline-flex items-center rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-400">Programada</span>}
      </td>
      {views !== undefined && <td className="px-6 py-3 text-zinc-400">{views}</td>}
      <td className="px-6 py-3 text-sm text-zinc-400">{date}</td>
    </tr>
  );
}

function CommentModerationRow({ author, content, post, status }: { author: string; content: string; post: string; status: "flagged" | "approved" | "pending" }) {
  return (
    <div className="flex items-start gap-3 px-6 py-3 hover:bg-zinc-800/30">
      <div className="mt-0.5">
        {status === "flagged" && <AlertTriangle className="h-4 w-4 text-red-400" />}
        {status === "approved" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
        {status === "pending" && <Clock className="h-4 w-4 text-amber-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{author}</span>
          <span className="text-xs text-zinc-500">en {post}</span>
        </div>
        <p className="mt-0.5 text-sm text-zinc-400 truncate">{content}</p>
      </div>
      <div className="flex gap-1">
        <button className="rounded p-1 text-emerald-400 hover:bg-emerald-500/10" title="Aprobar"><CheckCircle2 className="h-4 w-4" /></button>
        <button className="rounded p-1 text-red-400 hover:bg-red-500/10" title="Rechazar"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function DraftRow({ title, lastEdit, words }: { title: string; lastEdit: string; words: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-3 hover:bg-zinc-800/30">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        <p className="text-xs text-zinc-500">{lastEdit} · {words} palabras</p>
      </div>
      <Link href="/dashboard/drafts" className="ml-2 text-xs text-violet-400 hover:text-violet-300 shrink-0">Continuar</Link>
    </div>
  );
}

function ScheduledRow({ title, date, status }: { title: string; date: string; status: "scheduled" | "draft" }) {
  return (
    <div className="flex items-center justify-between px-6 py-3 hover:bg-zinc-800/30">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        <p className="text-xs text-zinc-500">{date}</p>
      </div>
      {status === "scheduled" ? (
        <span className="shrink-0 rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-400">Programada</span>
      ) : (
        <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">Borrador</span>
      )}
    </div>
  );
}

function CommentRow({ post, content, date }: { post: string; content: string; date: string }) {
  return (
    <div className="px-6 py-3 hover:bg-zinc-800/30">
      <Link href="#" className="text-sm font-medium text-violet-400 hover:text-violet-300">{post}</Link>
      <p className="mt-1 text-sm text-zinc-300">{content}</p>
      <p className="mt-1 text-xs text-zinc-500">{date}</p>
    </div>
  );
}

function FavoriteRow({ title, type, date }: { title: string; type: string; date: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-3 hover:bg-zinc-800/30">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        <p className="text-xs text-zinc-500">{type}</p>
      </div>
      <span className="shrink-0 text-xs text-zinc-500">{date}</span>
    </div>
  );
}

function HistoryRow({ title, type, date }: { title: string; type: string; date: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-3 hover:bg-zinc-800/30">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        <p className="text-xs text-zinc-500">{type}</p>
      </div>
      <span className="shrink-0 text-xs text-zinc-500">{date}</span>
    </div>
  );
}
