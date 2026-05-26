"use client";

import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  Reply,
  Send,
  ThumbsDown,
  ThumbsUp,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { capitalizeMonth } from "@/lib/date-utils";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_name?: string;
  author_avatar_url?: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
  parent_id?: string | null;
  likes?: number;
  dislikes?: number;
  user_reaction?: "like" | "dislike" | null;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const locale = useLocale();
  const localeTag = locale === "es" ? "es-ES" : "en-US";

  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        setIsAuthenticated(!!session.user);

        const postRes = await fetch(`/api/blog/posts/${slug}`);
        if (postRes.ok) {
          const postData = await postRes.json();
          setPost(postData);

          const commentsRes = await fetch(`/api/comments?post_id=${postData.id}`);
          if (commentsRes.ok) {
            const commentsData = await commentsRes.json();
            setComments(commentsData);
          }
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !post) return;
    await submitComment(newComment, post.id, null, () => setNewComment(""));
  }

  async function handleSubmitReply(e: React.FormEvent, parentId: string) {
    e.preventDefault();
    if (!replyText.trim() || !post) return;
    await submitComment(replyText, post.id, parentId, () => {
      setReplyText("");
      setReplyTo(null);
    });
  }

  async function submitComment(
    content: string,
    postId: string,
    parentId: string | null,
    onSuccess: () => void
  ) {
    if (parentId) setSubmittingReply(true);
    else setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, post_id: postId, parent_id: parentId }),
      });

      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [comment, ...prev]);
        onSuccess();
        setMessage("Comentario publicado correctamente");
      } else {
        const data = await res.json();
        setMessage(data.error || "Error al publicar comentario");
      }
    } catch {
      setMessage("Error al publicar comentario");
    } finally {
      setSubmitting(false);
      setSubmittingReply(false);
    }
  }

  async function handleReaction(commentId: string, type: "like" | "dislike") {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(`/api/comments/${commentId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) =>
          prev.map((c) => {
            if (c.id !== commentId) return c;
            return {
              ...c,
              likes: (c.likes || 0) + (data.liked ? 1 : data.disliked ? -1 : 0),
              dislikes:
                (c.dislikes || 0) +
                (data.disliked ? 1 : data.liked ? -1 : 0),
              user_reaction: data.liked
                ? "like"
                : data.disliked
                ? "dislike"
                : null,
            };
          })
        );
      }
    } catch {
      // silent
    }
  }

  const topComments = useMemo(
    () => comments.filter((c) => !c.parent_id),
    [comments]
  );
  const repliesMap = useMemo(() => {
    const map = new Map<string, Comment[]>();
    comments.forEach((c) => {
      if (c.parent_id) {
        const list = map.get(c.parent_id) || [];
        list.push(c);
        map.set(c.parent_id, list);
      }
    });
    return map;
  }, [comments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-white">Post no encontrado</h1>
          <Link
            href="/blog"
            className="mt-4 inline-block text-violet-400 hover:text-violet-300"
          >
            ← Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Back */}
        <div className="mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al blog
          </Link>
        </div>

        {/* Article */}
        <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 md:p-8">
          {/* Author */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-violet-500/10 text-violet-500">
              {post.author_avatar_url ? (
                <Image
                  src={post.author_avatar_url}
                  alt={post.author_name || "Avatar"}
                  width={48}
                  height={48}
                  className="h-full w-full rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <User className="h-6 w-6" />
              )}
            </div>
            <div>
              <p className="font-medium text-white">
                {post.author_name || "Colaborador"}
              </p>
              <p className="text-sm text-zinc-500">
                {capitalizeMonth(new Date(post.created_at).toLocaleDateString(localeTag, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }), localeTag)}
              </p>
            </div>
            <span className="ml-auto rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-violet-400">
              Opinión
            </span>
          </div>

          <h1 className="mb-6 text-2xl font-bold text-white md:text-3xl">
            {post.title}
          </h1>

          <div className="prose prose-invert max-w-none">
            {post.content.split("\n").map((paragraph, i) => (
              <p key={i} className="mb-4 leading-relaxed text-zinc-300">
                {paragraph}
              </p>
            ))}
          </div>
        </article>

        {/* Comments */}
        <section className="mt-10">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
            <MessageSquare className="h-5 w-5 text-violet-500" />
            Comentarios ({topComments.length})
          </h2>

          {/* New Comment */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              {message && (
                <div
                  className={`mb-4 rounded-lg p-3 text-sm ${
                    message.includes("Error")
                      ? "bg-red-500/10 text-red-400"
                      : "bg-green-500/10 text-green-400"
                  }`}
                >
                  {message}
                </div>
              )}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe tu comentario..."
                  className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
                  rows={4}
                  maxLength={2000}
                />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-zinc-500">
                    {newComment.length}/2000
                  </span>
                  <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {submitting ? "Publicando..." : "Comentar"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 text-center">
              <p className="text-sm text-zinc-400">
                <Link
                  href="/login"
                  className="font-medium text-violet-400 hover:text-violet-300"
                >
                  Inicia sesión
                </Link>{" "}
                para dejar un comentario
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {topComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                replies={repliesMap.get(comment.id) || []}
                isAuthenticated={isAuthenticated}
                replyTo={replyTo}
                setReplyTo={setReplyTo}
                replyText={replyText}
                setReplyText={setReplyText}
                submittingReply={submittingReply}
                onSubmitReply={handleSubmitReply}
                onReaction={handleReaction}
              />
            ))}

            {topComments.length === 0 && (
              <div className="py-8 text-center text-zinc-500">
                <MessageSquare className="mx-auto mb-2 h-8 w-8" />
                <p>No hay comentarios aún. ¡Sé el primero!</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function CommentItem({
  comment,
  replies,
  isAuthenticated,
  replyTo,
  setReplyTo,
  replyText,
  setReplyText,
  submittingReply,
  onSubmitReply,
  onReaction,
}: {
  comment: Comment;
  replies: Comment[];
  isAuthenticated: boolean;
  replyTo: string | null;
  setReplyTo: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  submittingReply: boolean;
  onSubmitReply: (e: React.FormEvent, parentId: string) => void;
  onReaction: (id: string, type: "like" | "dislike") => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-zinc-400">
          {comment.author_avatar ? (
            <Image
              src={comment.author_avatar}
              alt={comment.author_name || "Avatar"}
              width={32}
              height={32}
              className="h-full w-full rounded-full object-cover"
              unoptimized
            />
          ) : (
            <User className="h-4 w-4" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">
            {comment.author_name || "Usuario"}
          </span>
          <span className="text-xs text-zinc-500">
            {new Date(comment.created_at).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-zinc-300">{comment.content}</p>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-4">
        <button
          onClick={() => onReaction(comment.id, "like")}
          disabled={!isAuthenticated}
          className={`flex items-center gap-1 text-sm transition ${
            comment.user_reaction === "like"
              ? "text-emerald-400"
              : "text-zinc-500 hover:text-emerald-400"
          }`}
          title={isAuthenticated ? "Me gusta" : "Inicia sesión para reaccionar"}
        >
          <ThumbsUp className="h-4 w-4" />
          {comment.likes || 0}
        </button>
        <button
          onClick={() => onReaction(comment.id, "dislike")}
          disabled={!isAuthenticated}
          className={`flex items-center gap-1 text-sm transition ${
            comment.user_reaction === "dislike"
              ? "text-red-400"
              : "text-zinc-500 hover:text-red-400"
          }`}
          title={isAuthenticated ? "No me gusta" : "Inicia sesión para reaccionar"}
        >
          <ThumbsDown className="h-4 w-4" />
          {comment.dislikes || 0}
        </button>
        {isAuthenticated && (
          <button
            onClick={() =>
              setReplyTo(replyTo === comment.id ? null : comment.id)
            }
            className="flex items-center gap-1 text-sm text-zinc-500 hover:text-violet-400 transition"
          >
            <Reply className="h-4 w-4" />
            Responder
          </button>
        )}
      </div>

      {/* Reply Form */}
      {replyTo === comment.id && (
        <form
          onSubmit={(e) => onSubmitReply(e, comment.id)}
          className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              Respondiendo a {comment.author_name || "Usuario"}
            </span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-zinc-500 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Escribe tu respuesta..."
            className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
            rows={3}
            maxLength={2000}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={submittingReply || !replyText.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {submittingReply ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Responder
            </button>
          </div>
        </form>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="mt-4 space-y-3 border-l-2 border-zinc-800 pl-4">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className="rounded-lg border border-zinc-800/60 bg-zinc-800/30 p-3"
            >
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-zinc-400">
                  {reply.author_avatar ? (
                    <Image
                      src={reply.author_avatar}
                      alt={reply.author_name || "Avatar"}
                      width={24}
                      height={24}
                      className="h-full w-full rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                </div>
                <span className="text-xs font-medium text-white">
                  {reply.author_name || "Usuario"}
                </span>
                <span className="text-xs text-zinc-500">
                  {new Date(reply.created_at).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <p className="text-sm text-zinc-300">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
