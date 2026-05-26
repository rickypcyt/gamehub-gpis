import { NextResponse } from "next/server";
import { query } from "@/lib/neon";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const juegos = await query(
      `SELECT 
        g.*,
        g.press_score AS nota_prensa,
        COALESCE(AVG(v.nota), 0) AS nota_comunidad,
        COUNT(v.id) AS total_valoraciones
       FROM games g
       LEFT JOIN valoraciones v ON g.id = v.id_juego
       GROUP BY g.id
       ORDER BY g.press_score DESC NULLS LAST, nota_comunidad DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Asegurar que los datos sean serializables
    const serializableJuegos = JSON.parse(JSON.stringify(juegos));
    
    return NextResponse.json(serializableJuegos);
  } catch (error) {
    console.error("Error fetching catalogo:", error);
    return NextResponse.json(
      { error: "Error al obtener catálogo" },
      { status: 500 }
    );
  }
}
