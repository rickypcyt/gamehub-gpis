"use client";

import { Loader2, Send, Trash2, User, X } from "lucide-react";
import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
  author_id: string;
}

interface CommentsSectionProps {
  postId: string;
  comments: Comment[];
  isAuthenticated: boolean;
}

export function CommentsSection({ postId, comments, isAuthenticated }: CommentsSectionProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, post_id: postId }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setShowLoginModal(true);
          return;
        }
        throw new Error("Error al enviar comentario");
      }

      setContent("");
      router.refresh();
    } catch (error) {
      if ((error as Error)?.message !== "Error al enviar comentario") {
        alert("Error al enviar el comentario");
      } else {
        alert("Error al enviar el comentario");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm("¿Eliminar este comentario?")) return;

    setDeletingId(commentId);
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar");

      router.refresh();
    } catch {
      alert("Error al eliminar el comentario");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe tu comentario..."
            rows={3}
            maxLength={2000}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-base text-zinc-500">{content.length}/2000</span>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-base font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Comentar
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-lg bg-zinc-900/50 p-4 text-center">
          <p className="text-zinc-400">
            <Link href="/login" className="text-violet-400 hover:text-violet-300">Inicia sesión</Link>{" "}
            para dejar un comentario
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-zinc-500 py-8">No hay comentarios aún. Sé el primero en comentar.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800">
                {comment.author_avatar ? (
                  <Image
                    src={comment.author_avatar}
                    alt={comment.author_name}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <User className="h-4 w-4 text-zinc-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-white">{comment.author_name}</span>
                  <span className="text-base text-zinc-500">
                    {new Date(comment.created_at).toLocaleDateString("es-ES")}
                  </span>
                </div>
                <p className="mt-1 text-zinc-300 whitespace-pre-wrap">{comment.content}</p>
              </div>
              {/* Delete button - would need current user ID check in real implementation */}
              {deletingId === comment.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
              ) : (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="shrink-0 text-zinc-500 hover:text-red-400"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowLoginModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute right-4 top-4 text-zinc-500 hover:text-white"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Inicia sesión para comentar</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Debes iniciar sesión para participar en la conversación.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 text-center"
                >
                  Ir a iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-white hover:border-violet-500/60 hover:text-violet-300 text-center"
                >
                  Crear cuenta
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
