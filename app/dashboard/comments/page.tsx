"use client";

import { ArrowLeft, Loader2, MessageSquare, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  post_title: string;
  post_slug: string;
}

export default function MyCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadComments() {
      try {
        const response = await fetch("/api/my-comments");
        if (!response.ok) throw new Error("Error al cargar comentarios");
        const data = await response.json();
        setComments(data);
      } catch {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    }
    loadComments();
  }, []);

  async function handleDelete(commentId: string) {
    if (!confirm("¿Eliminar este comentario?")) return;

    setDeletingId(commentId);
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar");

      setComments(comments.filter((c) => c.id !== commentId));
    } catch {
      alert("Error al eliminar el comentario");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-white">Mis Comentarios</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {comments.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="mx-auto h-12 w-12 text-zinc-600" />
            <p className="mt-4 text-zinc-500">No has dejado ningún comentario aún</p>
            <Link href="/news" className="mt-4 inline-block text-violet-400 hover:text-violet-300">
              Ir a las noticias
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/news/${comment.post_slug}`}
                      className="text-sm font-medium text-violet-400 hover:text-violet-300"
                    >
                      En: {comment.post_title}
                    </Link>
                    <p className="mt-2 text-zinc-300 whitespace-pre-wrap">{comment.content}</p>
                    <p className="mt-3 text-xs text-zinc-500">
                      {new Date(comment.created_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingId === comment.id}
                    className="ml-4 rounded-lg p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                  >
                    {deletingId === comment.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
