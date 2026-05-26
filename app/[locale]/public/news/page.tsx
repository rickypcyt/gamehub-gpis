import { Calendar, Eye, Newspaper } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { NewsPost } from "@/lib/neon";
import { cachedQuery } from "@/lib/neon";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales, defaultLocale, type Locale } from "@/i18n/config";

export const revalidate = 300; // Revalidar cada 5 minutos (aumentado de 60s)
export const dynamic = 'force-static'; // Cache en build time cuando sea posible

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface NewsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewsPage({ params }: NewsPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams?.locale ?? defaultLocale) as Locale;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "news" });

  const news = await cachedQuery<NewsPost & { author_name?: string }>(
    `SELECT news_posts.*, profiles.name as author_name 
     FROM news_posts 
     LEFT JOIN profiles ON news_posts.author_id = profiles.id 
     WHERE news_posts.published = true 
     ORDER BY news_posts.created_at DESC
     LIMIT 50` // Limitar para no cargar todo
  );

  const featured = news?.find((n) => n.featured);
  const regular = news?.filter((n) => !n.featured);

  return (
    <div className="min-h-screen bg-zinc-950">
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Featured News */}
        {featured && <FeaturedNews post={featured} locale={locale} featuredLabel={t("featured")} viewsLabel={t("views")} />}

        {/* News Grid */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-white">{t("latestNews")}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regular?.map((post) => (
              <NewsCard key={post.id} post={post} locale={locale} authorFallback={t("authorFallback")} />
            ))}
          </div>
        </div>

        {!news?.length && (
          <div className="py-16 text-center">
            <Newspaper className="mx-auto h-12 w-12 text-zinc-600" />
            <p className="mt-4 text-zinc-500">{t("noNews")}</p>
          </div>
        )}
      </main>
    </div>
  );
}

function FeaturedNews({ post, locale, featuredLabel, viewsLabel }: { post: NewsPost; locale: Locale; featuredLabel: string; viewsLabel: string }) {
  const localeTag = locale === "en" ? "en-US" : "es-ES";

  return (
    <Link
      href={`/news/${post.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 md:p-8"
    >
      <span className=" w-fit rounded-full bg-violet-500/10 px-3 py-1 text-base font-medium text-violet-400">
        {featuredLabel}
      </span>
      <h2 className="mt-2 text-2xl font-bold text-white group-hover:text-violet-400 md:text-3xl">
        {post.title}
      </h2>
      <p className="mt-3 line-clamp-3 text-zinc-400">{post.excerpt}</p>
      <div className="mt-4 flex items-center gap-4 text-base text-zinc-500">
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {new Date(post.created_at).toLocaleDateString(localeTag)}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {post.views} {viewsLabel}
        </span>
      </div>
    </Link>
  );
}

function NewsCard({ post, locale, authorFallback }: { post: NewsPost & { author_name?: string }; locale: Locale; authorFallback: string }) {
  const localeTag = locale === "en" ? "en-US" : "es-ES";

  return (
    <Link
      href={`/news/${post.slug}`}
      className="group flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-violet-500/50"
    >
      <h3 className="font-semibold text-lg text-white group-hover:text-violet-400 line-clamp-2">
        {post.title}
      </h3>
      <p className="mt-2 line-clamp-2 flex-1 text-base text-zinc-400">
        {post.excerpt}
      </p>
      <div className="mt-4 flex items-center justify-between text-base text-zinc-500">
        <span>{post.author_name || authorFallback}</span>
        <span>{new Date(post.created_at).toLocaleDateString(localeTag)}</span>
      </div>
    </Link>
  );
}
