"use client";

import { Heart, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

import { Link } from "@/i18n/navigation";

interface Favorite {
  id: string;
  title: string;
  type: "Noticia" | "Guía" | "Multimedia" | "Blog";
  savedAt: string;
}

const mockFavorites: Favorite[] = [
  { id: "1", title: "Elden Ring 2: Todo lo que sabemos", type: "Noticia", savedAt: "Hoy" },
  { id: "2", title: "The Witcher 4 - Análisis gráfico en 4K", type: "Multimedia", savedAt: "Ayer" },
  { id: "3", title: "Guía: 100% Zelda Tears of the Kingdom", type: "Guía", savedAt: "Hace 3 días" },
  { id: "4", title: "Entrevista: Hideo Kojima sobre OD", type: "Blog", savedAt: "Hace 1 semana" },
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>(mockFavorites);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleRemove(id: string) {
    setDeletingId(id);
    await new Promise((r) => setTimeout(r, 300));
    setFavorites(favorites.filter((f) => f.id !== id));
    setDeletingId(null);
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Favoritos</h1>
        <p className="mt-1 text-sm text-zinc-400">Contenido que has guardado para leer más tarde</p>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-zinc-600" />
          <p className="mt-4 text-zinc-500">No tienes favoritos guardados</p>
          <Link href="/news" className="mt-2 inline-block text-sm text-violet-400 hover:text-violet-300">
            Explorar noticias
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-violet-500/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                <Heart className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href="#" className="text-sm font-medium text-white hover:text-violet-400 transition">
                  {fav.title}
                </Link>
                <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5">{fav.type}</span>
                  <span>·</span>
                  <span>Guardado {fav.savedAt}</span>
                </div>
              </div>
              <button
                onClick={() => handleRemove(fav.id)}
                disabled={deletingId === fav.id}
                className="rounded-lg p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                title="Quitar de favoritos"
              >
                {deletingId === fav.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
