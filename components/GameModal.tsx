'use client';

import { Calendar, Star, X } from 'lucide-react';

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

        {/* Close Button - Top Left */}
        <button
          onClick={onClose}
          className="absolute top-6 left-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white transition leading-none"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content area */}
        <div className="relative z-10 flex-1 overflow-y-auto">
          {/* Title Header */}
          <div className="flex items-center justify-center pt-6 pb-4">
            <h2 className="text-3xl font-bold text-white text-center">{game.title}</h2>
          </div>

          {/* Description and Info */}
          <div className="p-6 grid gap-4">
            {/* Category Badge */}
            {game.category && (
              <div className="flex justify-center">
                <span className="rounded-full bg-violet-600/20 border border-violet-500/30 px-4 py-1.5 text-sm font-medium text-violet-300">
                  {game.category}
                </span>
              </div>
            )}

            {/* Description Card */}
            {game.description && (
              <div className="rounded-xl bg-zinc-800/50 p-5 border border-zinc-700/50">
                <h3 className="text-sm font-semibold text-zinc-400 mb-2">Sobre el juego</h3>
                <p className="text-zinc-200 leading-relaxed">{game.description}</p>
              </div>
            )}

            {/* Scores Card */}
            <div className="rounded-xl bg-zinc-800/50 p-5 border border-zinc-700/50">
              <h3 className="text-sm font-semibold text-zinc-400 mb-3 text-center">Puntuaciones</h3>
              <div className="flex items-center justify-around">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
                    <span className="text-2xl font-bold text-white">{pressScore.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-zinc-400">Crítica profesional</span>
                </div>
                <div className="h-10 w-px bg-zinc-700"></div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <Star className="h-6 w-6 fill-violet-500 text-violet-500" />
                    <span className="text-2xl font-bold text-white">{userScore.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-zinc-400">Valoración de usuarios</span>
                </div>
              </div>
            </div>

            {/* Release Date Card */}
            {game.release_date && (
              <div className="rounded-xl bg-zinc-800/50 p-5 border border-zinc-700/50">
                <h3 className="text-sm font-semibold text-zinc-400 mb-2">Fecha de lanzamiento</h3>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Calendar className="h-5 w-5 text-violet-400" />
                  <span className="text-base">{new Date(game.release_date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}</span>
                </div>
              </div>
            )}

            {/* Genres Card */}
            {game.genre && game.genre.length > 0 && (
              <div className="rounded-xl bg-zinc-800/50 p-5 border border-zinc-700/50">
                <h3 className="text-sm font-semibold text-zinc-400 mb-2">Géneros</h3>
                <div className="flex flex-wrap gap-2">
                  {game.genre.map((g) => (
                    <span
                      key={g}
                      className="rounded-full bg-zinc-700/60 px-4 py-1.5 text-sm text-zinc-200"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Platforms Card */}
            {game.platform && game.platform.length > 0 && (
              <div className="rounded-xl bg-zinc-800/50 p-5 border border-zinc-700/50">
                <h3 className="text-sm font-semibold text-zinc-400 mb-2">Plataformas disponibles</h3>
                <div className="flex flex-wrap gap-2">
                  {game.platform.map((p) => (
                    <span
                      key={p}
                      className="rounded-full bg-zinc-700/60 px-4 py-1.5 text-sm text-zinc-200"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
