import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { queryOne } from "@/lib/neon";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    // Check if user already exists
    const existingUser = await queryOne(
      "SELECT id FROM profiles WHERE email = $1",
      [email]
    );

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate unique ID
    const id = crypto.randomUUID();

    // Create user
    const newUser = await queryOne(
      `INSERT INTO profiles (id, email, name, role, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, 'suscriptor', $4, NOW(), NOW())
       RETURNING id, email, name, role`,
      [id, email, name, passwordHash]
    );

    return NextResponse.json(
      { message: "Cuenta creada exitosamente", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Error al crear la cuenta" },
      { status: 500 }
    );
  }
}
