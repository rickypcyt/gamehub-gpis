import { Calendar, Gamepad2, Newspaper, Trophy, Users, Video } from "lucide-react";
import type { Game, NewsPost } from "@/lib/neon";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import TopGamesClient from "./TopGamesClient";
import { query } from "@/lib/neon";

export const revalidate = 60;

async function getFeaturedNews(): Promise<NewsPost[]> {
  try {
    return await query<NewsPost>(
      `SELECT np.*, p.name as author_name, p.avatar_url as author_avatar 
       FROM news_posts np 
       LEFT JOIN profiles p ON np.author_id = p.id 
       WHERE np.published = true 
       ORDER BY np.created_at DESC 
       LIMIT 3`
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

export default async function HomePage() {
  const [featuredNews, topGames] = await Promise.all([
    getFeaturedNews(),
    getTopGames(),
  ]);

  return (
    <div className="min-h-screen bg-zinc-950 relative">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.3),transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/10 animate-gradient-shift" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 sm:py-32">
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Tu mundo gaming,
            <br />
            <span className="text-violet-500">centralizado</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            Descubre los mejores rankings de videojuegos, mantente al día con noticias en tiempo real, accede a contenido multimedia exclusivo, participa en eventos de la industria y conecta con una comunidad apasionada. GameHub es tu destino definitivo para todo lo relacionado con el mundo de los videojuegos.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/games"
              className="rounded-md bg-violet-600 px-6 py-3 font-medium text-white hover:bg-violet-700"
            >
              Explorar juegos
            </Link>
            <Link
              href="/news"
              className="rounded-md border border-zinc-700 bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800"
            >
              Últimas noticias
            </Link>
          </div>
        </div>
      </section>

      {/* Features - Navegación Rápida */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Navegación Rápida</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Newspaper className="h-6 w-6" />}
              title="Noticias en tiempo real"
              description="Mantente informado con las últimas novedades del sector gaming."
              href="/news"
            />
            <FeatureCard
              icon={<Trophy className="h-6 w-6" />}
              title="Rankings de juegos"
              description="Los mejores videojuegos de la historia según prensa y comunidad."
              href="/games"
            />
            <FeatureCard
              icon={<Video className="h-6 w-6" />}
              title="Hub multimedia"
              description="Videos, streams y trailers de tus juegos favoritos."
              href="/multimedia"
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Agenda de eventos"
              description="No te pierdas ningún lanzamiento, feria o convención."
              href="/events"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Blog de opinión"
              description="Análisis y opiniones de figuras destacadas del sector."
              href="/blog"
            />
            <FeatureCard
              icon={<Gamepad2 className="h-6 w-6" />}
              title="Comunidad"
              description="Participa en comentarios y conecta con otros gamers."
              href="/login"
            />
          </div>
        </div>
      </section>

      {/* Featured News */}
      {featuredNews.length > 0 && (
        <section className="px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Newspaper className="h-6 w-6 text-violet-500" />
                Noticias Destacadas
              </h2>
              <Link href="/news" className="text-violet-400 hover:text-violet-300">
                Ver todas →
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredNews.map((news) => (
                <Link
                  key={news.id}
                  href={`/news/${news.slug}`}
                  className="group rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden transition hover:border-violet-500/50"
                >
                  {news.cover_image && (
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={news.cover_image}
                        alt={news.title}
                        fill
                        className="object-cover transition group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-white group-hover:text-violet-400 line-clamp-2">
                      {news.title}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
                      {news.excerpt}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
                      <span>{news.author_name || "Redacción"}</span>
                      <span>•</span>
                      <span>{new Date(news.created_at).toLocaleDateString("es-ES")}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top 10 de la Historia */}
      {topGames.length > 0 && (
        <section className="px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Trophy className="h-6 w-6 text-violet-500" />
                Top 10 de la Historia
              </h2>
              <Link href="/games" className="text-violet-400 hover:text-violet-300">
                Ver ranking completo →
              </Link>
            </div>
            <TopGamesClient games={topGames} />
          </div>
        </section>
      )}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-violet-500/50 hover:bg-zinc-900"
    >
      <div className="mb-4 inline-flex rounded-lg bg-violet-500/10 p-3 text-violet-500">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-violet-400">
        {title}
      </h3>
      <p className="text-base text-zinc-400">{description}</p>
    </Link>
  );
}

