import { NextRequest, NextResponse } from "next/server";

import { createClientAdmin } from "@/lib/supabase";
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

    // Usar cliente admin para insertar mensajes (no requiere autenticación)
    const supabase = createClientAdmin();

    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      subject,
      message,
      read: false,
    });

    if (error) {
      console.error("Error insertando mensaje:", error);
      return NextResponse.json(
        { error: "Error al guardar el mensaje" },
        { status: 500 }
      );
    }

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
