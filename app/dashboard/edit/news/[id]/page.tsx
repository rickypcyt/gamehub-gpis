"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface NewsPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  published: boolean;
  featured: boolean;
}

export default function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [news, setNews] = useState<NewsPost | null>(null);
  const [id, setId] = useState<string>("");

  useEffect(() => {
    async function loadParams() {
      const { id } = await params;
      setId(id);
      
      // Load news data
      try {
        const response = await fetch(`/api/news/${id}`);
        if (!response.ok) throw new Error("Noticia no encontrada");
        const data = await response.json();
        setNews(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar");
      } finally {
        setLoading(false);
      }
    }
    setLoading(true);
    loadParams();
  }, [params]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      excerpt: formData.get("excerpt") as string,
      content: formData.get("content") as string,
      cover_image: formData.get("cover_image") as string,
      published: formData.get("published") === "on",
      featured: formData.get("featured") === "on",
    };

    try {
      const response = await fetch(`/api/news/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Error al actualizar");
      }

      router.push("/dashboard/my-news");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!news && !loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500">Noticia no encontrada</p>
          <Link href="/dashboard/my-news" className="mt-4 text-violet-400 hover:text-violet-300">
            Volver a mis noticias
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/my-news" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-white">Editar Noticia</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400">
            {error}
          </div>
        )}

        {news && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-base font-medium text-zinc-300">Título</label>
                <input
                  name="title"
                  type="text"
                  required
                  defaultValue={news.title}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-base font-medium text-zinc-300">Slug (URL)</label>
                <input
                  name="slug"
                  type="text"
                  required
                  defaultValue={news.slug}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-base font-medium text-zinc-300">Extracto</label>
              <input
                name="excerpt"
                type="text"
                defaultValue={news.excerpt || ""}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-base font-medium text-zinc-300">URL de imagen</label>
              <input
                name="cover_image"
                type="url"
                defaultValue={news.cover_image || ""}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-base font-medium text-zinc-300">Contenido</label>
              <textarea
                name="content"
                required
                rows={12}
                defaultValue={news.content}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2">
                <input
                  name="published"
                  type="checkbox"
                  defaultChecked={news.published}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-violet-600"
                />
                <span className="text-base text-zinc-300">Publicada</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  name="featured"
                  type="checkbox"
                  defaultChecked={news.featured}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-violet-600"
                />
                <span className="text-base text-zinc-300">Destacada</span>
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-2 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>

              <Link
                href="/dashboard/my-news"
                className="rounded-lg border border-zinc-700 px-6 py-2 font-medium text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
