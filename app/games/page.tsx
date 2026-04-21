import type { Game } from "@/lib/neon";
import GamesClient from "./GamesClient";
import { query } from "@/lib/neon";

export const revalidate = 300; // Cache 5 minutos
export const dynamic = 'force-static';

export default async function GamesPage() {
  const games = await query<Game>(
    "SELECT * FROM games ORDER BY press_score DESC NULLS LAST LIMIT 100"
  );

  return <GamesClient games={games} />;
}
