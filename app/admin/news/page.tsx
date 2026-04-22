import { ArrowLeft, FileText, Plus, Edit3, Trash2, Eye, EyeOff } from "lucide-react";

import Link from "next/link";
import { auth } from "@/auth";
import { query } from "@/lib/neon";
import { redirect } from "next/navigation";

interface NewsPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published: boolean;
  featured: boolean;
  created_at: string;
  author_id: string;
  author_name: string | null;
}

export default async function AdminNewsPage() {
  const session = await auth();

  if (!session?.user || !["admin", "redactor"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const news = await query<NewsPost>(
    `SELECT n.*, p.name as author_name
     FROM news_posts n
     LEFT JOIN profiles p ON n.author_id = p.id
     ORDER BY n.created_at DESC`
  );

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                <FileText className="h-5 w-5 text-violet-400" />
              </div>
              <h1 className="text-xl font-bold text-white">Gestión de Noticias</h1>
            </div>
          </div>
          <Link
            href="/dashboard/write?type=news"
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-base font-medium text-white hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            Nueva Noticia
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
            <p className="text-base text-zinc-400">Total</p>
            <p className="mt-2 text-2xl font-bold text-white">{news.length}</p>
          </div>
          <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
            <p className="text-base text-green-400">Publicadas</p>
            <p className="mt-2 text-2xl font-bold text-white">{news.filter(n => n.published).length}</p>
          </div>
          <div className="rounded-xl border border-zinc-500/20 bg-zinc-500/10 p-4">
            <p className="text-base text-zinc-400">Borradores</p>
            <p className="mt-2 text-2xl font-bold text-white">{news.filter(n => !n.published).length}</p>
          </div>
        </div>

        {/* News Table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-zinc-800 bg-zinc-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-base font-medium text-zinc-400">Título</th>
                  <th className="px-6 py-4 text-left text-base font-medium text-zinc-400">Estado</th>
                  <th className="px-6 py-4 text-left text-base font-medium text-zinc-400">Autor</th>
                  <th className="px-6 py-4 text-left text-base font-medium text-zinc-400">Fecha</th>
                  <th className="px-6 py-4 text-right text-base font-medium text-zinc-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {news.map((item) => {
                  const isCurrentUser = item.author_id === session.user.id;
                  const canEdit = session.user.role === "admin" || isCurrentUser;

                  return (
                    <tr key={item.id} className="hover:bg-zinc-800/30">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">{item.title}</p>
                          <p className="text-sm text-zinc-500">/{item.slug}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {item.published ? (
                            <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400">
                              <Eye className="h-3 w-3" />
                              Publicada
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 rounded-full bg-zinc-500/10 px-3 py-1 text-sm text-zinc-400">
                              <EyeOff className="h-3 w-3" />
                              Borrador
                            </span>
                          )}
                          {item.featured && (
                            <span className="rounded-full bg-violet-500/10 px-2 py-1 text-sm text-violet-400">
                              Destacada
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-base text-zinc-400">{item.author_name || "Desconocido"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-base text-zinc-400">
                          {new Date(item.created_at).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canEdit && (
                            <>
                              <Link
                                href={`/dashboard/edit/${item.id}`}
                                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                title="Editar"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Link>
                              <form
                                action={`/api/news/${item.id}/delete`}
                                method="POST"
                                className="inline"
                                onSubmit={(e) => {
                                  if (!confirm("¿Eliminar esta noticia permanentemente?")) {
                                    e.preventDefault();
                                  }
                                }}
                              >
                                <button
                                  type="submit"
                                  className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </form>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
