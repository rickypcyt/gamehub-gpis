"use client";

import {
  BarChart3,
  Eye,
  MessageSquare,
  Newspaper,
  TrendingUp,
  Users,
} from "lucide-react";

export default function StatsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Estadísticas</h1>
        <p className="mt-1 text-sm text-zinc-400">Métricas y rendimiento de la plataforma</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Usuarios totales" value="1,247" icon={<Users className="h-5 w-5" />} change="+12%" />
        <StatCard title="Noticias publicadas" value="342" icon={<Newspaper className="h-5 w-5" />} change="+8%" />
        <StatCard title="Comentarios" value="5,891" icon={<MessageSquare className="h-5 w-5" />} change="+24%" />
        <StatCard title="Vistas totales" value="128.4K" icon={<Eye className="h-5 w-5" />} change="+18%" />
      </div>

      {/* Charts Placeholder */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Vistas mensuales" icon={<TrendingUp className="h-5 w-5" />}>
          <div className="flex items-end gap-2 h-40">
            {[40, 55, 45, 60, 75, 65, 80, 95, 85, 100, 90, 110].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-violet-500/60 transition-all hover:bg-violet-500"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] text-zinc-500">{["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Contenido por categoría" icon={<BarChart3 className="h-5 w-5" />}>
          <div className="space-y-4">
            {[
              { label: "Noticias", value: 142, color: "bg-violet-500" },
              { label: "Análisis", value: 68, color: "bg-emerald-500" },
              { label: "Guías", value: 54, color: "bg-amber-500" },
              { label: "Multimedia", value: 45, color: "bg-blue-500" },
              { label: "Blog", value: 33, color: "bg-red-500" },
            ].map((cat) => (
              <div key={cat.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-300">{cat.label}</span>
                  <span className="text-zinc-500">{cat.value}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-800">
                  <div
                    className={`h-2 rounded-full ${cat.color}`}
                    style={{ width: `${(cat.value / 142) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Top Content Table */}
      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-base font-semibold text-white">Top contenido más visto</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-zinc-500">#</th>
                <th className="px-6 py-3 text-left font-medium text-zinc-500">Título</th>
                <th className="px-6 py-3 text-left font-medium text-zinc-500">Autor</th>
                <th className="px-6 py-3 text-left font-medium text-zinc-500">Vistas</th>
                <th className="px-6 py-3 text-left font-medium text-zinc-500">Comentarios</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              <TopRow rank={1} title="Elden Ring 2: Todo lo que sabemos" author="Carlos R." views="12.4K" comments="89" />
              <TopRow rank={2} title="Nintendo Switch 2: Precio y fecha" author="Ana L." views="9.8K" comments="156" />
              <TopRow rank={3} title="Top 10 indies del mes" author="Pedro M." views="7.2K" comments="42" />
              <TopRow rank={4} title="Black Myth Wukong - Review" author="Carlos R." views="6.5K" comments="67" />
              <TopRow rank={5} title="Guía: 100% Zelda TOTK" author="María G." views="5.1K" comments="23" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, change }: { title: string; value: string; icon: React.ReactNode; change: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-violet-500/30">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg bg-violet-500/10 p-2.5 text-violet-500">{icon}</div>
        <span className="text-xs font-medium text-emerald-400">{change}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-zinc-500">{title}</p>
    </div>
  );
}

function ChartCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-6 py-4">
        <span className="text-violet-400">{icon}</span>
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function TopRow({ rank, title, author, views, comments }: { rank: number; title: string; author: string; views: string; comments: string }) {
  return (
    <tr className="hover:bg-zinc-800/50">
      <td className="px-6 py-3">
        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
          rank === 1 ? "bg-amber-500/20 text-amber-400" :
          rank === 2 ? "bg-zinc-500/20 text-zinc-300" :
          rank === 3 ? "bg-orange-500/20 text-orange-400" :
          "bg-zinc-800 text-zinc-500"
        }`}>
          {rank}
        </span>
      </td>
      <td className="px-6 py-3 font-medium text-white">{title}</td>
      <td className="px-6 py-3 text-zinc-400">{author}</td>
      <td className="px-6 py-3 text-zinc-400">{views}</td>
      <td className="px-6 py-3 text-zinc-400">{comments}</td>
    </tr>
  );
}
