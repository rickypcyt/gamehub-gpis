import { Calendar, Gamepad2, Newspaper, Trophy, Users, Video } from "lucide-react";
import type { Event, Game, NewsPost } from "@/lib/neon";
import { cachedQuery, query } from "@/lib/neon";

import { EventCard } from "@/components/features/home/EventCard";
import { HeroSection } from "@/components/features/home/HeroSection";
import { NewsCard } from "@/components/features/home/NewsCard";
import { QuickNavCard } from "@/components/features/home/QuickNavCard";
import { RankingsPreview } from "@/components/features/home/RankingsPreview";
import { SectionHeader } from "@/components/features/home/SectionHeader";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales, defaultLocale, type Locale } from "@/i18n/config";

export const revalidate = 300; // Cache 5 minutos
export const dynamic = 'force-static';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

async function getFeaturedNews(): Promise<NewsPost[]> {
  try {
    return await cachedQuery<NewsPost>(
      `SELECT np.*, p.name as author_name, p.avatar_url as author_avatar 
       FROM news_posts np 
       LEFT JOIN profiles p ON np.author_id = p.id 
       WHERE np.published = true 
       ORDER BY np.created_at DESC 
       LIMIT 4`
    );
  } catch {
    return [];
  }
}

async function getTopGames(): Promise<Game[]> {
  try {
    return await query<Game>(
      `SELECT * FROM games 
       WHERE category = 'Top de la historia'
       ORDER BY id ASC
       LIMIT 10`
    );
  } catch {
    return [];
  }
}

async function getUpcomingEvents(): Promise<Event[]> {
  try {
    return await cachedQuery<Event>(
      `SELECT * FROM events 
       WHERE start_date >= NOW() 
       ORDER BY start_date ASC 
       LIMIT 4`
    );
  } catch {
    return [];
  }
}

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams?.locale ?? defaultLocale) as Locale;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "home" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tEvents = await getTranslations({ locale, namespace: "events" });

  const [featuredNews, topGames, upcomingEvents] = await Promise.all([
    getFeaturedNews(),
    getTopGames(),
    getUpcomingEvents(),
  ]);

  const featuredNewsWithImage = featuredNews.filter((news) => Boolean(news.cover_image));
  const newsCards = featuredNewsWithImage.length > 0 ? featuredNewsWithImage : featuredNews;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <HeroSection />

      {/* Main Content - Grid 12 columns */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Quick Navigation */}
        <section className="mb-16">
          <SectionHeader
            icon={Gamepad2}
            title={t("quickNav")}
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <QuickNavCard
              icon={Newspaper}
              title={tNav("news")}
              description={t("features.news.description")}
              href="/news"
            />
            <QuickNavCard
              icon={Trophy}
              title={tNav("games")}
              description={t("features.rankings.description")}
              href="/games"
            />
            <QuickNavCard
              icon={Video}
              title={tNav("multimedia")}
              description={t("features.multimedia.description")}
              href="/multimedia"
            />
            <QuickNavCard
              icon={Calendar}
              title={tNav("events")}
              description={t("features.events.description")}
              href="/events"
            />
            <QuickNavCard
              icon={Users}
              title={tNav("blog")}
              description={t("features.blog.description")}
              href="/blog"
            />
            <QuickNavCard
              icon={Gamepad2}
              title={t("features.community.title")}
              description={t("features.community.description")}
              href="/login"
            />
          </div>
        </section>

        {/* Two Column Layout: News + Events */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Latest News - 8 columns */}
          <section className="lg:col-span-8">
            <SectionHeader
              icon={Newspaper}
              title={t("latestNews")}
              href="/news"
              linkText={t("viewAll")}
            />
            {newsCards.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {newsCards.map((news) => (
                  <NewsCard key={news.id} news={news} locale={locale} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-500">
                {t("empty.noNews")}
              </div>
            )}
          </section>

          {/* Upcoming Events - 4 columns */}
          <section className="lg:col-span-4">
            <SectionHeader
              icon={Calendar}
              title={t("upcomingEvents")}
              href="/events"
              linkText={t("viewAllEvents")}
            />
            {upcomingEvents.length > 0 ? (
              <div className="flex flex-col gap-4">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    locale={locale}
                    typeLabels={{
                      launch: tEvents("types.launch"),
                      convention: tEvents("types.convention"),
                      expo: tEvents("types.expo"),
                      tournament: tEvents("types.tournament"),
                      other: tEvents("types.other"),
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-500">
                {t("empty.noEvents")}
              </div>
            )}
          </section>
        </div>

        {/* Top Videojuegos - Full Width */}
        {topGames.length > 0 && (
          <section className="mt-16">
            <SectionHeader
              icon={Trophy}
              title={t("topGames")}
              href="/games"
              linkText={t("viewRanking")}
            />
            <RankingsPreview games={topGames} />
          </section>
        )}
      </div>
    </div>
  );
}
