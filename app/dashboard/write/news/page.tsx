"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function WriteNewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
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
      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Error al crear la noticia");
      }

      router.push("/dashboard/my-news");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-white">Nueva Noticia</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Título</label>
              <input
                name="title"
                type="text"
                required
                placeholder="Título de la noticia"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Slug (URL)</label>
              <input
                name="slug"
                type="text"
                required
                placeholder="titulo-de-la-noticia"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Extracto</label>
            <input
              name="excerpt"
              type="text"
              placeholder="Breve resumen de la noticia"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">URL de imagen</label>
            <input
              name="cover_image"
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Contenido</label>
            <textarea
              name="content"
              required
              rows={12}
              placeholder="Escribe el contenido completo de la noticia..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2">
              <input
                name="published"
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-violet-600"
              />
              <span className="text-sm text-zinc-300">Publicar inmediatamente</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                name="featured"
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-violet-600"
              />
              <span className="text-sm text-zinc-300">Destacada</span>
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-2 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {loading ? "Guardando..." : "Guardar"}
            </button>

            <Link
              href="/dashboard"
              className="rounded-lg border border-zinc-700 px-6 py-2 font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
