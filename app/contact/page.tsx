"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-2xl font-bold text-white">¡Mensaje enviado!</h1>
          <p className="mt-2 text-zinc-400">
            Gracias por contactarnos. Te responderemos pronto.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-md bg-violet-600 px-6 py-2 text-white hover:bg-violet-700"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4">
          <Link href="/" className="flex items-center gap-4 text-zinc-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
            <span>Volver</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Contacto</h1>
          <p className="mt-2 text-zinc-400">
            Envíanos tus consultas o sugerencias
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">Nombre</Label>
              <Input
                id="name"
                name="name"
                required
                className="border-zinc-700 bg-zinc-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="border-zinc-700 bg-zinc-800 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-zinc-300">Asunto</Label>
            <Input
              id="subject"
              name="subject"
              required
              className="border-zinc-700 bg-zinc-800 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-zinc-300">Mensaje</Label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700"
            disabled={loading}
          >
            <Send className="mr-2 h-4 w-4" />
            {loading ? "Enviando..." : "Enviar mensaje"}
          </Button>
        </form>
      </main>
    </div>
  );
}
