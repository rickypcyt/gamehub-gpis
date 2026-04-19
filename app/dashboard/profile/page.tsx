"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  email: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) throw new Error("Error al cargar perfil");
        const data = await response.json();
        setProfile(data);
      } catch {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      bio: formData.get("bio") as string,
      location: formData.get("location") as string,
      website: formData.get("website") as string,
      avatar_url: formData.get("avatar_url") as string,
    };

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Error al guardar");

      setMessage("Perfil actualizado correctamente");
      router.refresh();
    } catch {
      setMessage("Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-white">Editar Perfil</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {message && (
          <div className={`mb-6 rounded-lg p-4 ${message.includes("Error") ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Nombre</label>
              <input
                name="name"
                type="text"
                defaultValue={profile?.name || ""}
                placeholder="Tu nombre"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Email</label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-zinc-500 cursor-not-allowed"
              />
              <p className="text-xs text-zinc-500">El email no se puede cambiar</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">URL de foto de perfil</label>
            <input
              name="avatar_url"
              type="url"
              defaultValue={profile?.avatar_url || ""}
              placeholder="https://ejemplo.com/foto.jpg"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Biografía</label>
            <textarea
              name="bio"
              rows={4}
              defaultValue={profile?.bio || ""}
              placeholder="Cuéntanos sobre ti..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Ubicación</label>
              <input
                name="location"
                type="text"
                defaultValue={profile?.location || ""}
                placeholder="Ciudad, País"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Website</label>
              <input
                name="website"
                type="url"
                defaultValue={profile?.website || ""}
                placeholder="https://tusitio.com"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-2 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>

            <Link
              href="/dashboard"
              className="rounded-lg border border-zinc-700 px-6 py-2 font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
