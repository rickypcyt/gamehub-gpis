import { Calendar, User } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import type { NewsPost } from "@/lib/neon";

interface NewsCardProps {
  news: NewsPost;
  locale: Locale;
}

export function NewsCard({ news, locale }: NewsCardProps) {
  const localeTag = locale === "en" ? "en-US" : "es-ES";
  const authorFallback = locale === "en" ? "Editorial" : "Redacción";

  return (
    <Link
      href={`/news/${news.slug}`}
      className="group flex flex-col rounded-lg border border-zinc-800 bg-zinc-900/60 p-5 transition hover:border-violet-500/40 hover:bg-zinc-900"
    >

      <div className="flex flex-1 flex-col">
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
            {news.author_name || authorFallback}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(news.created_at).toLocaleDateString(localeTag, {
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
