import { NextResponse } from "next/server";
import { queryOne } from "@/lib/neon";
import { z } from "zod";

const valoracionSchema = z.object({
  id_juego: z.string().uuid(),
  nota: z.number().min(0).max(10),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const parsed = valoracionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { id_juego, nota } = parsed.data;

    // TODO: Verificar sesión del usuario y obtener id_usuario
    // Por ahora, usar un id de prueba
    const id_usuario = "test-user-id";

    // UPSERT: Insertar o actualizar valoración
    const valoracion = await queryOne(
      `INSERT INTO valoraciones (id, id_usuario, id_juego, nota, created_at, updated_at)
       VALUES (
         gen_random_uuid(),
         $1,
         $2,
         $3,
         NOW(),
         NOW()
       )
       ON CONFLICT (id_usuario, id_juego)
       DO UPDATE SET 
         nota = EXCLUDED.nota,
         updated_at = NOW()
       RETURNING *`,
      [id_usuario, id_juego, nota]
    );

    return NextResponse.json(valoracion, { status: 201 });
  } catch (error) {
    console.error("Error creating valoracion:", error);
    return NextResponse.json(
      { error: "Error al crear valoración" },
      { status: 500 }
    );
  }
}
