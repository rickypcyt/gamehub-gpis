import { query, queryOne } from "@/lib/neon";

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const newsSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  slug: z.string().min(1, "El slug es obligatorio"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "El contenido es obligatorio"),
  cover_image: z.string().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
});

// GET - Listar noticias
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get("published") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    let sql = `
      SELECT n.*, p.name as author_name, p.avatar_url as author_avatar
      FROM news_posts n
      LEFT JOIN profiles p ON n.author_id = p.id
    `;
    const params: unknown[] = [];

    if (publishedOnly) {
      sql += " WHERE n.published = true";
    }

    sql += " ORDER BY n.created_at DESC LIMIT $1 OFFSET $2";
    params.push(limit, offset);

    const news = await query(sql, params);

    return NextResponse.json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Error al obtener noticias" },
      { status: 500 }
    );
  }
}

// POST - Crear noticia
export async function POST(request: Request) {
  try {
    const session = await requireRole(["admin", "redactor"]);
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = newsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, slug, excerpt, content, cover_image, published, featured } = parsed.data;

    // Check if slug already exists
    const existing = await queryOne("SELECT id FROM news_posts WHERE slug = $1", [slug]);
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una noticia con ese slug" },
        { status: 409 }
      );
    }

    const id = crypto.randomUUID();
    const news = await queryOne(
      `INSERT INTO news_posts (id, title, slug, excerpt, content, cover_image, published, featured, author_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [id, title, slug, excerpt || null, content, cover_image || null, published, featured, session.user.id]
    );

    revalidatePath("/news");
    revalidatePath("/");

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    console.error("Error creating news:", error);
    return NextResponse.json(
      { error: "Error al crear la noticia" },
      { status: 500 }
    );
  }
}
