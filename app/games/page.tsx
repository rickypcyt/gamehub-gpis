import { ArrowLeft, Calendar, Star, Trophy } from "lucide-react";

import type { Game } from "@/lib/neon";
import Link from "next/link";
import { query } from "@/lib/neon";

export default async function GamesPage() {
  const games = await query<Game>(
    "SELECT * FROM games ORDER BY press_score DESC NULLS LAST"
  );

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="flex items-center gap-2 text-xl font-bold text-white">
              <Trophy className="h-6 w-6 text-violet-500" />
              Rankings
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Mejores videojuegos</h2>
          <p className="mt-2 text-zinc-400">
            Los títulos más aclamados por la prensa y la comunidad
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games?.map((game, index) => (
            <GameCard key={game.id} game={game} rank={index + 1} />
          ))}
        </div>

        {!games?.length && (
          <div className="text-center py-16">
            <Trophy className="mx-auto h-12 w-12 text-zinc-600" />
            <p className="mt-4 text-zinc-500">No hay juegos registrados aún</p>
          </div>
        )}
      </main>
    </div>
  );
}

function GameCard({ game, rank }: { game: Game; rank: number }) {
  const pressScore = game.press_score || 0;
  const userScore = game.user_score || 0;

  return (
    <div className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden transition hover:border-violet-500/50">
      {/* Rank Badge */}
      <div className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 font-bold text-white">
        {rank}
      </div>

      {/* Cover Image */}
      <div className="aspect-[3/4] bg-zinc-800">
        {game.cover_image ? (
          <img
            src={game.cover_image}
            alt={game.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Trophy className="h-16 w-16 text-zinc-700" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white line-clamp-1">{game.title}</h3>
        
        {game.release_date && (
          <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
            <Calendar className="h-3 w-3" />
            {new Date(game.release_date).getFullYear()}
          </p>
        )}

        {/* Scores */}
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-medium text-white">{pressScore.toFixed(1)}</span>
            <span className="text-xs text-zinc-500">prensa</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-violet-500 text-violet-500" />
            <span className="text-sm font-medium text-white">{userScore.toFixed(1)}</span>
            <span className="text-xs text-zinc-500">users</span>
          </div>
        </div>

        {/* Genres */}
        {game.genre && game.genre.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {game.genre.slice(0, 3).map((g) => (
              <span
                key={g}
                className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
