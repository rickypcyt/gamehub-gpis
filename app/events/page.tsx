import { ArrowLeft, Calendar, ExternalLink, MapPin } from "lucide-react";

import type { Event } from "@/lib/neon";
import Link from "next/link";
import { query } from "@/lib/neon";

export default async function EventsPage() {
  const events = await query<Event>(
    "SELECT * FROM events WHERE start_date >= NOW() ORDER BY start_date ASC"
  );

  const launches = events?.filter((e) => e.type === "launch");
  const conventions = events?.filter((e) => e.type === "convention");
  const expos = events?.filter((e) => e.type === "expo");

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="flex items-center gap-2 text-xl font-bold text-white">
              <Calendar className="h-6 w-6 text-violet-500" />
              Agenda
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Próximos eventos</h2>
          <p className="mt-2 text-zinc-400">
            Lanzamientos, ferias y convenciones del mundo gaming
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <EventColumn title="Lanzamientos" events={launches || []} color="green" />
          <EventColumn title="Convenciones" events={conventions || []} color="blue" />
          <EventColumn title="Expos" events={expos || []} color="purple" />
        </div>

        {!events?.length && (
          <div className="py-16 text-center">
            <Calendar className="mx-auto h-12 w-12 text-zinc-600" />
            <p className="mt-4 text-zinc-500">No hay eventos programados</p>
          </div>
        )}
      </main>
    </div>
  );
}

function EventColumn({
  title,
  events,
  color,
}: {
  title: string;
  events: Event[];
  color: "green" | "blue" | "purple";
}) {
  const colorClasses = {
    green: "border-green-500/30 bg-green-500/10 text-green-400",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    purple: "border-violet-500/30 bg-violet-500/10 text-violet-400",
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
      <h3 className={`mb-4 rounded-lg border px-3 py-2 text-sm font-medium ${colorClasses[color]}`}>
        {title}
      </h3>

      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 transition hover:border-zinc-700"
          >
            <h4 className="font-medium text-white">{event.title}</h4>
            
            {event.location && (
              <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                <MapPin className="h-3 w-3" />
                {event.location}
              </p>
            )}

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                {new Date(event.start_date).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              
              {event.url && (
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
                >
                  <ExternalLink className="h-3 w-3" />
                  Más info
                </a>
              )}
            </div>
          </div>
        ))}

        {!events.length && (
          <p className="text-center py-8 text-sm text-zinc-600">
            No hay {title.toLowerCase()} programados
          </p>
        )}
      </div>
    </div>
  );
}
