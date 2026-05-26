"use client";

import { FormField } from "@/components/features/auth/FormField";
import { Gamepad2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [fields, setFields] = useState({ email: "", password: "" });

  const fieldErrors = {
    email: fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)
      ? "Introduce un email válido"
      : undefined,
    password: fields.password && fields.password.length < 6
      ? "Mínimo 6 caracteres"
      : undefined,
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const email = fields.email;
    const password = fields.password;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Credenciales inválidas. Verifica tu email y contraseña.");
      setLoading(false);
      return;
    }

    try {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;

      let redirectUrl = "/dashboard";
      switch (role) {
        case "admin":
          redirectUrl = "/dashboard";
          break;
        case "redactor":
          redirectUrl = "/admin/news";
          break;
        case "colaborador":
          redirectUrl = "/blog";
          break;
      }

      router.push(redirectUrl);
      router.refresh();
    } catch {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-xl backdrop-blur">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-white">Iniciar sesión</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Accede a tu cuenta de GameHub
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <FormField
              id="email"
              label="Email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              value={fields.email}
              onChange={(e) => {
                setFields((f) => ({ ...f, email: e.target.value }));
                if (touched.email) setError("");
              }}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              error={fieldErrors.email}
              touched={touched.email}
              isValid={!!fields.email && !fieldErrors.email}
            />

            <FormField
              id="password"
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={fields.password}
              onChange={(e) => {
                setFields((f) => ({ ...f, password: e.target.value }));
                if (touched.password) setError("");
              }}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              error={fieldErrors.password}
              touched={touched.password}
              isValid={!!fields.password && !fieldErrors.password}
            />

            {/* Options */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="remember"
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-violet-600 focus:ring-violet-500/20"
                />
                <span className="text-sm text-zinc-400">Recordarme</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-violet-400 hover:text-violet-300 transition"
              >
                ¿Olvidaste contraseña?
              </Link>
            </div>

            {/* Global Error */}
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-xs text-zinc-500">o</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-zinc-400">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="font-semibold text-violet-400 hover:text-violet-300 transition"
            >
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
