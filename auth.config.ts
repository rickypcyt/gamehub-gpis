import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { createClientAdmin } from "@/lib/supabase";
import type { Profile } from "@/lib/supabase";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const supabase = createClientAdmin();

        // Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError || !authData.user) return null;

        // Get profile with role
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authData.user.id)
          .single();

        return {
          id: authData.user.id,
          email: authData.user.email!,
          name: profile?.name || authData.user.user_metadata?.name || null,
          role: (profile?.role as Profile["role"]) || "suscriptor",
          image: profile?.avatar_url,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      // Handle session updates
      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
