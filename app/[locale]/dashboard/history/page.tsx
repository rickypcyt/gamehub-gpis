"use client";

import { BookOpen, Clock } from "lucide-react";
import { useState } from "react";

import { Link } from "@/i18n/navigation";

interface HistoryItem {
  id: string;
  title: string;
  type: string;
  readAt: string;
}

const mockHistory: HistoryItem[] = [
  { id: "1", title: "Elden Ring 2: Todo lo que sabemos", type: "Noticia", readAt: "Hoy, 14:30" },
  { id: "2", title: "Nintendo Switch 2: Precio y fecha confirmada", type: "Noticia", readAt: "Hoy, 10:15" },
  { id: "3", title: "Top 10 RPGs de 2026", type: "Ranking", readAt: "Ayer, 18:45" },
  { id: "4", title: "Entrevista: Hideo Kojima", type: "Blog", readAt: "20 May, 09:00" },
  { id: "5", title: "Review en profundidad: Black Myth Wukong", type: "Análisis", readAt: "19 May, 20:30" },
  { id: "6", title: "Guía: Todos los coleccionables de Metroid Prime 4", type: "Guía", readAt: "18 May, 16:00" },
];

export default function HistoryPage() {
  const [history] = useState<HistoryItem[]>(mockHistory);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Historial de lectura</h1>
        <p className="mt-1 text-sm text-zinc-400">Artículos que has visitado recientemente</p>
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-zinc-600" />
          <p className="mt-4 text-zinc-500">Aún no has leído ningún artículo</p>
          <Link href="/news" className="mt-2 inline-block text-sm text-violet-400 hover:text-violet-300">
            Explorar contenido
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-violet-500/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href="#" className="text-sm font-medium text-white hover:text-violet-400 transition">
                  {item.title}
                </Link>
                <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5">{item.type}</span>
                </div>
              </div>
              <span className="flex items-center gap-1 shrink-0 text-xs text-zinc-500">
                <Clock className="h-3 w-3" />
                {item.readAt}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
