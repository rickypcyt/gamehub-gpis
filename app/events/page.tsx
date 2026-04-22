import { Calendar, Clock, ExternalLink, MapPin } from "lucide-react";

import type { Event } from "@/lib/neon";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { query } from "@/lib/neon";

export const revalidate = 300;

export default async function EventsPage() {
  // Get events from today onwards and past events from last 30 days
  const events = await query<Event>(
    `SELECT * FROM events 
     WHERE start_date >= NOW() - INTERVAL '30 days'
     ORDER BY start_date ASC`
  );

  // Group events by month for timeline
  const eventsByMonth = groupEventsByMonth(events || []);

  // Get upcoming events for the "next" highlight
  const upcomingEvents = events?.filter(e => new Date(e.start_date) >= new Date()) || [];
  const nextEvent = upcomingEvents[0];

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">Calendario de Eventos</h1>
          <p className="mt-2 text-zinc-400">
            Lanzamientos, ferias y convenciones del mundo gaming
          </p>
        </div>

        {/* Next Event Highlight */}
        {nextEvent && (
          <div className="mb-12 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-purple-500/10 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-3 py-1 text-sm font-medium text-violet-400">
                  <Clock className="h-3 w-3" />
                  Próximo evento
                </span>
                <h2 className="mt-3 text-2xl font-bold text-white">{nextEvent.title}</h2>
                <p className="mt-1 text-zinc-400">{nextEvent.location || "Ubicación por confirmar"}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">
                    {new Date(nextEvent.start_date).getDate()}
                  </p>
                  <p className="text-sm text-violet-400">
                    {new Date(nextEvent.start_date).toLocaleDateString("es-ES", { month: "long" })}
                  </p>
                </div>
                <div className="h-12 w-px bg-violet-500/30" />
                <div className="text-sm text-zinc-400">
                  <p>{getDaysUntil(nextEvent.start_date)} días</p>
                  <p>para el evento</p>
                </div>
              </div>
            </div>
            {nextEvent.url && (
              <a
                href={nextEvent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-violet-400 hover:text-violet-300"
              >
                <ExternalLink className="h-4 w-4" />
                Más información
              </a>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-zinc-800 md:-translate-x-1/2" />

          <div className="space-y-8">
            {Object.entries(eventsByMonth).map(([monthKey, monthEvents]) => (
              <div key={monthKey} className="relative">
                {/* Month Marker */}
                <div className="sticky top-20 z-10 mb-6 flex items-center justify-center">
                  <div className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 shadow-lg">
                    <span className="text-sm font-medium text-white">{monthKey}</span>
                  </div>
                </div>

                {/* Events for this month */}
                <div className="space-y-4">
                  {monthEvents.map((event, eventIndex) => {
                    const isLeft = eventIndex % 2 === 0;
                    const isPast = new Date(event.start_date) < new Date();
                    
                    return (
                      <div
                        key={event.id}
                        className={`relative flex items-start gap-4 md:gap-8 ${
                          isLeft ? "md:flex-row" : "md:flex-row-reverse"
                        }`}
                      >
                        {/* Timeline dot */}
                        <div className="absolute left-4 md:left-1/2 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-zinc-950 bg-violet-500" />

                        {/* Date - left on desktop when isLeft, right when not */}
                        <div className={`hidden md:block md:w-1/2 ${isLeft ? "text-right pr-8" : "text-left pl-8"}`}>
                          <span className={`text-sm font-medium ${isPast ? "text-zinc-500" : "text-violet-400"}`}>
                            {new Date(event.start_date).getDate()} de{" "}
                            {new Date(event.start_date).toLocaleDateString("es-ES", { month: "long" })}
                          </span>
                          <p className="text-xs text-zinc-500">
                            {new Date(event.start_date).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {/* Event Card */}
                        <div className={`ml-10 md:ml-0 md:w-1/2 ${isLeft ? "md:pl-8" : "md:pr-8"}`}>
                          <EventCard event={event} isPast={isPast} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {!events?.length && (
          <div className="py-16 text-center">
            <Calendar className="mx-auto h-12 w-12 text-zinc-600" />
            <p className="mt-4 text-zinc-500">No hay eventos programados</p>
            <Link href="/" className="mt-4 inline-block text-violet-400 hover:text-violet-300">
              ← Volver a inicio
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function groupEventsByMonth(events: Event[]): Record<string, Event[]> {
  const grouped: Record<string, Event[]> = {};
  
  events.forEach(event => {
    const date = new Date(event.start_date);
    const monthKey = date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    
    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(event);
  });
  
  return grouped;
}

function getDaysUntil(dateString: string): number {
  const eventDate = new Date(dateString);
  const today = new Date();
  const diffTime = eventDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function EventCard({ event, isPast }: { event: Event; isPast: boolean }) {
  const typeColors = {
    launch: "border-green-500/30 bg-green-500/5",
    convention: "border-blue-500/30 bg-blue-500/5",
    expo: "border-violet-500/30 bg-violet-500/5",
    tournament: "border-orange-500/30 bg-orange-500/5",
    other: "border-zinc-700 bg-zinc-900/50",
  };

  const typeLabels = {
    launch: "Lanzamiento",
    convention: "Convención",
    expo: "Expo",
    tournament: "Torneo",
    other: "Evento",
  };

  return (
    <div
      className={`rounded-xl border p-4 transition hover:border-violet-500/50 ${
        isPast ? "border-zinc-800 bg-zinc-900/30 opacity-60" : typeColors[event.type] || typeColors.other
      }`}
    >
      {/* Mobile date */}
      <div className="mb-2 md:hidden">
        <span className={`text-sm font-medium ${isPast ? "text-zinc-500" : "text-violet-400"}`}>
          {new Date(event.start_date).getDate()} de{" "}
          {new Date(event.start_date).toLocaleDateString("es-ES", { month: "long" })}
        </span>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div>
          <span className={`text-xs font-medium uppercase ${
            isPast ? "text-zinc-500" : "text-zinc-400"
          }`}>
            {typeLabels[event.type]}
          </span>
          <h3 className={`font-semibold ${isPast ? "text-zinc-500" : "text-white"}`}>
            {event.title}
          </h3>
        </div>
        {event.end_date && event.end_date !== event.start_date && (
          <span className="text-xs text-zinc-500">
            Hasta {new Date(event.end_date).getDate()} de{" "}
            {new Date(event.end_date).toLocaleDateString("es-ES", { month: "short" })}
          </span>
        )}
      </div>

      {event.location && (
        <p className="mt-2 flex items-center gap-1 text-sm text-zinc-400">
          <MapPin className="h-3 w-3" />
          {event.location}
        </p>
      )}

      {event.description && (
        <p className="mt-2 text-sm text-zinc-500 line-clamp-2">{event.description}</p>
      )}

      {event.url && (
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300"
        >
          <ExternalLink className="h-3 w-3" />
          Más info
        </a>
      )}
    </div>
  );
}

