'use client';

import { Calendar, Filter, Search, SlidersHorizontal, Star, Trophy, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { Game } from '@/lib/neon';
import { GameModal } from '@/components/GameModal';

interface GamesClientProps {
  games: Game[];
}

export default function GamesClient({ games }: GamesClientProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [minScore, setMinScore] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique genres and years for filters
  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    games?.forEach(game => game.genre?.forEach(g => genres.add(g)));
    return Array.from(genres).sort();
  }, [games]);

  const allYears = useMemo(() => {
    const years = new Set<number>();
    games?.forEach(game => {
      if (game.release_date) {
        years.add(new Date(game.release_date).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [games]);

  // Filter games
  const filteredGames = useMemo(() => {
    return games?.filter(game => {
      // Search filter
      if (searchQuery && !game.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Genre filter
      if (selectedGenre !== "all" && !game.genre?.includes(selectedGenre)) {
        return false;
      }
      // Year filter
      if (selectedYear !== "all" && game.release_date) {
        const gameYear = new Date(game.release_date).getFullYear().toString();
        if (gameYear !== selectedYear) return false;
      }
      // Score filter
      if (minScore > 0 && (!game.press_score || game.press_score < minScore)) {
        return false;
      }
      return true;
    }) || [];
  }, [games, searchQuery, selectedGenre, selectedYear, minScore]);

  const topHistoryGames = filteredGames?.filter(g => g.category === 'Top de la historia');
  const top2020_2025Games = filteredGames?.filter(g => g.category === 'Top 2020-2025');
  const otherGames = filteredGames?.filter(g => g.category !== 'Top de la historia' && g.category !== 'Top 2020-2025');

  const hasActiveFilters = searchQuery || selectedGenre !== "all" || selectedYear !== "all" || minScore > 0;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGenre("all");
    setSelectedYear("all");
    setMinScore(0);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header with Search and Filters */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Catálogo de Juegos</h1>
          
          {/* Search and Filter Toggle */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar juegos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-10 pr-4 py-2 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2 font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? "border-violet-500 bg-violet-500/10 text-violet-400"
                  : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-1 rounded-full bg-violet-500 px-2 py-0.5 text-sm text-white">
                  {[selectedGenre, selectedYear, minScore > 0 ? "score" : null].filter(Boolean).length + (searchQuery ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Genre Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-400">
                    <Filter className="inline h-3 w-3 mr-1" />
                    Género
                  </label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-violet-500 focus:outline-none"
                  >
                    <option value="all">Todos los géneros</option>
                    {allGenres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-400">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    Año
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-violet-500 focus:outline-none"
                  >
                    <option value="all">Todos los años</option>
                    {allYears.map(year => (
                      <option key={year} value={year.toString()}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Score Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-400">
                    <Star className="inline h-3 w-3 mr-1" />
                    Nota mínima: {minScore > 0 ? minScore : "Todas"}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="w-full accent-violet-500"
                  />
                  <div className="flex justify-between text-sm text-zinc-500">
                    <span>Todas</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300"
                >
                  <X className="h-3 w-3" />
                  Limpiar filtros
                </button>
              )}
            </div>
          )}

          {/* Results count */}
          <p className="mt-4 text-sm text-zinc-500">
            {filteredGames.length} juego{filteredGames.length !== 1 ? 's' : ''} encontrado{filteredGames.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Top de la historia Section */}
        {topHistoryGames && topHistoryGames.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Top de la historia</h2>
              <p className="mt-2 text-zinc-400">
                Los mejores juegos de todos los tiempos según críticos y jugadores
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {topHistoryGames.map((game, index) => (
                <GameCard key={game.id} game={game} rank={index + 1} onClick={() => setSelectedGame(game)} />
              ))}
            </div>
          </div>
        )}

        {/* Top 2020-2025 Section */}
        {top2020_2025Games && top2020_2025Games.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Top 2020-2025</h2>
              <p className="mt-2 text-zinc-400">
                Los mejores títulos de los últimos años mezclando impacto, calidad y consenso general
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {top2020_2025Games.map((game, index) => (
                <GameCard key={game.id} game={game} rank={index + 1} onClick={() => setSelectedGame(game)} />
              ))}
            </div>
          </div>
        )}

        {/* Other Games */}
        {otherGames && otherGames.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Más Juegos</h2>
              <p className="mt-2 text-zinc-400">
                Otros títulos destacados
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherGames.map((game) => (
                <GameCard key={game.id} game={game} onClick={() => setSelectedGame(game)} />
              ))}
            </div>
          </div>
        )}

        {!filteredGames?.length && (
          <div className="text-center py-16">
            <Trophy className="mx-auto h-12 w-12 text-zinc-600" />
            <p className="mt-4 text-zinc-500">
              {hasActiveFilters ? "No hay juegos que coincidan con los filtros" : "No hay juegos registrados aún"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-violet-400 hover:text-violet-300"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} />
    </div>
  );
}

function GameCard({ game, rank, onClick }: { game: Game; rank?: number; onClick: () => void }) {
  const pressScore = Number(game.press_score) || 0;
  const userScore = Number(game.user_score) || 0;

  return (
    <button
      onClick={onClick}
      className="group relative flex w-full rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden transition hover:border-violet-500/50 hover:bg-zinc-900 text-left"
    >
      {/* Cover Image - Left side */}
      <div className="relative aspect-[2/3] w-36 sm:w-44 flex-shrink-0 overflow-hidden bg-zinc-800">
        {game.cover_image ? (
          <img
            src={game.cover_image}
            alt={game.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Trophy className="h-8 w-8 text-zinc-700" />
          </div>
        )}
        {/* Rank Badge - Overlay */}
        {rank && (
          <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 font-bold text-white shadow-lg text-sm">
            {rank}
          </div>
        )}
      </div>

      {/* Info - Right side */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white line-clamp-1">{game.title}</h3>
        </div>

        {/* Description */}
        {game.description && (
          <p className="mt-3 text-sm text-zinc-400 line-clamp-2">{game.description}</p>
        )}

        {/* Scores */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-medium text-white">{pressScore.toFixed(1)}</span>
            <span className="text-sm text-zinc-500">prensa</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-violet-500 text-violet-500" />
            <span className="text-sm font-medium text-white">{userScore.toFixed(1)}</span>
            <span className="text-sm text-zinc-500">usuarios</span>
          </div>
        </div>

        {/* Genres */}
        {game.genre && game.genre.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {game.genre.map((g) => (
              <span
                key={g}
                className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-sm text-zinc-400"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Platforms */}
        {game.platform && game.platform.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {game.platform.map((p) => (
              <span
                key={p}
                className="rounded bg-zinc-800/60 px-2.5 py-0.5 text-sm text-zinc-500"
              >
                {p}
              </span>
            ))}
          </div>
        )}

        {/* Release Date */}
        {game.release_date && (
          <p className="mt-3 flex items-center gap-1 text-sm text-zinc-500">
            <Calendar className="h-3 w-3" />
            {new Date(game.release_date).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        )}
      </div>
    </button>
  );
}
