import type { Event } from "@/lib/neon";
import { MapPin } from "lucide-react";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.start_date);

  const month = startDate.toLocaleDateString("es-ES", { month: "short" }).toUpperCase();
  const day = startDate.getDate();

  const typeColors: Record<string, string> = {
    launch: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
    convention: "border-blue-500/30 bg-blue-500/5 text-blue-400",
    expo: "border-amber-500/30 bg-amber-500/5 text-amber-400",
  };

  const typeLabels: Record<string, string> = {
    launch: "Lanzamiento",
    convention: "Convención",
    expo: "Expo",
  };

  return (
    <div className="group flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-violet-500/30 hover:bg-zinc-900">
      {/* Date badge */}
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
          {month}
        </span>
        <span className="text-xl font-bold text-white">{day}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              typeColors[event.type] || typeColors.convention
            }`}
          >
            {typeLabels[event.type] || event.type}
          </span>
        </div>
        <h4 className="truncate text-base font-semibold text-white group-hover:text-violet-400 transition">
          {event.title}
        </h4>
        {event.location && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}
