import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { query, queryOne } from "@/lib/neon";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const gameSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().optional(),
  cover_image: z.string().optional(),
  release_date: z.string().optional(),
  genre: z.array(z.string()).optional(),
  platform: z.array(z.string()).optional(),
  press_score: z.number().min(0).max(100).optional(),
  user_score: z.number().min(0).max(100).optional(),
});

// GET - Listar juegos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const genre = searchParams.get("genre");
    const platform = searchParams.get("platform");

    let sql = "SELECT * FROM games WHERE 1=1";
    const params: unknown[] = [];
    let paramIndex = 1;

    if (genre) {
      sql += ` AND $${paramIndex} = ANY(genre)`;
      params.push(genre);
      paramIndex++;
    }

    if (platform) {
      sql += ` AND $${paramIndex} = ANY(platform)`;
      params.push(platform);
      paramIndex++;
    }

    sql += ` ORDER BY COALESCE(press_score, 0) DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const games = await query(sql, params);

    return NextResponse.json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Error al obtener juegos" },
      { status: 500 }
    );
  }
}

// POST - Crear juego (solo admin/redactor)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as string;
    if (!["admin", "redactor"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = gameSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      cover_image,
      release_date,
      genre,
      platform,
      press_score,
      user_score,
    } = parsed.data;

    const id = crypto.randomUUID();
    const game = await queryOne(
      `INSERT INTO games (id, title, description, cover_image, release_date, genre, platform, press_score, user_score, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [
        id,
        title,
        description || null,
        cover_image || null,
        release_date || null,
        genre || [],
        platform || [],
        press_score || null,
        user_score || null,
      ]
    );

    revalidatePath("/games");

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json(
      { error: "Error al crear el juego" },
      { status: 500 }
    );
  }
}
