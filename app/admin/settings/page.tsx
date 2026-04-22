import { ArrowLeft, Settings, Shield, Bell, Database } from "lucide-react";

import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                <Settings className="h-5 w-5 text-violet-400" />
              </div>
              <h1 className="text-xl font-bold text-white">Configuración del Sistema</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Security Settings */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <Shield className="h-5 w-5 text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Seguridad</h2>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <h3 className="font-medium text-white mb-2">Protección de Admin</h3>
                <p className="text-sm text-zinc-400 mb-3">
                  El sistema impide que el último administrador sea eliminado o cambie su propio rol.
                </p>
                <span className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400">
                  Activo
                </span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <h3 className="font-medium text-white mb-2">Roles del Sistema</h3>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    <span>Administrador: Control total</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-violet-400" />
                    <span>Redactor: Gestión de contenido</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    <span>Colaborador: Contenido secundario</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-zinc-400" />
                    <span>Suscriptor: Solo lectura + comentarios</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Database className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Información del Sistema</h2>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <h3 className="font-medium text-white mb-2">Base de Datos</h3>
                <p className="text-sm text-zinc-400">Neon PostgreSQL</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <h3 className="font-medium text-white mb-2">Autenticación</h3>
                <p className="text-sm text-zinc-400">NextAuth.js con JWT</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <h3 className="font-medium text-white mb-2">Framework</h3>
                <p className="text-sm text-zinc-400">Next.js 15 (App Router)</p>
              </div>
            </div>
          </div>

          {/* Notifications Settings */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Bell className="h-5 w-5 text-yellow-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Notificaciones</h2>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="text-sm text-zinc-400">
                  Configuración de notificaciones próximamente disponible.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Settings className="h-5 w-5 text-green-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Acciones Rápidas</h2>
            </div>
            <div className="space-y-3">
              <Link
                href="/admin/users"
                className="block rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:bg-zinc-800/50 transition"
              >
                <h3 className="font-medium text-white">Gestionar Usuarios</h3>
                <p className="text-sm text-zinc-400">Cambiar roles, editar perfiles</p>
              </Link>
              <Link
                href="/admin/news"
                className="block rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:bg-zinc-800/50 transition"
              >
                <h3 className="font-medium text-white">Gestionar Noticias</h3>
                <p className="text-sm text-zinc-400">Moderar contenido editorial</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
