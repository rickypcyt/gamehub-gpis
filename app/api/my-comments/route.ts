import { getCurrentSession } from "@/lib/auth-utils";
import { ensureCommentsSchema } from "@/lib/comments";
import { query } from "@/lib/neon";

import { NextResponse } from "next/server";

interface MyComment {
  id: string;
  content: string;
  created_at: string;
  post_title: string | null;
  post_slug: string | null;
  post_type: "news" | "blog";
}

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureCommentsSchema();

    const comments = await query<MyComment>(
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
      ORDER BY c.created_at DESC`,
      [session.user.id]
    );

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching my comments:", error);
    return NextResponse.json(
      { error: "Error al obtener comentarios" },
      { status: 500 }
    );
  }
}
