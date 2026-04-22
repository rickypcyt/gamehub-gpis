import { NextResponse } from "next/server";
import { query } from "@/lib/neon";
import { requireRole } from "@/lib/auth-utils";

// GET - Listar todos los usuarios (solo admin)
export async function GET() {
  try {
    const session = await requireRole(["admin"]);
    if (!session) {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const users = await query(
      `SELECT id, email, name, role, bio, location, website, avatar_url, created_at, updated_at
       FROM profiles
       ORDER BY created_at DESC`
    );

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}
