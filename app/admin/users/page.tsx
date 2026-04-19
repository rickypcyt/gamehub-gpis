import { ArrowLeft, Crown, Edit3, Shield, Trash2, User, UserCog } from "lucide-react";

import Link from "next/link";
import { auth } from "@/auth";
import { query } from "@/lib/neon";
import { redirect } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  bio: string | null;
  created_at: string;
}

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const users = await query<User>(
    `SELECT id, email, name, role, bio, created_at
     FROM profiles
     ORDER BY 
       CASE role 
         WHEN 'admin' THEN 1 
         WHEN 'redactor' THEN 2 
         WHEN 'colaborador' THEN 3 
         ELSE 4 
       END, 
       created_at DESC`
  );

  const roleConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    admin: {
      label: "Administrador",
      color: "bg-red-500/10 text-red-400 border-red-500/20",
      icon: <Shield className="h-4 w-4" />,
    },
    redactor: {
      label: "Redactor",
      color: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      icon: <Edit3 className="h-4 w-4" />,
    },
    colaborador: {
      label: "Colaborador",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      icon: <UserCog className="h-4 w-4" />,
    },
    suscriptor: {
      label: "Suscriptor",
      color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
      icon: <User className="h-4 w-4" />,
    },
  };

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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                <Crown className="h-5 w-5 text-red-400" />
              </div>
              <h1 className="text-xl font-bold text-white">Gestión de Usuarios</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(roleConfig).map(([role, config]) => {
            const count = users.filter((u) => u.role === role).length;
            return (
              <div
                key={role}
                className={`rounded-xl border p-4 ${config.color}`}
              >
                <div className="flex items-center gap-2">
                  {config.icon}
                  <span className="text-sm font-medium">{config.label}</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{count}</p>
                <p className="text-xs opacity-70">usuarios</p>
              </div>
            );
          })}
        </div>

        {/* Users Table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-zinc-800 bg-zinc-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">Usuario</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">Rol</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">Fecha de registro</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-zinc-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.map((user) => {
                  const isCurrentUser = user.id === session.user.id;

                  return (
                    <tr key={user.id} className="hover:bg-zinc-800/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                            <User className="h-5 w-5 text-zinc-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {user.name || "Sin nombre"}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-zinc-500">(Tú)</span>
                              )}
                            </p>
                            <p className="text-sm text-zinc-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <form
                          action={`/admin/users/${user.id}/role`}
                          method="POST"
                          className="inline-block"
                        >
                          <select
                            name="role"
                            defaultValue={user.role}
                            disabled={isCurrentUser}
                            onChange={(e) => e.target.form?.submit()}
                            className={`rounded-lg border px-3 py-1.5 text-sm font-medium outline-none transition ${
                              isCurrentUser
                                ? "cursor-not-allowed border-zinc-700 bg-zinc-800 text-zinc-500"
                                : `cursor-pointer border-zinc-700 bg-zinc-900 hover:border-zinc-600`
                            }`}
                          >
                            <option value="suscriptor">Suscriptor</option>
                            <option value="colaborador">Colaborador</option>
                            <option value="redactor">Redactor</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </form>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-400">
                          {new Date(user.created_at).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/users/${user.id}/edit`}
                            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            title="Editar"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Link>
                          {!isCurrentUser && (
                            <form
                              action={`/api/users/${user.id}/delete`}
                              method="POST"
                              className="inline"
                              onSubmit={(e) => {
                                if (!confirm("¿Eliminar este usuario permanentemente?")) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <button
                                type="submit"
                                className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
