import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { queryOne, query } from "@/lib/neon";
import { z } from "zod";

const commentUpdateSchema = z.object({
  content: z.string().min(1).max(2000),
});

// PUT - Actualizar comentario
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar que el comentario existe
    interface CommentAuthor {
      author_id: string;
    }
    const existing = await queryOne<CommentAuthor>(
      "SELECT author_id FROM comments WHERE id = $1",
      [id]
    );

    if (!existing) {
      return NextResponse.json(
        { error: "Comentario no encontrado" },
        { status: 404 }
      );
    }

    // Solo el autor o admin pueden editar
    const userRole = session.user.role as string;
    if (userRole !== "admin" && existing.author_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = commentUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { content } = parsed.data;

    const comment = await queryOne(
      `UPDATE comments 
       SET content = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [content, id]
    );

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Error al actualizar el comentario" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar comentario
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar que el comentario existe
    interface CommentAuthor {
      author_id: string;
    }
    const existing = await queryOne<CommentAuthor>(
      "SELECT author_id FROM comments WHERE id = $1",
      [id]
    );

    if (!existing) {
      return NextResponse.json(
        { error: "Comentario no encontrado" },
        { status: 404 }
      );
    }

    // Solo el autor o admin pueden eliminar
    const userRole = session.user.role as string;
    if (userRole !== "admin" && existing.author_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await query("DELETE FROM comments WHERE id = $1", [id]);

    return NextResponse.json({ message: "Comentario eliminado" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Error al eliminar el comentario" },
      { status: 500 }
    );
  }
}
