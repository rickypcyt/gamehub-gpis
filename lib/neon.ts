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

// Cliente Neon para el servidor
export function createClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(process.env.DATABASE_URL);
}

// Helper para ejecutar queries con el cliente
export async function query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
  const sqlClient = createClient();
  const result = await sqlClient(sql, params || []);
  return result as T[];
}

// Helper para ejecutar una query que devuelve un solo registro
export async function queryOne<T = unknown>(sql: string, params?: unknown[]): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}
