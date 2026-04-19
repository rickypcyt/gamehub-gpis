import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { queryOne } from "@/lib/neon";
import { revalidatePath } from "next/cache";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const formData = await request.formData();
    const role = formData.get("role") as string;

    const validRoles = ["admin", "redactor", "colaborador", "suscriptor"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    // No permitir cambiar el rol de uno mismo
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "No puedes cambiar tu propio rol" },
        { status: 400 }
      );
    }

    await queryOne(
      "UPDATE profiles SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [role, id]
    );

    revalidatePath("/admin/users");
    revalidatePath("/dashboard");

    return NextResponse.redirect(new URL("/admin/users", request.url));
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Error al actualizar rol" },
      { status: 500 }
    );
  }
}
