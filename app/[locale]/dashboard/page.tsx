import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  MessageSquare,
  Newspaper,
  PenLine,
  ShieldAlert,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { query, queryOne } from "@/lib/neon";

import { Link } from "@/i18n/navigation";
import { defaultLocale, type Locale } from "@/i18n/config";
import type { Profile } from "@/lib/neon";
import { auth } from "@/auth";
import { ensureCommentsSchema } from "@/lib/comments";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { capitalizeMonth } from "@/lib/date-utils";

type RecentComment = {
  id: string;
  content: string;
  created_at: string;
  post_title: string | null;
  post_slug: string | null;
  post_type: "news" | "blog";
};

type ModerationComment = {
  id: string;
  content: string;
  created_at: string;
  post_title: string | null;
  author_name: string | null;
};

type ManagedNews = {
  id: string;
  title: string;
  published: boolean;
  created_at: string;
  views: number | null;
  author_name: string | null;
};

type SubscriberStats = {
  total_comments: number;
  distinct_posts: number;
  last_comment_at: string | null;
};

type Interaction = {
  id: string;
  post_title: string | null;
  post_slug: string | null;
  post_type: "news" | "blog";
  interacted_at: string;
};

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await queryOne<Profile>(
    "SELECT * FROM profiles WHERE id = $1",
    [session.user.id]
  );

  const role = session.user.role || "suscriptor";
  const resolvedParams = await params;
  const locale = (resolvedParams?.locale ?? defaultLocale) as Locale;
  const isAdmin = role === "admin";
  const isRedactor = role === "redactor";
  const isSubscriber = role === "suscriptor";
  const t = await getTranslations("dashboard") as (key: string, values?: Record<string, unknown>) => string;

  // Stats for admin
  const totalUsers = isAdmin ? await query<{ c: number }>("SELECT COUNT(*) as c FROM profiles") : null;
  const totalComments = isAdmin ? await query<{ c: number }>("SELECT COUNT(*) as c FROM comments") : null;
  const totalNews = isAdmin ? await query<{ c: number }>("SELECT COUNT(*) as c FROM news_posts") : null;
  const pendingComments = isAdmin ? await query<{ c: number }>("SELECT COUNT(*) as c FROM comments WHERE created_at > NOW() - INTERVAL '7 days'") : null;

  // Redactor stats
  const canEditNews = role === "redactor" || role === "admin";
  const myNews = canEditNews
    ? await query<{ id: string; title: string; published: boolean; created_at: string; updated_at: string; views: number | null }>(
        "SELECT id, title, published, created_at, updated_at, views FROM news_posts WHERE author_id = $1 ORDER BY created_at DESC LIMIT 5",
        [session.user.id]
      )
    : null;
  const redactorDrafts = (myNews || []).filter((news) => !news.published);
  const redactorPublished = (myNews || []).filter((news) => news.published);

  let recentComments: RecentComment[] = [];
  let moderationQueue: ModerationComment[] = [];
  let managedNews: ManagedNews[] = [];
  let subscriberStats: SubscriberStats | null = null;
  let subscriberInteractions: Interaction[] = [];

  if (isAdmin) {
    await ensureCommentsSchema();
    moderationQueue = await query<ModerationComment>(
      `SELECT 
         c.id,
         c.content,
         c.created_at,
         COALESCE(n.title, b.title) AS post_title,
         COALESCE(p.name, split_part(p.email, '@', 1), 'Usuario') AS author_name
       FROM comments c
       LEFT JOIN news_posts n ON c.post_type = 'news' AND c.post_id = n.id
       LEFT JOIN blog_posts b ON c.post_type = 'blog' AND c.post_id = b.id
       LEFT JOIN profiles p ON c.author_id = p.id
       ORDER BY c.created_at DESC
       LIMIT 4`
    );

    managedNews = await query<ManagedNews>(
      `SELECT 
         n.id,
         n.title,
         n.published,
         n.created_at,
         n.views,
         COALESCE(p.name, split_part(p.email, '@', 1), 'Usuario') AS author_name
       FROM news_posts n
       LEFT JOIN profiles p ON n.author_id = p.id
       ORDER BY n.created_at DESC
       LIMIT 4`
    );
  }

  if (isSubscriber) {
    await ensureCommentsSchema();
    recentComments = await query<RecentComment>(
      `SELECT 
         c.id,
         c.content,
         c.created_at,
         c.post_type,
         COALESCE(n.title, b.title) AS post_title,
         COALESCE(n.slug, b.slug) AS post_slug
       FROM comments c
       LEFT JOIN news_posts n ON c.post_type = 'news' AND c.post_id = n.id
       LEFT JOIN blog_posts b ON c.post_type = 'blog' AND c.post_id = b.id
       WHERE c.author_id = $1
       ORDER BY c.created_at DESC
       LIMIT 3`,
      [session.user.id]
    );

    const statsRow = await query<SubscriberStats>(
      `SELECT 
         COUNT(*)::int AS total_comments,
         COUNT(DISTINCT c.post_id)::int AS distinct_posts,
         MAX(c.created_at) AS last_comment_at
       FROM comments c
       WHERE c.author_id = $1`,
      [session.user.id]
    );
    subscriberStats = statsRow?.[0] || { total_comments: 0, distinct_posts: 0, last_comment_at: null };

    subscriberInteractions = await query<Interaction>(
      `SELECT 
         c.id,
         COALESCE(n.title, b.title) AS post_title,
         COALESCE(n.slug, b.slug) AS post_slug,
         c.post_type,
         c.created_at AS interacted_at
       FROM comments c
       LEFT JOIN news_posts n ON c.post_type = 'news' AND c.post_id = n.id
       LEFT JOIN blog_posts b ON c.post_type = 'blog' AND c.post_id = b.id
       WHERE c.author_id = $1
       ORDER BY c.created_at DESC
       LIMIT 10`,
      [session.user.id]
    );
  }

  const displayName = profile?.name?.split(" ")[0] || t("fallbacks.user");
  const taglineKey = isAdmin ? "admin" : isRedactor ? "redactor" : "suscriptor";

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          {t("greeting", { name: displayName })}
        </h1>
        <p className="mt-1 text-sm text-zinc-400 capitalize">
          {t(`taglines.${taglineKey}`)}
        </p>
      </div>

      {/* ============= ADMIN DASHBOARD ============= */}
      {isAdmin && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t("admin.stats.users.title")}
              value={String(totalUsers?.[0]?.c ?? 0)}
              icon={<Users className="h-5 w-5" />}
              trend={t("admin.stats.users.trend")}
            />
            <StatCard
              title={t("admin.stats.news.title")}
              value={String(totalNews?.[0]?.c ?? 0)}
              icon={<Newspaper className="h-5 w-5" />}
              trend={t("admin.stats.news.trend")}
            />
            <StatCard
              title={t("admin.stats.comments.title")}
              value={String(totalComments?.[0]?.c ?? 0)}
              icon={<MessageSquare className="h-5 w-5" />}
              trend={t("admin.stats.comments.trend")}
            />
            <StatCard
              title={t("admin.stats.thisWeek.title")}
              value={String(pendingComments?.[0]?.c ?? 0)}
              icon={<TrendingUp className="h-5 w-5" />}
              trend={t("admin.stats.thisWeek.trend")}
            />
          </div>

          {/* Row: Moderation + Quick Actions */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Moderation Panel */}
            <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
                <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                  <ShieldAlert className="h-5 w-5 text-amber-400" />
                  {t("admin.moderation.title")}
                </h2>
                <Link href="/dashboard/comments" className="text-sm text-violet-400 hover:text-violet-300">
                  {t("admin.moderation.viewAll")}
                </Link>
              </div>
              {moderationQueue.length > 0 ? (
                <div className="divide-y divide-zinc-800">
                  {moderationQueue.map((comment) => (
                    <CommentModerationRow
                      key={comment.id}
                      author={comment.author_name || t("fallbacks.user")}
                      content={comment.content}
                      status={deriveModerationStatus(comment.content, comment.created_at)}
                      postLabel={t("admin.moderation.postLabel", { post: comment.post_title || t("fallbacks.post") })}
                      approveLabel={t("common.approve")}
                      rejectLabel={t("common.reject")}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-sm text-zinc-500">{t("admin.moderation.empty")}</div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="border-b border-zinc-800 px-6 py-4">
                <h2 className="text-base font-semibold text-white">{t("admin.quickActions.title")}</h2>
              </div>
              <div className="p-4 space-y-2">
                <QuickAction href="/admin/users" icon={<Users className="h-4 w-4" />} label={t("admin.quickActions.manageUsers")} />
                <QuickAction href="/dashboard/write/news" icon={<PenLine className="h-4 w-4" />} label={t("admin.quickActions.createNews")} />
                <QuickAction href="/admin/settings" icon={<BarChart3 className="h-4 w-4" />} label={t("admin.quickActions.viewStats")} />
                <QuickAction href="/dashboard/my-news" icon={<Newspaper className="h-4 w-4" />} label={t("admin.quickActions.editNews")} />
              </div>
            </div>
          </div>

          {/* News Management Table */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                <Newspaper className="h-5 w-5 text-violet-400" />
                {t("admin.news.title")}
              </h2>
              <Link href="/dashboard/my-news" className="text-sm text-violet-400 hover:text-violet-300">
                {t("admin.news.viewAll")}
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-zinc-500">{t("admin.news.headers.title")}</th>
                    <th className="px-6 py-3 text-left font-medium text-zinc-500">{t("admin.news.headers.author")}</th>
                    <th className="px-6 py-3 text-left font-medium text-zinc-500">{t("admin.news.headers.status")}</th>
                    <th className="px-6 py-3 text-left font-medium text-zinc-500">{t("admin.news.headers.date")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {managedNews.length > 0 ? (
                    managedNews.map((news) => (
                      <TableRow
                        key={news.id}
                        title={news.title}
                        author={news.author_name || t("fallbacks.user")}
                        status={news.published ? "published" : "draft"}
                        statusLabel={t(`statusLabels.${news.published ? "published" : "draft"}`)}
                        date={formatDate(news.created_at, locale)}
                        views={news.views !== null ? news.views.toLocaleString(locale) : "-"}
                        showAuthorColumn
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-6 text-center text-sm text-zinc-500">
                        {t("admin.news.empty")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============= REDACTOR DASHBOARD ============= */}
      {isRedactor && (
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ActionCard
              icon={<PenLine className="h-6 w-6" />}
              title={t("redactor.quickActions.createNews.title")}
              description={t("redactor.quickActions.createNews.description")}
              href="/dashboard/write/news"
            />
            <ActionCard
              icon={<FileText className="h-6 w-6" />}
              title={t("redactor.quickActions.drafts.title")}
              description={t("redactor.quickActions.drafts.description")}
              href="/dashboard/drafts"
              badge="3"
            />
            <ActionCard
              icon={<Calendar className="h-6 w-6" />}
              title={t("redactor.quickActions.schedule.title")}
              description={t("redactor.quickActions.schedule.description")}
              href="/dashboard/schedule"
            />
            <ActionCard
              icon={<Newspaper className="h-6 w-6" />}
              title={t("redactor.quickActions.myNews.title")}
              description={t("redactor.quickActions.myNews.description")}
              href="/dashboard/my-news"
            />
          </div>

          {/* Drafts + Schedule */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* My Drafts */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-400" />
                  {t("redactor.drafts.title")}
                </h2>
                <Link href="/dashboard/drafts" className="text-sm text-violet-400 hover:text-violet-300">{t("redactor.drafts.viewAll")}</Link>
              </div>
              {redactorDrafts.length > 0 ? (
                <div className="divide-y divide-zinc-800">
                  {redactorDrafts.map((draft) => (
                    <DraftRow
                      key={draft.id}
                      title={draft.title}
                      lastEdit={formatRelativeTime(draft.updated_at, locale)}
                      meta={t("statusLabels.draft")}
                      continueLabel={t("common.continueDraft")}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-6 py-6 text-center text-sm text-zinc-500">{t("redactor.drafts.empty")}</div>
              )}
            </div>

            {/* Published */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                  {t("redactor.published.title")}
                </h2>
                <Link href="/dashboard/my-news" className="text-sm text-violet-400 hover:text-violet-300">{t("redactor.published.viewAll")}</Link>
              </div>
              {redactorPublished.length > 0 ? (
                <div className="divide-y divide-zinc-800">
                  {redactorPublished.map((post) => (
                    <PublicationRow
                      key={post.id}
                      title={post.title}
                      date={formatDateWithTime(post.created_at, locale)}
                      status="published"
                      statusLabel={t("statusLabels.published")}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-6 py-6 text-center text-sm text-zinc-500">{t("redactor.published.empty")}</div>
              )}
            </div>
          </div>

          {/* Recent News */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
              <h2 className="text-base font-semibold text-white">{t("redactor.table.title")}</h2>
              <Link href="/dashboard/my-news" className="text-sm text-violet-400 hover:text-violet-300">{t("redactor.table.viewAll")}</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-zinc-500">{t("redactor.table.headers.title")}</th>
                    <th className="px-6 py-3 text-left font-medium text-zinc-500">{t("redactor.table.headers.status")}</th>
                    <th className="px-6 py-3 text-left font-medium text-zinc-500">{t("redactor.table.headers.views")}</th>
                    <th className="px-6 py-3 text-left font-medium text-zinc-500">{t("redactor.table.headers.date")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {myNews && myNews.length > 0 ? (
                    myNews.map((n) => (
                      <TableRow
                        key={n.id}
                        title={n.title}
                        author=""
                        status={n.published ? "published" : "draft"}
                        statusLabel={t(`statusLabels.${n.published ? "published" : "draft"}`)}
                        date={formatDate(n.created_at, locale)}
                        views={n.views !== null ? n.views.toLocaleString(locale) : undefined}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-6 text-center text-sm text-zinc-500">{t("redactor.table.empty")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============= SUSCRIPTOR DASHBOARD ============= */}
      {isSubscriber && (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t("subscriber.stats.comments")}
              value={String(subscriberStats?.total_comments ?? 0)}
              icon={<MessageSquare className="h-5 w-5" />}
            />
            <StatCard
              title={t("subscriber.stats.posts")}
              value={String(subscriberStats?.distinct_posts ?? 0)}
              icon={<Newspaper className="h-5 h-5" />}
            />
            <StatCard
              title={t("subscriber.stats.lastComment")}
              value={subscriberStats?.last_comment_at ? formatDateWithTime(subscriberStats.last_comment_at, locale) : "—"}
              icon={<Clock className="h-5 w-5" />}
            />
            <StatCard
              title={t("subscriber.stats.memberSince")}
              value={profile?.created_at ? formatMonthYear(profile.created_at, locale) : "-"}
              icon={<Calendar className="h-5 w-5" />}
            />
          </div>

          {/* Row: Profile + Comments */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 text-violet-500 text-lg font-bold">
                  {profile?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="font-semibold text-white">{profile?.name || t("fallbacks.user")}</h2>
                  <p className="text-sm text-zinc-400">{session.user.email}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-zinc-400">
                <div className="flex justify-between"><span>{t("subscriber.profile.role")}</span><span className="text-zinc-300 capitalize">{role}</span></div>
                <div className="flex justify-between"><span>{t("subscriber.profile.location")}</span><span className="text-zinc-300">{profile?.location || t("fallbacks.location")}</span></div>
                <div className="flex justify-between"><span>{t("subscriber.profile.website")}</span><span className="text-zinc-300 truncate max-w-[180px]">{profile?.website || t("fallbacks.website")}</span></div>
              </div>
              <Link href="/dashboard/profile" className="mt-4 block w-full rounded-lg border border-zinc-700 px-4 py-2 text-center text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition">
                {t("common.editProfile")}
              </Link>
            </div>

            {/* Recent Comments */}
            <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-violet-400" />
                  {t("subscriber.comments.title")}
                </h2>
                <Link href="/dashboard/comments" className="text-sm text-violet-400 hover:text-violet-300">{t("subscriber.comments.viewAll")}</Link>
              </div>
              {recentComments.length > 0 ? (
                <div className="divide-y divide-zinc-800">
                  {recentComments.map((comment) => (
                    <CommentRow
                      key={comment.id}
                      post={comment.post_title || t("fallbacks.post")}
                      content={comment.content}
                      date={formatCommentDate(comment.created_at, locale)}
                      href={comment.post_slug ? `/${comment.post_type === "news" ? "news" : "blog"}/${comment.post_slug}` : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-sm text-zinc-500">{t("subscriber.comments.empty")}</div>
              )}
            </div>
          </div>

          {/* Favorites + History */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Favorites */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-400" />
                  {t("subscriber.favorites.title")}
                </h2>
                <Link href="/dashboard/favorites" className="text-sm text-violet-400 hover:text-violet-300">{t("subscriber.favorites.viewAll")}</Link>
              </div>
              {getDistinctPosts(subscriberInteractions).length > 0 ? (
                <div className="divide-y divide-zinc-800">
                  {getDistinctPosts(subscriberInteractions).slice(0, 3).map((fav) => (
                    <FavoriteRow
                      key={`${fav.post_type}-${fav.post_slug ?? fav.id}`}
                      title={fav.post_title || t("fallbacks.post")}
                      type={t(`contentTypes.${fav.post_type === "news" ? "news" : "blog"}`)}
                      date={formatRelativeTime(fav.interacted_at, locale)}
                      href={fav.post_slug ? `/${fav.post_type === "news" ? "news" : "blog"}/${fav.post_slug}` : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-sm text-zinc-500">{t("subscriber.favorites.empty")}</div>
              )}
            </div>

            {/* History */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-400" />
                  {t("subscriber.history.title")}
                </h2>
                <Link href="/dashboard/history" className="text-sm text-violet-400 hover:text-violet-300">{t("subscriber.history.viewAll")}</Link>
              </div>
              {subscriberInteractions.length > 0 ? (
                <div className="divide-y divide-zinc-800">
                  {subscriberInteractions.slice(0, 4).map((item) => (
                    <HistoryRow
                      key={item.id}
                      title={item.post_title || t("fallbacks.post")}
                      type={t(`contentTypes.${item.post_type === "news" ? "news" : "blog"}`)}
                      date={formatDateWithTime(item.interacted_at, locale)}
                      href={item.post_slug ? `/${item.post_type === "news" ? "news" : "blog"}/${item.post_slug}` : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-sm text-zinc-500">
                  {t("subscriber.history.emptyPrefix")}
                  <Link href="/news" className="text-violet-400 hover:text-violet-300">
                    {t("subscriber.history.emptyLinkLabel")}
                  </Link>
                  {t("subscriber.history.emptySuffix")}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============= UI COMPONENTS ============= */

function StatCard({ title, value, icon, trend }: { title: string; value: string; icon: React.ReactNode; trend?: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-violet-500/30">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg bg-violet-500/10 p-2.5 text-violet-500">{icon}</div>
        {trend && <span className="text-xs font-medium text-emerald-400">{trend}</span>}
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-zinc-500">{title}</p>
    </div>
  );
}

function ActionCard({ icon, title, description, href, badge }: { icon: React.ReactNode; title: string; description: string; href: string; badge?: string }) {
  return (
    <Link href={href} className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-violet-500/50 hover:bg-zinc-900">
      {badge && <span className="absolute top-4 right-4 rounded-full bg-violet-600 px-2 py-0.5 text-xs font-medium text-white">{badge}</span>}
      <div className="mb-3 inline-flex rounded-lg bg-violet-500/10 p-2.5 text-violet-500 transition group-hover:bg-violet-500 group-hover:text-white">{icon}</div>
      <h3 className="text-sm font-semibold text-white group-hover:text-violet-400">{title}</h3>
      <p className="mt-1 text-xs text-zinc-400">{description}</p>
    </Link>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white">
      <span className="text-violet-400">{icon}</span>
      {label}
    </Link>
  );
}

function TableRow({
  title,
  author,
  status,
  statusLabel,
  date,
  views,
  showAuthorColumn,
}: {
  title: string;
  author?: string;
  status: string;
  statusLabel: string;
  date: string;
  views?: string;
  showAuthorColumn?: boolean;
}) {
  return (
    <tr className="hover:bg-zinc-800/50">
      <td className="px-6 py-3">
        <div className="font-medium text-white">{title}</div>
        {!showAuthorColumn && author && <div className="text-xs text-zinc-500">{author}</div>}
      </td>
      {showAuthorColumn && author && <td className="px-6 py-3 text-zinc-400">{author}</td>}
      <td className="px-6 py-3">
        {status === "published" && <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">{statusLabel}</span>}
        {status === "draft" && <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">{statusLabel}</span>}
        {status === "review" && <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">{statusLabel}</span>}
        {status === "scheduled" && <span className="inline-flex items-center rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-400">{statusLabel}</span>}
        {status === "pending" && <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">{statusLabel}</span>}
      </td>
      {views !== undefined && <td className="px-6 py-3 text-zinc-400">{views}</td>}
      <td className="px-6 py-3 text-sm text-zinc-400">{date}</td>
    </tr>
  );
}

function CommentModerationRow({
  author,
  content,
  status,
  postLabel,
  approveLabel,
  rejectLabel,
}: {
  author: string;
  content: string;
  status: "flagged" | "approved" | "pending";
  postLabel: string;
  approveLabel: string;
  rejectLabel: string;
}) {
  return (
    <div className="flex items-start gap-3 px-6 py-3 hover:bg-zinc-800/30">
      <div className="mt-0.5">
        {status === "flagged" && <AlertTriangle className="h-4 w-4 text-red-400" />}
        {status === "approved" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
        {status === "pending" && <Clock className="h-4 w-4 text-amber-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{author}</span>
          <span className="text-xs text-zinc-500">{postLabel}</span>
        </div>
        <p className="mt-0.5 text-sm text-zinc-400 truncate">{content}</p>
      </div>
      <div className="flex gap-1">
        <button className="rounded p-1 text-emerald-400 hover:bg-emerald-500/10" title={approveLabel}><CheckCircle2 className="h-4 w-4" /></button>
        <button className="rounded p-1 text-red-400 hover:bg-red-500/10" title={rejectLabel}><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function DraftRow({ title, lastEdit, meta, continueLabel }: { title: string; lastEdit: string; meta?: string; continueLabel: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-3 hover:bg-zinc-800/30">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        <p className="text-xs text-zinc-500">{lastEdit}{meta ? ` · ${meta}` : ""}</p>
      </div>
      <Link href="/dashboard/drafts" className="ml-2 text-xs text-violet-400 hover:text-violet-300 shrink-0">{continueLabel}</Link>
    </div>
  );
}

function PublicationRow({
  title,
  date,
  status,
  statusLabel,
}: {
  title: string;
  date: string;
  status: "scheduled" | "draft" | "published";
  statusLabel: string;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3 hover:bg-zinc-800/30">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        <p className="text-xs text-zinc-500">{date}</p>
      </div>
      {status === "scheduled" && (
        <span className="shrink-0 rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-400">{statusLabel}</span>
      )}
      {status === "draft" && (
        <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">{statusLabel}</span>
      )}
      {status === "published" && (
        <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">{statusLabel}</span>
      )}
    </div>
  );
}

function CommentRow({ post, content, date, href }: { post: string; content: string; date: string; href?: string }) {
  return (
    <div className="px-6 py-3 hover:bg-zinc-800/30">
      <Link href={href || "#"} className="text-sm font-medium text-violet-400 hover:text-violet-300">
        {post}
      </Link>
      <p className="mt-1 text-sm text-zinc-300">{content}</p>
      <p className="mt-1 text-xs text-zinc-500">{date}</p>
    </div>
  );
}

function formatCommentDate(date: string, locale: string) {
  return formatDate(date, locale, { day: "numeric", month: "short", year: "numeric" });
}

function FavoriteRow({ title, type, date, href }: { title: string; type: string; date: string; href?: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-3 hover:bg-zinc-800/30">
      <div className="min-w-0">
        <Link href={href || "#"} className="text-sm font-medium text-white truncate hover:text-violet-400">
          {title}
        </Link>
        <p className="text-xs text-zinc-500">{type}</p>
      </div>
      <span className="shrink-0 text-xs text-zinc-500">{date}</span>
    </div>
  );
}

function HistoryRow({ title, type, date, href }: { title: string; type: string; date: string; href?: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-3 hover:bg-zinc-800/30">
      <div className="min-w-0">
        <Link href={href || "#"} className="text-sm font-medium text-white truncate hover:text-violet-400">
          {title}
        </Link>
        <p className="text-xs text-zinc-500">{type}</p>
      </div>
      <span className="shrink-0 text-xs text-zinc-500">{date}</span>
    </div>
  );
}

function formatDate(date: string, locale: string, options?: Intl.DateTimeFormatOptions) {
  try {
    const fullLocale = locale === "es" ? "es-ES" : "en-US";
    const dateString = new Date(date).toLocaleDateString(fullLocale, options ?? {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return capitalizeMonth(dateString, fullLocale);
  } catch {
    return date;
  }
}

function formatDateWithTime(date: string, locale: string) {
  try {
    const fullLocale = locale === "es" ? "es-ES" : "en-US";
    const dateString = new Date(date).toLocaleString(fullLocale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return capitalizeMonth(dateString, fullLocale);
  } catch {
    return date;
  }
}

function formatMonthYear(date: string, locale: string) {
  try {
    const fullLocale = locale === "es" ? "es-ES" : "en-US";
    const dateString = new Date(date).toLocaleDateString(fullLocale, { month: "short", year: "numeric" });
    return capitalizeMonth(dateString, fullLocale);
  } catch {
    return date;
  }
}

function formatRelativeTime(date: string, locale: string) {
  try {
    const now = Date.now();
    const value = new Date(date).getTime();
    const diffMs = value - now;
    const fullLocale = locale === "es" ? "es-ES" : "en-US";
    const rtf = new Intl.RelativeTimeFormat(fullLocale, { numeric: "auto" });
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    if (Math.abs(diffMinutes) < 60) {
      return rtf.format(diffMinutes, "minute");
    }
    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) {
      return rtf.format(diffHours, "hour");
    }
    const diffDays = Math.round(diffHours / 24);
    return rtf.format(diffDays, "day");
  } catch {
    return date;
  }
}

function deriveModerationStatus(content: string, createdAt: string): "flagged" | "pending" | "approved" {
  const lowered = content.toLowerCase();
  if (lowered.includes("http") || lowered.includes("www")) {
    return "flagged";
  }
  const created = new Date(createdAt);
  const hoursAgo = (Date.now() - created.getTime()) / (1000 * 60 * 60);
  if (hoursAgo < 24) {
    return "pending";
  }
  return "approved";
}

function getDistinctPosts(interactions: Interaction[]) {
  const map = new Map<string, Interaction>();
  interactions.forEach((item) => {
    const key = `${item.post_type}-${item.post_slug ?? item.id}`;
    if (!map.has(key)) {
      map.set(key, item);
    }
  });
  return Array.from(map.values());
}
