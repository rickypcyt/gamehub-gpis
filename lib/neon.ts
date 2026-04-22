import { neon } from "@neondatabase/serverless";

// Tipos de las tablas de GameHub
export type UserRole = "admin" | "redactor" | "colaborador" | "suscriptor";

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  bio: string | null;
  location: string | null;
  website: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  release_date: string | null;
  genre: string[] | null;
  platform: string[] | null;
  press_score: number | null;
  user_score: number | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  published: boolean;
  featured: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  author_id: string;
  author?: Profile;
  author_name?: string;
  author_avatar?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
  author?: Profile;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  post_id: string;
  author?: Profile;
}

export interface Multimedia {
  id: string;
  title: string;
  type: "video" | "stream" | "trailer";
  url: string;
  thumbnail: string | null;
  platform: string | null;
  featured: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  type: "launch" | "convention" | "expo";
  start_date: string;
  end_date: string | null;
  location: string | null;
  url: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

// Cliente Neon para el servidor - Singleton para reutilizar conexiones
let sql: ReturnType<typeof neon> | null = null;

export function createClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

// Helper para ejecutar queries con el cliente
export async function query<T = unknown>(sqlStr: string, params?: unknown[]): Promise<T[]> {
  console.log('[Neon Query] Executing SQL:', sqlStr.substring(0, 100) + '...');
  console.log('[Neon Query] Params:', params);

  try {
    const sqlClient = createClient();
    const result = await sqlClient(sqlStr, params || []);
    const rows = Array.isArray(result) ? result : [];
    console.log('[Neon Query] Success, rows returned:', rows.length);
    return rows as T[];
  } catch (error) {
    console.error('[Neon Query] Error:', error);
    throw error;
  }
}

// Helper para ejecutar una query que devuelve un solo registro
export async function queryOne<T = unknown>(sql: string, params?: unknown[]): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}
