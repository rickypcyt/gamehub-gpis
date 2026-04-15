import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

// Cliente para el navegador
export function createClientBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Cliente para el servidor (Server Components)
export async function createClientServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

// Cliente admin para operaciones de servidor (usar con Service Role Key)
export function createClientAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
