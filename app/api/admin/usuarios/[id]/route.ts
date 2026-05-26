import { NextResponse } from "next/server";
import { queryOne } from "@/lib/neon";
import { z } from "zod";

const updateUsuarioSchema = z.object({
  rol: z.enum(["admin", "redactor", "colaborador", "suscriptor"]).optional(),
  activo: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const parsed = updateUsuarioSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { rol, activo } = parsed.data;

    // Si se está intentando eliminar el único admin
    if ((rol && rol !== "admin") || activo === false) {
      const adminCount = await queryOne(
        "SELECT COUNT(*) as count FROM profiles WHERE role = 'admin' AND id != $1",
        [id]
      ) as { count: string | number } | null;

      if (!adminCount || Number(adminCount.count) === 0) {
        return NextResponse.json(
          { error: "No se puede eliminar el único administrador" },
          { status: 409 }
        );
      }
    }

    const usuario = await queryOne(
      `UPDATE profiles 
       SET role = COALESCE($2, role),
           active = COALESCE($3, active),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, name, role, active`,
      [id, rol, activo]
    );

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Error updating usuario:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verificar si es el único admin
    const adminCount = await queryOne(
      "SELECT COUNT(*) as count FROM profiles WHERE role = 'admin' AND id != $1",
      [id]
    ) as { count: string | number } | null;

    if (!adminCount || Number(adminCount.count) === 0) {
      return NextResponse.json(
        { error: "No se puede eliminar el único administrador" },
        { status: 409 }
      );
    }

    const usuario = await queryOne(
      "DELETE FROM profiles WHERE id = $1 RETURNING id, email, name, role",
      [id]
    );

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Error deleting usuario:", error);
    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 }
    );
  }
}
