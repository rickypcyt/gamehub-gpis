"use client";

import { FormField } from "@/components/features/auth/FormField";
import { Gamepad2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PasswordStrength } from "@/components/features/auth/PasswordStrength";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [fields, setFields] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const fieldErrors = {
    username:
      touched.username && fields.username.length < 2
        ? "Mínimo 2 caracteres"
        : undefined,
    email:
      touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)
        ? "Introduce un email válido"
        : undefined,
    password:
      touched.password && fields.password.length < 6
        ? "Mínimo 6 caracteres"
        : undefined,
    confirmPassword:
      touched.confirmPassword &&
      fields.confirmPassword !== fields.password
        ? "Las contraseñas no coinciden"
        : undefined,
  };

  function isFormValid() {
    return (
      fields.username.length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) &&
      fields.password.length >= 6 &&
      fields.password === fields.confirmPassword &&
      fields.terms
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    if (!isFormValid()) {
      setTouched({
        username: true,
        email: true,
        password: true,
        confirmPassword: true,
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.username,
          email: fields.email,
          password: fields.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          showToast(data.error || "Ya existe una cuenta con este email", "error");
        } else {
          showToast(data.error || "Error al crear la cuenta", "error");
        }
        setLoading(false);
        return;
      }

      showToast("Cuenta creada exitosamente. Redirigiendo...", "success");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      showToast("Error al crear la cuenta", "error");
      setLoading(false);
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
            <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Únete a la comunidad GameHub
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <FormField
              id="username"
              label="Nombre de usuario"
              type="text"
              placeholder="Tu nombre"
              autoComplete="name"
              value={fields.username}
              onChange={(e) =>
                setFields((f) => ({ ...f, username: e.target.value }))
              }
              onBlur={() => setTouched((t) => ({ ...t, username: true }))}
              error={fieldErrors.username}
              touched={touched.username}
              isValid={!!fields.username && !fieldErrors.username}
            />

            <FormField
              id="email"
              label="Email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              value={fields.email}
              onChange={(e) =>
                setFields((f) => ({ ...f, email: e.target.value }))
              }
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              error={fieldErrors.email}
              touched={touched.email}
              isValid={!!fields.email && !fieldErrors.email}
            />

            <div className="space-y-2">
              <FormField
                id="password"
                label="Contraseña"
                type="password"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                value={fields.password}
                onChange={(e) =>
                  setFields((f) => ({ ...f, password: e.target.value }))
                }
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                error={fieldErrors.password}
                touched={touched.password}
                isValid={!!fields.password && !fieldErrors.password}
              />
              <PasswordStrength password={fields.password} />
            </div>

            <FormField
              id="confirmPassword"
              label="Confirmar contraseña"
              type="password"
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              value={fields.confirmPassword}
              onChange={(e) =>
                setFields((f) => ({
                  ...f,
                  confirmPassword: e.target.value,
                }))
              }
              onBlur={() =>
                setTouched((t) => ({ ...t, confirmPassword: true }))
              }
              error={fieldErrors.confirmPassword}
              touched={touched.confirmPassword}
              isValid={
                !!fields.confirmPassword && !fieldErrors.confirmPassword
              }
            />

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={fields.terms}
                onChange={(e) =>
                  setFields((f) => ({ ...f, terms: e.target.checked }))
                }
                className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-violet-600 focus:ring-violet-500/20"
              />
              <span className="text-sm text-zinc-400">
                Acepto los{" "}
                <Link
                  href="/terms"
                  className="text-violet-400 hover:text-violet-300"
                >
                  términos y condiciones
                </Link>{" "}
                y la{" "}
                <Link
                  href="/privacy"
                  className="text-violet-400 hover:text-violet-300"
                >
                  política de privacidad
                </Link>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-xs text-zinc-500">o</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-zinc-400">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="font-semibold text-violet-400 hover:text-violet-300 transition"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
