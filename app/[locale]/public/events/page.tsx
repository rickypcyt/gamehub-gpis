import { Calendar, Clock, ExternalLink, MapPin } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Event } from "@/lib/neon";
import { Link } from "@/i18n/navigation";
import { cachedQuery } from "@/lib/neon";
import { locales, defaultLocale, type Locale } from "@/i18n/config";
import { capitalizeMonth } from "@/lib/date-utils";

export const revalidate = 300; // Cache 5 minutos
export const dynamic = 'force-static';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type TranslateFn = (key: string, values?: Record<string, unknown>) => string;

interface EventsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function EventsPage({ params }: EventsPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams?.locale ?? defaultLocale) as Locale;
  setRequestLocale(locale);

  const t = (await getTranslations({ locale, namespace: "events" })) as TranslateFn;
  const localeTag = locale === "en" ? "en-US" : "es-ES";
  // Get events from today onwards and past events from last 30 days
  const events = await cachedQuery<Event>(
    `SELECT * FROM events 
     WHERE start_date >= NOW() - INTERVAL '30 days'
     ORDER BY start_date ASC`
  );

  // Group events by month for timeline
  const eventsByMonth = groupEventsByMonth(events || [], localeTag);

  // Get upcoming events for the "next" highlight
  const upcomingEvents = events?.filter(e => new Date(e.start_date) >= new Date()) || [];
  const nextEvent = upcomingEvents[0];

  return (
    <div className="min-h-screen bg-zinc-950">

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
          <p className="mt-2 text-zinc-400">{t("subtitle")}</p>
        </div>

        {/* Next Event Highlight */}
        {nextEvent && (
          <div className="mb-12 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-purple-500/10 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-3 py-1 text-sm font-medium text-violet-400">
                  <Clock className="h-3 w-3" />
                  {t("nextEvent.label")}
                </span>
                <h2 className="mt-3 text-2xl font-bold text-white">{nextEvent.title}</h2>
                <p className="mt-1 text-zinc-400">{nextEvent.location || t("nextEvent.locationFallback")}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">
                    {new Date(nextEvent.start_date).getDate()}
                  </p>
                  <p className="text-sm text-violet-400">
                    {capitalizeMonth(new Date(nextEvent.start_date).toLocaleDateString(localeTag, { month: "long" }), localeTag)}
                  </p>
                </div>
                <div className="h-12 w-px bg-violet-500/30" />
                <p className="text-sm text-zinc-400">
                  {t("nextEvent.countdown", { count: getDaysUntil(nextEvent.start_date) })}
                </p>
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
                {t("nextEvent.moreInfo")}
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
                            {capitalizeMonth(new Date(event.start_date).toLocaleDateString(localeTag, {
                              day: "numeric",
                              month: "long",
                            }), localeTag)}
                          </span>
                          <p className="text-sm text-zinc-500">
                            {new Date(event.start_date).toLocaleTimeString(localeTag, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {/* Event Card */}
                        <div className={`ml-10 md:ml-0 md:w-1/2 ${isLeft ? "md:pl-8" : "md:pr-8"}`}>
                          <EventCard event={event} isPast={isPast} localeTag={localeTag} t={t} />
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
            <p className="mt-4 text-zinc-500">{t("empty")}</p>
            <Link href="/" className="mt-4 inline-block text-violet-400 hover:text-violet-300">
              {t("cta.backHome")}
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function groupEventsByMonth(events: Event[], localeTag: string): Record<string, Event[]> {
  const grouped: Record<string, Event[]> = {};

  events.forEach(event => {
    const date = new Date(event.start_date);
    const monthKey = capitalizeMonth(
      date.toLocaleDateString(localeTag, { month: "long", year: "numeric" }),
      localeTag
    );

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

function EventCard({
  event,
  isPast,
  localeTag,
  t,
}: {
  event: Event;
  isPast: boolean;
  localeTag: string;
  t: TranslateFn;
}) {
  const typeColors = {
    launch: "border-green-500/30 bg-green-500/5",
    convention: "border-blue-500/30 bg-blue-500/5",
    expo: "border-violet-500/30 bg-violet-500/5",
  };

  return (
    <div
      className={`rounded-xl border p-4 transition hover:border-violet-500/50 ${
        isPast ? "border-zinc-800 bg-zinc-900/30 opacity-60" : typeColors[event.type] || "border-zinc-700 bg-zinc-900/50"
      }`}
    >
      {/* Mobile date */}
      <div className="mb-2 md:hidden">
        <span className={`text-sm font-medium ${isPast ? "text-zinc-500" : "text-violet-400"}`}>
          {capitalizeMonth(new Date(event.start_date).toLocaleDateString(localeTag, {
            day: "numeric",
            month: "long",
          }), localeTag)}
        </span>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div>
          <span className={`text-sm font-medium uppercase ${
            isPast ? "text-zinc-500" : "text-zinc-400"
          }`}>
            {t(`types.${event.type}`)}
          </span>
          <h3 className={`font-semibold ${isPast ? "text-zinc-500" : "text-white"}`}>
            {event.title}
          </h3>
        </div>
        {event.end_date && event.end_date !== event.start_date && (
          <span className="text-sm text-zinc-500">
            {t("timeline.until", {
              date: new Date(event.end_date).toLocaleDateString(localeTag, {
                day: "numeric",
                month: "short",
              }),
            })}
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
          {t("card.moreInfo")}
        </a>
      )}
    </div>
  );
}

