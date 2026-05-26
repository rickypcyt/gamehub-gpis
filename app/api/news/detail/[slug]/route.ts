import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { queryOne } from "@/lib/neon";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await auth();

    // If authenticated as admin or redactor, allow viewing unpublished posts
    const canViewUnpublished = session?.user?.role === "admin" || session?.user?.role === "redactor";

    const newsPost = await queryOne(
      `SELECT news_posts.*, profiles.name as author_name, profiles.avatar_url as author_avatar_url
       FROM news_posts
       LEFT JOIN profiles ON news_posts.author_id = profiles.id
       WHERE news_posts.slug = $1
       ${canViewUnpublished ? "" : "AND news_posts.published = true"}`,
      [slug]
    );

    if (!newsPost) {
      return NextResponse.json(
        { error: "Noticia no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(newsPost);
  } catch (error) {
    console.error("Error fetching news post:", error);
    return NextResponse.json(
      { error: "Error al obtener la noticia" },
      { status: 500 }
    );
  }
}
