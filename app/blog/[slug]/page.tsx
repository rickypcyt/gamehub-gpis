"use client";

import { Loader2, MessageSquare, Send, User } from "lucide-react";
import { useEffect, useState } from "react";

import Link from "next/link";
import Navbar from "@/components/Navbar";
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
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        // Check auth
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        setIsAuthenticated(!!session.user);

        // Load post
        const postRes = await fetch(`/api/blog/posts/${slug}`);
        if (postRes.ok) {
          const postData = await postRes.json();
          setPost(postData);

          // Load comments
          const commentsRes = await fetch(
            `/api/comments?post_id=${postData.id}`
          );
          if (commentsRes.ok) {
            const commentsData = await commentsRes.json();
            setComments(commentsData);
          }
        }
      } catch {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !post) return;

    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment, post_id: post.id }),
      });

      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [comment, ...prev]);
        setNewComment("");
        setMessage("Comentario publicado correctamente");
      } else {
        const data = await res.json();
        setMessage(data.error || "Error al publicar comentario");
      }
    } catch {
      setMessage("Error al publicar comentario");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-white">Post no encontrado</h1>
          <Link href="/blog" className="mt-4 text-violet-400 hover:text-violet-300">
            ← Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Post Header */}
        <div className="mb-8">
          <Link href="/blog" className="text-violet-400 hover:text-violet-300">
            ← Volver al blog
          </Link>
        </div>

        <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 md:p-8">
          {/* Author */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
              {post.author_avatar_url ? (
                <img
                  src={post.author_avatar_url}
                  alt={post.author_name || ""}
                  className="h-full w-full rounded-full object-cover"
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
                {new Date(post.created_at).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-6 text-2xl font-bold text-white md:text-3xl">
            {post.title}
          </h1>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            {post.content.split("\n").map((paragraph, i) => (
              <p key={i} className="mb-4 text-zinc-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </article>

        {/* Comments Section */}
        <section className="mt-10">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
            <MessageSquare className="h-5 w-5 text-violet-500" />
            Comentarios ({comments.length})
          </h2>

          {/* New Comment Form */}
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
              <p className="text-zinc-400">
                <Link href="/login" className="text-violet-400 hover:text-violet-300">
                  Inicia sesión
                </Link>{" "}
                para dejar un comentario
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
                    {comment.author_avatar ? (
                      <img
                        src={comment.author_avatar}
                        alt={comment.author_name || ""}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {comment.author_name || "Usuario"}
                    </span>
                    <span className="text-sm text-zinc-500">
                      {new Date(comment.created_at).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-zinc-300">{comment.content}</p>
              </div>
            ))}

            {comments.length === 0 && (
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
