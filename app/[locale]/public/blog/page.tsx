import { MessageSquare, Users } from "lucide-react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

import type { BlogPost } from "@/lib/neon";
import { Link } from "@/i18n/navigation";
import { cachedQuery } from "@/lib/neon";
import { locales, defaultLocale, type Locale } from "@/i18n/config";

export const revalidate = 300; // Cache 5 minutos
export const dynamic = 'force-static';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

type TranslateFn = (key: string, values?: Record<string, unknown>) => string;

export default async function BlogPage({ params }: BlogPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams?.locale ?? defaultLocale) as Locale;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "blog.list" });
  const posts = await cachedQuery<
    BlogPost & { author_name?: string; author_avatar_url?: string; comment_count?: number }
  >(
    `SELECT blog_posts.*, profiles.name as author_name, profiles.avatar_url as author_avatar_url,
     (SELECT COUNT(*) FROM comments WHERE comments.post_id = blog_posts.id) as comment_count
     FROM blog_posts 
     LEFT JOIN profiles ON blog_posts.author_id = profiles.id 
     WHERE blog_posts.published = true 
     ORDER BY blog_posts.created_at DESC
     LIMIT 50`
  );

  return (
    <div className="min-h-screen bg-zinc-950">

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-white">{t("title")}</h2>
          <p className="mt-2 text-zinc-400">{t("subtitle")}</p>
        </div>

        <div className="space-y-6">
          {posts?.map((post) => (
            <BlogCard key={post.id} post={post} locale={locale} t={t} />
          ))}
        </div>

        {!posts?.length && (
          <div className="py-16 text-center">
            <Users className="mx-auto h-12 w-12 text-zinc-600" />
            <p className="mt-4 text-zinc-500">{t("empty")}</p>
          </div>
        )}
      </main>
    </div>
  );
}

function BlogCard({
  post,
  locale,
  t,
}: {
  post: BlogPost & { author_name?: string; author_avatar_url?: string; comment_count?: number };
  locale: Locale;
  t: TranslateFn;
}) {
  const commentCount = post.comment_count ?? 0;
  const dateLocale = locale === "en" ? "en-US" : "es-ES";

  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-violet-500/50">
      {/* Top meta */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-violet-500/10 text-violet-500">
            {post.author_avatar_url ? (
              <Image
                src={post.author_avatar_url}
                alt={post.author_name || ""}
                width={40}
                height={40}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <Users className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{post.author_name || t("authorFallback")}</p>
            <p className="text-xs text-zinc-500">
              {new Date(post.created_at).toLocaleDateString(dateLocale, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-violet-400">
          {t("badge")}
        </span>
      </div>

      <Link href={`/blog/${post.slug}`}>
        <h3 className="text-xl font-semibold text-white hover:text-violet-400 transition">
          {post.title}
        </h3>
      </Link>

      <p className="mt-3 text-sm text-zinc-400 line-clamp-3">
        {post.content.substring(0, 200)}...
      </p>

      <div className="mt-4 flex items-center gap-4">
        <Link
          href={`/blog/${post.slug}`}
          className="text-sm font-medium text-violet-400 hover:text-violet-300"
        >
          {t("readMore")}
        </Link>
        <span className="flex items-center gap-1.5 text-sm text-zinc-500">
          <MessageSquare className="h-4 w-4" />
          {t("comments", { count: commentCount })}
        </span>
      </div>
    </article>
  );
}
