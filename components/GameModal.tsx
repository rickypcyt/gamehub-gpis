'use client';

import { Calendar, Star } from 'lucide-react';

import type { Game } from '@/lib/neon';

interface GameModalProps {
  game: Game | null;
  onClose: () => void;
}

export function GameModal({ game, onClose }: GameModalProps) {
  if (!game) return null;

  const pressScore = Number(game.press_score) || 0;
  const userScore = Number(game.user_score) || 0;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <div
        className="relative max-w-2xl w-full h-[90vh] rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden"
        style={{
          backgroundImage: game.cover_image ? `url(${game.cover_image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Light blur overlay for entire modal */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

        {/* Cover Image Banner - No Blur, clear at top */}
        {game.cover_image && (
          <div className="relative h-56 w-full overflow-hidden z-10">
            <img
              src={game.cover_image}
              alt={game.title}
              className="h-full w-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
          </div>
        )}

        {/* Content area - centered info */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6 text-center">
          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-2">{game.title}</h2>

          {/* Category Badge */}
          {game.category && (
            <span className="inline-block rounded-full bg-violet-500/30 px-3 py-1 text-base text-violet-300 mb-4">
              {game.category}
            </span>
          )}

          {/* Description */}
          {game.description && (
            <p className="text-zinc-200 mb-6">{game.description}</p>
          )}

          {/* Scores */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              <div>
                <span className="text-lg font-bold text-white">{pressScore.toFixed(1)}</span>
                <span className="text-base text-zinc-300 ml-1">prensa</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-violet-500 text-violet-500" />
              <div>
                <span className="text-lg font-bold text-white">{userScore.toFixed(1)}</span>
                <span className="text-base text-zinc-300 ml-1">usuarios</span>
              </div>
            </div>
          </div>

          {/* Release Date */}
          {game.release_date && (
            <div className="flex items-center gap-2 text-zinc-300 mb-4">
              <Calendar className="h-4 w-4" />
              <span>{new Date(game.release_date).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}</span>
            </div>
          )}

          {/* Genres */}
          {game.genre && game.genre.length > 0 && (
            <div className="mb-4">
              <h3 className="text-base font-semibold text-zinc-400 mb-2">Géneros</h3>
              <div className="flex flex-wrap gap-2">
                {game.genre.map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-zinc-800/60 px-3 py-1 text-base text-zinc-200"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Platforms */}
          {game.platform && game.platform.length > 0 && (
            <div className="mb-4">
              <h3 className="text-base font-semibold text-zinc-400 mb-2">Plataformas</h3>
              <div className="flex flex-wrap gap-2">
                {game.platform.map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-zinc-800/60 px-3 py-1 text-base text-zinc-200"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Close Button - Fixed at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-zinc-700/50 p-4 bg-black/40 backdrop-blur-md">
          <button
            onClick={onClose}
            className="w-full cursor-pointer rounded-lg bg-zinc-800/80 px-4 py-3 text-base font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
