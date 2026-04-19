import { query, queryOne } from "@/lib/neon";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const newsUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1).optional(),
  cover_image: z.string().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
});

// GET - Obtener una noticia
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const news = await queryOne(
      `SELECT n.*, p.name as author_name, p.avatar_url as author_avatar
       FROM news_posts n
       LEFT JOIN profiles p ON n.author_id = p.id
       WHERE n.id = $1`,
      [id]
    );

    if (!news) {
      return NextResponse.json(
        { error: "Noticia no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Error al obtener la noticia" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar noticia
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as string;
    if (!["admin", "redactor"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Check if news exists and user is author or admin
    interface NewsAuthor {
      author_id: string;
    }
    const existing = await queryOne<NewsAuthor>(
      "SELECT author_id FROM news_posts WHERE id = $1",
      [id]
    );

    if (!existing) {
      return NextResponse.json(
        { error: "Noticia no encontrada" },
        { status: 404 }
      );
    }

    // Only admin or author can edit
    if (userRole !== "admin" && existing.author_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = newsUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updates = parsed.data;
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        setClauses.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: "No hay datos para actualizar" }, { status: 400 });
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const news = await queryOne(
      `UPDATE news_posts SET ${setClauses.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    revalidatePath("/news");
    revalidatePath("/");

    return NextResponse.json(news);
  } catch (error) {
    console.error("Error updating news:", error);
    return NextResponse.json(
      { error: "Error al actualizar la noticia" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar noticia
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as string;
    if (!["admin", "redactor"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Check if news exists
    interface NewsAuthor {
      author_id: string;
    }
    const existing = await queryOne<NewsAuthor>(
      "SELECT author_id FROM news_posts WHERE id = $1",
      [id]
    );

    if (!existing) {
      return NextResponse.json(
        { error: "Noticia no encontrada" },
        { status: 404 }
      );
    }

    // Only admin or author can delete
    if (userRole !== "admin" && existing.author_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await query("DELETE FROM news_posts WHERE id = $1", [id]);

    revalidatePath("/news");
    revalidatePath("/");

    return NextResponse.json({ message: "Noticia eliminada" });
  } catch (error) {
    console.error("Error deleting news:", error);
    return NextResponse.json(
      { error: "Error al eliminar la noticia" },
      { status: 500 }
    );
  }
}
