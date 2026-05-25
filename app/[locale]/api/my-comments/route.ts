import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensureCommentsSchema } from "@/lib/comments";
import { query } from "@/lib/neon";

// GET - Obtener comentarios del usuario actual
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureCommentsSchema();

    const comments = await query(
      `SELECT 
         c.id,
         c.content,
         c.created_at,
         c.post_type,
         COALESCE(n.title, b.title) as post_title,
         COALESCE(n.slug, b.slug) as post_slug
       FROM comments c
       LEFT JOIN news_posts n ON c.post_type = 'news' AND c.post_id = n.id
       LEFT JOIN blog_posts b ON c.post_type = 'blog' AND c.post_id = b.id
       WHERE c.author_id = $1
       ORDER BY c.created_at DESC`,
      [session.user.id]
    );

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Error al obtener comentarios" },
      { status: 500 }
    );
  }
}
