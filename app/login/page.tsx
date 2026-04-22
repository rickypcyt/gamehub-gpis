"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Credenciales inválidas");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al crear la cuenta");
        setLoading(false);
        return;
      }

      setSuccess("Cuenta creada exitosamente. Ahora puedes iniciar sesión.");
      setIsRegister(false);
      setLoading(false);
    } catch {
      setError("Error al crear la cuenta");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-zinc-900 p-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">GameHub</h1>
          <p className="mt-2 text-zinc-400">
            {isRegister ? "Crea tu cuenta" : "Inicia sesión en tu cuenta"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-zinc-800 p-1">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError("");
              setSuccess("");
            }}
            className={`flex-1 rounded-md py-2 text-base font-medium transition-colors ${
              !isRegister
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-zinc-300"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError("");
              setSuccess("");
            }}
            className={`flex-1 rounded-md py-2 text-base font-medium transition-colors ${
              isRegister
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-zinc-300"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        {/* Messages */}
        {error && <p className="text-base text-red-400">{error}</p>}
        {success && <p className="text-base text-green-400">{success}</p>}

        {/* Login Form */}
        {!isRegister && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="tu@email.com"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        )}

        {/* Register Form */}
        {isRegister && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">
                Nombre
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Tu nombre"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="tu@email.com"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700"
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
