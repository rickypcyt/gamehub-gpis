'use client';

import { Star, Trophy } from 'lucide-react';

import type { Game } from '@/lib/neon';
import { GameModal } from '@/components/features/games/GameModal';
import Image from 'next/image';
import { useState } from 'react';

interface RankingsPreviewProps {
  games: Game[];
}

export function RankingsPreview({ games }: RankingsPreviewProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Show top 5 for preview
  const previewGames = games.slice(0, 5);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {previewGames.map((game, index) => (
          <button
            key={game.id}
            onClick={() => setSelectedGame(game)}
            className="group relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 text-left transition hover:border-violet-500/40 hover:bg-zinc-900"
          >
            {/* Rank Badge */}
            <div className="absolute top-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-violet-600 text-sm font-bold text-white shadow-lg">
              {index + 1}
            </div>

            {/* Trophy for #1 */}
            {index === 0 && (
              <div className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/20 text-amber-400">
                <Trophy className="h-4 w-4" />
              </div>
            )}

            {game.cover_image ? (
              <div className="aspect-[3/4] relative overflow-hidden">
                <Image
                  src={game.cover_image}
                  alt={game.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="aspect-[3/4] bg-zinc-800 flex items-center justify-center">
                <Star className="h-10 w-10 text-zinc-600" />
              </div>
            )}

            <div className="p-3">
              <h3 className="text-sm font-semibold text-white group-hover:text-violet-400 line-clamp-1">
                {game.title}
              </h3>
              <div className="mt-1.5 flex items-center gap-2">
                {game.press_score && (
                  <span className="inline-flex items-center gap-1 rounded bg-yellow-500/10 px-1.5 py-0.5 text-xs text-yellow-400">
                    <Star className="h-3 w-3" />
                    {game.press_score}
                  </span>
                )}
                {game.genre && game.genre[0] && (
                  <span className="text-xs text-zinc-500">{game.genre[0]}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} />
    </>
  );
}
