import { Link } from "@/i18n/navigation";
import type { NewsPost } from "@/lib/neon";
import { Calendar, User } from "lucide-react";
import Image from "next/image";

interface NewsCardProps {
  news: NewsPost;
}

export function NewsCard({ news }: NewsCardProps) {
  return (
    <Link
      href={`/news/${news.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 transition hover:border-violet-500/40 hover:bg-zinc-900"
    >
      {news.cover_image ? (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={news.cover_image}
            alt={news.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent" />
        </div>
      ) : (
        <div className="aspect-video w-full bg-zinc-800 flex items-center justify-center">
          <span className="text-zinc-600 text-sm">Sin imagen</span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-white transition group-hover:text-violet-400 line-clamp-2">
          {news.title}
        </h3>
        {news.excerpt && (
          <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
            {news.excerpt}
          </p>
        )}
        <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {news.author_name || "Redacción"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(news.created_at).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}
