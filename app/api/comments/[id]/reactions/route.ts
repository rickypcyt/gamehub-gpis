import { query, queryOne } from "@/lib/neon";

import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-utils";
import { z } from "zod";

const reactionSchema = z.object({
  type: z.enum(["like", "dislike"]),
});

// GET - Obtener reacciones de un comentario
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await queryOne<{ likes: number; dislikes: number; user_reaction: string | null }>(
      `SELECT
        (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = $1 AND type = 'like') as likes,
        (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = $1 AND type = 'dislike') as dislikes,
        (SELECT type FROM comment_reactions WHERE comment_id = $1 AND user_id = $2 LIMIT 1) as user_reaction`,
      [id, null] // user_reaction will be null for now, client will track its own
    );

    return NextResponse.json({
      likes: Number(result?.likes) || 0,
      dislikes: Number(result?.dislikes) || 0,
      user_reaction: result?.user_reaction || null,
    });
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return NextResponse.json(
      { error: "Error al obtener reacciones" },
      { status: 500 }
    );
  }
}

// POST - Crear o cambiar reacción
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const parsed = reactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    const { type } = parsed.data;

    // Verificar que el comentario existe
    const commentExists = await queryOne(
      "SELECT id FROM comments WHERE id = $1",
      [id]
    );
    if (!commentExists) {
      return NextResponse.json(
        { error: "Comentario no encontrado" },
        { status: 404 }
      );
    }

    // Upsert: si ya existe una reacción del usuario, actualizar; si no, crear
    const existing = await queryOne<{ id: string; type: "like" | "dislike" }>(
      "SELECT id, type FROM comment_reactions WHERE comment_id = $1 AND user_id = $2",
      [id, session.user.id]
    );

    if (existing) {
      if (existing.type === type) {
        // Toggle off - eliminar reacción
        await query(
          "DELETE FROM comment_reactions WHERE id = $1",
          [existing.id]
        );
        return NextResponse.json({ liked: false, disliked: false });
      } else {
        // Cambiar tipo
        await query(
          "UPDATE comment_reactions SET type = $1 WHERE id = $2",
          [type, existing.id]
        );
        return NextResponse.json({ liked: type === "like", disliked: type === "dislike" });
      }
    }

    // Crear nueva reacción
    const reactionId = crypto.randomUUID();
    await queryOne(
      `INSERT INTO comment_reactions (id, comment_id, user_id, type, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [reactionId, id, session.user.id, type]
    );

    return NextResponse.json({ liked: type === "like", disliked: type === "dislike" }, { status: 201 });
  } catch (error) {
    console.error("Error creating reaction:", error);
    return NextResponse.json(
      { error: "Error al crear reacción" },
      { status: 500 }
    );
  }
}
