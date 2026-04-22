import type { Game } from "@/lib/neon";
import GamesClient from "./GamesClient";
import Navbar from "@/components/Navbar";
import { query } from "@/lib/neon";

export const revalidate = 300; // Cache 5 minutos
export const dynamic = 'force-static';

export default async function GamesPage() {
  // Ordenar: 1) Top de la historia por ID (ranking 1-10)
  //          2) Top 2020-2025 por ID (ranking 1-10)
  //          3) Resto por press_score
  const games = await query<Game>(
    `SELECT * FROM games 
     ORDER BY 
       CASE 
         WHEN category = 'Top de la historia' THEN 0 
         WHEN category = 'Top 2020-2025' THEN 1 
         ELSE 2 
       END,
       CASE 
         WHEN category IN ('Top de la historia', 'Top 2020-2025') THEN id 
         ELSE NULL 
       END,
       press_score DESC NULLS LAST
     LIMIT 100`
  );

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <GamesClient games={games} />
    </div>
  );
}
