import { canComment, getCurrentSession } from "@/lib/auth-utils";
import { query, queryOne } from "@/lib/neon";

import { NextResponse } from "next/server";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1, "El comentario no puede estar vacío").max(2000, "Máximo 2000 caracteres"),
  post_id: z.string().min(1, "ID de post requerido"),
});

// GET - Listar comentarios de un post
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("post_id");

    if (!postId) {
      return NextResponse.json(
        { error: "post_id es requerido" },
        { status: 400 }
      );
    }

    const comments = await query(
      `SELECT c.*, p.name as author_name, p.avatar_url as author_avatar
       FROM comments c
       LEFT JOIN profiles p ON c.author_id = p.id
       WHERE c.post_id = $1
       ORDER BY c.created_at DESC`,
      [postId]
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

// POST - Crear comentario
export async function POST(request: Request) {
  try {
    const canUserComment = await canComment();
    if (!canUserComment) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para comentar" },
        { status: 401 }
      );
    }

    const session = await getCurrentSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para comentar" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = commentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { content, post_id } = parsed.data;

    // Verificar que el post existe
    const postExists = await queryOne(
      "SELECT id FROM blog_posts WHERE id = $1",
      [post_id]
    );

    if (!postExists) {
      return NextResponse.json(
        { error: "Post no encontrado" },
        { status: 404 }
      );
    }

    const id = crypto.randomUUID();
    const comment = await queryOne(
      `INSERT INTO comments (id, content, author_id, post_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [id, content, session.user.id, post_id]
    );

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Error al crear el comentario" },
      { status: 500 }
    );
  }
}
