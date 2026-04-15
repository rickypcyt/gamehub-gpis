import Link from "next/link";
import { createClientServer } from "@/lib/supabase";
import { Users, ArrowLeft, MessageSquare, Calendar } from "lucide-react";
import type { BlogPost } from "@/lib/supabase";

export default async function BlogPage() {
  const supabase = await createClientServer();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*, author:profiles(name, avatar_url)")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="flex items-center gap-2 text-xl font-bold text-white">
              <Users className="h-6 w-6 text-violet-500" />
              Blog de Opinión
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-white">Análisis y Opiniones</h2>
          <p className="mt-2 text-zinc-400">
            Perspectivas de figuras destacadas del sector gaming
          </p>
        </div>

        <div className="space-y-6">
          {posts?.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        {!posts?.length && (
          <div className="py-16 text-center">
            <Users className="mx-auto h-12 w-12 text-zinc-600" />
            <p className="mt-4 text-zinc-500">No hay publicaciones aún</p>
          </div>
        )}
      </main>
    </div>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-violet-500/50">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
          {post.author?.avatar_url ? (
            <img
              src={post.author.avatar_url}
              alt={post.author.name || ""}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <Users className="h-5 w-5" />
          )}
        </div>
        <div>
          <p className="font-medium text-white">{post.author?.name || "Colaborador"}</p>
          <p className="text-xs text-zinc-500">
            {new Date(post.created_at).toLocaleDateString("es-ES")}
          </p>
        </div>
      </div>

      <Link href={`/blog/${post.slug}`}>
        <h3 className="mt-4 text-xl font-semibold text-white hover:text-violet-400">
          {post.title}
        </h3>
      </Link>

      <p className="mt-3 text-zinc-400 line-clamp-3">
        {post.content.substring(0, 200)}...
      </p>

      <div className="mt-4 flex items-center gap-4">
        <Link
          href={`/blog/${post.slug}`}
          className="text-sm font-medium text-violet-400 hover:text-violet-300"
        >
          Leer más →
        </Link>
        <span className="flex items-center gap-1 text-xs text-zinc-500">
          <MessageSquare className="h-3 w-3" />
          Comentarios
        </span>
      </div>
    </article>
  );
}
