import { ArrowLeft, Edit, Eye, Trash2 } from "lucide-react";

import Link from "next/link";
import type { NewsPost } from "@/lib/neon";
import { auth } from "@/auth";
import { query } from "@/lib/neon";
import { redirect } from "next/navigation";

export default async function MyNewsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role as string;
  if (!["admin", "redactor"].includes(userRole)) {
    redirect("/dashboard");
  }

  // Si es admin, ve todas; si es redactor, solo las suyas
  const news = await query<NewsPost & { author_name: string }>(
    userRole === "admin"
      ? `SELECT n.*, p.name as author_name 
         FROM news_posts n 
         LEFT JOIN profiles p ON n.author_id = p.id 
         ORDER BY n.created_at DESC`
      : `SELECT n.*, p.name as author_name 
         FROM news_posts n 
         LEFT JOIN profiles p ON n.author_id = p.id 
         WHERE n.author_id = $1 
         ORDER BY n.created_at DESC`,
    userRole === "admin" ? [] : [session.user.id]
  );

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-white">
              {userRole === "admin" ? "Todas las Noticias" : "Mis Noticias"}
            </h1>
          </div>

          <Link
            href="/dashboard/write/news"
            className="rounded-lg bg-violet-600 px-4 py-2 text-base font-medium text-white hover:bg-violet-700"
          >
            + Nueva Noticia
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {news?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500">No hay noticias aún</p>
            <Link
              href="/dashboard/write/news"
              className="mt-4 inline-block text-violet-400 hover:text-violet-300"
            >
              Crear la primera noticia
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
            <table className="w-full">
              <thead className="border-b border-zinc-800 bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 text-left text-base font-medium text-zinc-400">Título</th>
                  <th className="px-4 py-3 text-left text-base font-medium text-zinc-400">Autor</th>
                  <th className="px-4 py-3 text-left text-base font-medium text-zinc-400">Estado</th>
                  <th className="px-4 py-3 text-left text-base font-medium text-zinc-400">Fecha</th>
                  <th className="px-4 py-3 text-right text-base font-medium text-zinc-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {news?.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{item.title}</div>
                      <div className="text-base text-zinc-500">/{item.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-base text-zinc-400">{item.author_name}</td>
                    <td className="px-4 py-3">
                      {item.published ? (
                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-base font-medium text-green-400">
                          Publicada
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-1 text-base font-medium text-yellow-400">
                          Borrador
                        </span>
                      )}
                      {item.featured && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-violet-500/10 px-2 py-1 text-base font-medium text-violet-400">
                          Destacada
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-base text-zinc-400">
                      {new Date(item.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/news/${item.slug}`}
                          target="_blank"
                          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                          title="Ver"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/edit/news/${item.id}`}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <form
                          action={`/api/news/${item.id}/delete`}
                          method="POST"
                          className="inline"
                        >
                          <button
                            type="submit"
                            className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                            title="Eliminar"
                            onClick={(e) => {
                              if (!confirm("¿Eliminar esta noticia?")) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
