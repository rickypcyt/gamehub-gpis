import { ArrowLeft, Play, Tv, Video } from "lucide-react";

import Link from "next/link";
import type { Multimedia } from "@/lib/neon";
import { query } from "@/lib/neon";

export default async function MultimediaPage() {
  const items = await query<Multimedia>(
    "SELECT * FROM multimedia ORDER BY created_at DESC"
  );

  const videos = items?.filter((i) => i.type === "video");
  const streams = items?.filter((i) => i.type === "stream");
  const trailers = items?.filter((i) => i.type === "trailer");

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="flex items-center gap-2 text-xl font-bold text-white">
              <Video className="h-6 w-6 text-violet-500" />
              Multimedia
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Featured Video */}
        {items?.[0] && <FeaturedVideo video={items[0]} />}

        {/* Trailers Section */}
        {trailers && trailers.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-white flex items-center gap-2">
              <Play className="h-5 w-5 text-violet-500" />
              Trailers
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {trailers.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>
        )}

        {/* Streams Section */}
        {streams && streams.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-white flex items-center gap-2">
              <Tv className="h-5 w-5 text-red-500" />
              Streams en vivo
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {streams.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>
        )}

        {/* Videos Section */}
        {videos && videos.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-white flex items-center gap-2">
              <Tv className="h-5 w-5 text-red-600" />
              Videos destacados
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>
        )}

        {!items?.length && (
          <div className="py-16 text-center">
            <Video className="mx-auto h-12 w-12 text-zinc-600" />
            <p className="mt-4 text-zinc-500">No hay contenido multimedia</p>
          </div>
        )}
      </main>
    </div>
  );
}

function FeaturedVideo({ video }: { video: Multimedia }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="aspect-video bg-zinc-800 relative">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Video className="h-20 w-20 text-zinc-700" />
          </div>
        )}
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition"
        >
          <Play className="h-16 w-16 text-white" />
        </a>
      </div>
      <div className="p-6">
        <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">
          {video.type}
        </span>
        <h2 className="mt-2 text-2xl font-bold text-white">{video.title}</h2>
        {video.platform && (
          <p className="mt-2 text-sm text-zinc-500">
            Plataforma: {video.platform}
          </p>
        )}
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: Multimedia }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden transition hover:border-violet-500/50"
    >
      <div className="aspect-video bg-zinc-800 relative">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Video className="h-12 w-12 text-zinc-700" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
          <Play className="h-12 w-12 text-white" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-white line-clamp-2 group-hover:text-violet-400">
          {video.title}
        </h3>
        {video.platform && (
          <p className="mt-1 text-xs text-zinc-500">{video.platform}</p>
        )}
      </div>
    </a>
  );
}
