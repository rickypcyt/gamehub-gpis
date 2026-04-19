import { ArrowLeft, Newspaper, Users } from "lucide-react";

import Link from "next/link";
import type { Profile } from "@/lib/neon";
import { query } from "@/lib/neon";

export default async function TeamPage() {
  // Obtener redactores y colaboradores
  const team = await query<Profile>(
    "SELECT * FROM profiles WHERE role IN ('redactor', 'colaborador') ORDER BY created_at DESC"
  );

  const redactores = team?.filter((p) => p.role === "redactor");
  const colaboradores = team?.filter((p) => p.role === "colaborador");

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="flex items-center gap-2 text-xl font-bold text-white">
              <Users className="h-6 w-6 text-violet-500" />
              Equipo
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white">Nuestro Equipo</h2>
          <p className="mt-3 text-zinc-400">
            Las personas detrás de GameHub
          </p>
        </div>

        {/* Redactores */}
        {redactores && redactores.length > 0 && (
          <section className="mb-12">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-white">
              <Newspaper className="h-5 w-5 text-violet-500" />
              Redacción
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {redactores.map((member) => (
                <TeamCard key={member.id} member={member} />
              ))}
            </div>
          </section>
        )}

        {/* Colaboradores */}
        {colaboradores && colaboradores.length > 0 && (
          <section>
            <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-white">
              <Users className="h-5 w-5 text-blue-500" />
              Colaboradores
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {colaboradores.map((member) => (
                <TeamCard key={member.id} member={member} />
              ))}
            </div>
          </section>
        )}

        {!team?.length && (
          <div className="py-16 text-center">
            <Users className="mx-auto h-12 w-12 text-zinc-600" />
            <p className="mt-4 text-zinc-500">El equipo se está formando...</p>
          </div>
        )}
      </main>
    </div>
  );
}

function TeamCard({ member }: { member: Profile }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center transition hover:border-violet-500/50">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
        {member.avatar_url ? (
          <img
            src={member.avatar_url}
            alt={member.name || ""}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <Users className="h-10 w-10" />
        )}
      </div>
      <h4 className="font-semibold text-white">{member.name || "Sin nombre"}</h4>
      <p className="text-sm text-violet-400 capitalize">{member.role}</p>
      {member.bio && (
        <p className="mt-3 text-sm text-zinc-400 line-clamp-3">{member.bio}</p>
      )}
      {member.website && (
        <a
          href={member.website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm text-zinc-500 hover:text-white"
        >
          {member.website}
        </a>
      )}
    </div>
  );
}
