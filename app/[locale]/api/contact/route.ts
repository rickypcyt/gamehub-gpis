import { NextRequest, NextResponse } from "next/server";

import { query } from "@/lib/neon";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  subject: z.string().min(3, "El asunto es requerido"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    // Insertar mensaje en Neon
    await query(
      `INSERT INTO contact_messages (name, email, subject, message, read) 
       VALUES ($1, $2, $3, $4, false)`,
      [name, email, subject, message]
    );

    return NextResponse.json(
      { success: true, message: "Mensaje enviado correctamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en API contact:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
