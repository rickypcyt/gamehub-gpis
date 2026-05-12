'use client';

import type { Game } from '@/lib/neon';
import { GameModal } from '@/components/GameModal';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { useState } from 'react';

interface TopGamesClientProps {
  games: Game[];
}

export default function TopGamesClient({ games }: TopGamesClientProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {games.map((game, index) => (
          <button
            key={game.id}
            onClick={() => setSelectedGame(game)}
            className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden transition hover:border-violet-500/50 text-left"
          >
            {/* Rank Badge */}
            <div className="absolute top-2 left-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 font-bold text-white shadow-lg">
              {index + 1}
            </div>
            {game.cover_image ? (
              <div className="aspect-[3/4] relative overflow-hidden">
                <Image
                  src={game.cover_image}
                  alt={game.title}
                  fill
                  className="object-cover transition group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="aspect-[3/4] bg-zinc-800 flex items-center justify-center">
                <Star className="h-12 w-12 text-zinc-600" />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-white group-hover:text-violet-400 line-clamp-1">
                {game.title}
              </h3>
              <div className="mt-2 flex items-center gap-2">
                {game.press_score && (
                  <span className="inline-flex items-center gap-1 rounded bg-yellow-500/10 px-2 py-1 text-sm text-yellow-400">
                    <Star className="h-3 w-3" />
                    {game.press_score}
                  </span>
                )}
                {game.genre && game.genre[0] && (
                  <span className="text-sm text-zinc-500">{game.genre[0]}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Modal */}
      <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} />
    </>
  );
}
