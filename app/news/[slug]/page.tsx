import { ArrowLeft, Calendar, Eye, MessageSquare, User } from "lucide-react";
import { query, queryOne } from "@/lib/neon";

import { CommentsSection } from "./CommentsSection";
import Link from "next/link";
import type { NewsPost } from "@/lib/neon";
import { auth } from "@/auth";
import { notFound } from "next/navigation";

export const revalidate = 60; // ISR cada 60 segundos

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
  author_id: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth();

  const post = await queryOne<NewsPost & { author_name: string; author_avatar: string | null }>(
    `SELECT n.*, p.name as author_name, p.avatar_url as author_avatar
     FROM news_posts n
     LEFT JOIN profiles p ON n.author_id = p.id
     WHERE n.slug = $1 AND n.published = true`,
    [slug]
  );

  if (!post) {
    notFound();
  }

  // Increment views
  await query("UPDATE news_posts SET views = views + 1 WHERE id = $1", [post.id]);

  // Get comments (limitado a 50 para performance)
  const comments = await query<Comment>(
    `SELECT c.*, p.name as author_name, p.avatar_url as author_avatar
     FROM comments c
     LEFT JOIN profiles p ON c.author_id = p.id
     WHERE c.post_id = $1
     ORDER BY c.created_at DESC
     LIMIT 50`,
    [post.id]
  );

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/news" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="text-sm text-zinc-500">Noticia</span>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-4 py-8">
        {/* Cover Image */}
        {post.cover_image && (
          <div className="mb-8 aspect-video overflow-hidden rounded-2xl bg-zinc-800">
            <img
              src={post.cover_image}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white md:text-4xl">{post.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
                {post.author_avatar ? (
                  <img src={post.author_avatar} alt={post.author_name} className="h-8 w-8 rounded-full" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <span>{post.author_name || "Redacción"}</span>
            </div>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.created_at).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.views + 1} lecturas
            </span>
          </div>
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <div className="mb-8 rounded-xl border-l-4 border-violet-500 bg-zinc-900/50 p-4">
            <p className="text-lg italic text-zinc-300">{post.excerpt}</p>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-invert prose-zinc max-w-none">
          <div className="whitespace-pre-wrap text-zinc-300 leading-relaxed">
            {post.content}
          </div>
        </div>

        {/* Comments */}
        <div className="mt-12 border-t border-zinc-800 pt-8">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
            <MessageSquare className="h-5 w-5" />
            Comentarios ({comments.length})
          </h2>

          <CommentsSection 
            postId={post.id} 
            comments={comments} 
            isAuthenticated={!!session?.user}
          />
        </div>
      </article>
    </div>
  );
}
