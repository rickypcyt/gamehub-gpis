import { Calendar, Gamepad2, LayoutDashboard, Newspaper, Trophy, Users, Video } from "lucide-react";

import Link from "next/link";
import { auth } from "@/auth";

export const revalidate = 60;

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
            <Gamepad2 className="h-6 w-6 text-violet-500" />
            GameHub
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
            <Link href="/news" className="hover:text-white">Noticias</Link>
            <Link href="/games" className="hover:text-white">Juegos</Link>
            <Link href="/blog" className="hover:text-white">Blog</Link>
            <Link href="/multimedia" className="hover:text-white">Multimedia</Link>
            <Link href="/events" className="hover:text-white">Eventos</Link>
            <Link href="/team" className="hover:text-white">Equipo</Link>
          </nav>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.3),transparent)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Tu mundo gaming,
            <br />
            <span className="text-violet-500">centralizado</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            Noticias, rankings, eventos y comunidad. Todo lo que necesitas para estar al día en la industria del videojuego.
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

      {/* Features */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
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

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-zinc-500">
              © 2025 GameHub. Proyecto académico.
            </p>
            <div className="flex gap-6 text-sm text-zinc-500">
              <Link href="/contact" className="hover:text-white">Contacto</Link>
              <Link href="/team" className="hover:text-white">Equipo</Link>
            </div>
          </div>
        </div>
      </footer>
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
      <p className="text-sm text-zinc-400">{description}</p>
    </Link>
  );
}

