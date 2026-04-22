import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { queryOne } from "@/lib/neon";
import { checkRateLimit } from "@/lib/rate-limit";
import type { Profile, UserRole } from "@/lib/neon";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default {
  providers: [
    Credentials({
      async authorize(credentials, request) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Rate limiting check
        // Use email + IP for more accurate limiting
        const forwarded = request?.headers?.get("x-forwarded-for");
        const ip = forwarded?.split(",")[0]?.trim() || "unknown";
        const rateLimitKey = `${email}:${ip}`;

        const rateLimit = checkRateLimit(rateLimitKey);
        if (!rateLimit.allowed) {
          const minutesLeft = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
          throw new Error(`Demasiados intentos. Por favor espera ${minutesLeft} minutos.`);
        }

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
        token.role = user.role as UserRole;
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
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirección post-login según rol
      if (url === baseUrl || url.startsWith(`${baseUrl}/login`)) {
        // Obtener la sesión para saber el rol
        // Esto se ejecuta después del login exitoso
        return `${baseUrl}/dashboard`;
      }
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
