"use client";

import { Calendar, Clock, PenLine, Plus } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { useState } from "react";

interface ScheduledItem {
  id: string;
  title: string;
  date: string;
  time: string;
  status: "scheduled" | "draft";
}

const mockItems: ScheduledItem[] = [
  { id: "1", title: "E3 2026: Predicciones y rumores", date: "22 Mayo 2026", time: "09:00", status: "scheduled" },
  { id: "2", title: "Review: Hades II", date: "25 Mayo 2026", time: "14:00", status: "scheduled" },
  { id: "3", title: "Guía: 100% Zelda TOTK", date: "28 Mayo 2026", time: "10:00", status: "draft" },
  { id: "4", title: "Análisis: Stellar Blade", date: "30 Mayo 2026", time: "11:00", status: "scheduled" },
];

export default function SchedulePage() {
  const [items] = useState(mockItems);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Programación</h1>
          <p className="mt-1 text-sm text-zinc-400">Planifica y programa tus publicaciones</p>
        </div>
        <Link
          href="/dashboard/write/news"
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition"
        >
          <Plus className="h-4 w-4" />
          Programar nueva
        </Link>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-violet-500/30"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.date} · {item.time}
                </span>
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                item.status === "scheduled"
                  ? "bg-violet-500/10 text-violet-400"
                  : "bg-amber-500/10 text-amber-400"
              }`}
            >
              {item.status === "scheduled" ? "Programada" : "Borrador"}
            </span>
            <Link
              href={`/dashboard/write/news?draft=${item.id}`}
              className="shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              title="Editar"
            >
              <PenLine className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
