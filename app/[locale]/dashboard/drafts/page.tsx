"use client";

import { FileText, PenLine, Trash2 } from "lucide-react";
import { useState } from "react";

import { Link } from "@/i18n/navigation";

const mockDrafts = [
  { id: "1", title: "Análisis: Stellar Blade", excerpt: "El nuevo exclusivo de PS5 sorprende con...", lastEdit: "Hace 2 horas", words: 1240 },
  { id: "2", title: "Rumor: nuevo hardware Sony", excerpt: "Según fuentes cercanas a la compañía...", lastEdit: "Ayer", words: 890 },
  { id: "3", title: "Entrevista: Dev indie español", excerpt: "Hablamos con el equipo detrás de...", lastEdit: "Hace 3 días", words: 2100 },
];

export default function DraftsPage() {
  const [drafts, setDrafts] = useState(mockDrafts);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mis borradores</h1>
          <p className="mt-1 text-sm text-zinc-400">Continúa trabajando en tus noticias en progreso</p>
        </div>
        <Link
          href="/dashboard/write/news"
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition"
        >
          <PenLine className="h-4 w-4" />
          Nueva noticia
        </Link>
      </div>

      {drafts.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-zinc-600" />
          <p className="mt-4 text-zinc-500">No tienes borradores pendientes</p>
          <Link href="/dashboard/write/news" className="mt-2 inline-block text-sm text-violet-400 hover:text-violet-300">
            Crear una noticia
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-violet-500/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white">{draft.title}</h3>
                  <p className="mt-1 text-sm text-zinc-400 truncate">{draft.excerpt}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                    <span>Última edición: {draft.lastEdit}</span>
                    <span>·</span>
                    <span>{draft.words.toLocaleString()} palabras</span>
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  <Link
                    href={`/dashboard/write/news?draft=${draft.id}`}
                    className="flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
                  >
                    <PenLine className="h-3.5 w-3.5" />
                    Editar
                  </Link>
                  <button
                    onClick={() => setDrafts(drafts.filter((d) => d.id !== draft.id))}
                    className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
