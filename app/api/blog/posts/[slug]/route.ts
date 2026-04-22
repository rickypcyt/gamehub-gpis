import { queryOne } from "@/lib/neon";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const post = await queryOne(
      `SELECT blog_posts.*, profiles.name as author_name, profiles.avatar_url as author_avatar_url
       FROM blog_posts 
       LEFT JOIN profiles ON blog_posts.author_id = profiles.id 
       WHERE blog_posts.slug = $1 AND blog_posts.published = true`,
      [slug]
    );

    if (!post) {
      return NextResponse.json(
        { error: "Post no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { error: "Error al obtener el post" },
      { status: 500 }
    );
  }
}
