import { canComment, getCurrentSession } from "@/lib/auth-utils";
import { type CommentPostType, ensureCommentsSchema, resolvePostType } from "@/lib/comments";
import { query, queryOne } from "@/lib/neon";

import { NextResponse } from "next/server";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1, "El comentario no puede estar vacío").max(2000, "Máximo 2000 caracteres"),
  post_id: z.string().min(1, "ID de post requerido"),
  parent_id: z.string().optional().nullable(),
});

interface CommentResponse {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  post_id: string;
  post_type: CommentPostType;
  parent_id: string | null;
  author_name: string | null;
  author_avatar: string | null;
  likes: number;
  dislikes: number;
}

// GET - Listar comentarios de un post
export async function GET(request: Request) {
  try {
    await ensureCommentsSchema();
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("post_id");

    if (!postId) {
      return NextResponse.json(
        { error: "post_id es requerido" },
        { status: 400 }
      );
    }

    const postType = await resolvePostType(postId);
    if (!postType) {
      return NextResponse.json(
        { error: "Post no encontrado" },
        { status: 404 }
      );
    }

    const comments = await query(
      `SELECT c.*, COALESCE(p.name, split_part(p.email, '@', 1), 'Usuario') as author_name, p.avatar_url as author_avatar,
        (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c.id AND type = 'like') as likes,
        (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c.id AND type = 'dislike') as dislikes
       FROM comments c
       LEFT JOIN profiles p ON c.author_id = p.id
       WHERE c.post_id = $1 AND c.post_type = $2
       ORDER BY c.parent_id NULLS FIRST, c.created_at DESC`,
      [postId, postType]
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
    await ensureCommentsSchema();
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

    const { content, post_id, parent_id } = parsed.data;

    const postType = await resolvePostType(post_id);

    if (!postType) {
      return NextResponse.json(
        { error: "Post no encontrado" },
        { status: 404 }
      );
    }

    // Si es reply, verificar que el comentario padre existe y pertenece al mismo post
    if (parent_id) {
      const parentExists = await queryOne(
        "SELECT id FROM comments WHERE id = $1 AND post_id = $2 AND post_type = $3",
        [parent_id, post_id, postType]
      );
      if (!parentExists) {
        return NextResponse.json(
          { error: "Comentario padre no encontrado" },
          { status: 404 }
        );
      }
    }

    const id = crypto.randomUUID();
    const comment = await queryOne<CommentResponse>(
      `WITH inserted AS (
        INSERT INTO comments (id, content, author_id, post_id, post_type, parent_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
      )
      SELECT i.*, COALESCE(p.name, split_part(p.email, '@', 1), 'Usuario') as author_name, p.avatar_url as author_avatar,
        0::int as likes,
        0::int as dislikes
      FROM inserted i
      LEFT JOIN profiles p ON i.author_id = p.id`,
      [id, content, session.user.id, post_id, postType, parent_id || null]
    );

    const responseBody = {
      ...comment,
      likes: Number(comment?.likes) || 0,
      dislikes: Number(comment?.dislikes) || 0,
      user_reaction: null,
    } as CommentResponse & { user_reaction: null };

    return NextResponse.json(responseBody, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Error al crear el comentario" },
      { status: 500 }
    );
  }
}
