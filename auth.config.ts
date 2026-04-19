import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { queryOne } from "@/lib/neon";
import type { Profile } from "@/lib/neon";

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

        // Get profile with password hash from Neon
        const profile = await queryOne<Profile & { password_hash: string }>(
          "SELECT * FROM profiles WHERE email = $1",
          [email]
        );

        if (!profile || !profile.password_hash) return null;

        // Verify password with bcrypt
        const isValidPassword = await bcrypt.compare(password, profile.password_hash);
        if (!isValidPassword) return null;

        return {
          id: profile.id,
          email: profile.email,
          name: profile.name || null,
          role: profile.role,
          image: profile.avatar_url,
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
