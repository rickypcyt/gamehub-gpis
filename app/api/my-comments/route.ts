import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { query } from "@/lib/neon";

// GET - Obtener comentarios del usuario actual
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comments = await query(
      `SELECT c.id, c.content, c.created_at, n.title as post_title, n.slug as post_slug
       FROM comments c
       JOIN news_posts n ON c.post_id = n.id
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
