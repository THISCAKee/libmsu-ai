import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

if (!process.env.NEXTAUTH_URL && process.env.AUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.AUTH_URL;
}

if (!process.env.NEXTAUTH_SECRET && process.env.AUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET;
}

const allowedEmailDomains = (
  process.env.AUTH_ALLOWED_EMAIL_DOMAINS ??
  process.env.AUTH_ALLOWED_EMAIL_DOMAIN ??
  ""
)
  .split(",")
  .map((domain) => domain.trim().toLowerCase().replace(/^@/, ""))
  .filter(Boolean);

function isAllowedEmail(email: string) {
  const normalizedEmail = email.toLowerCase();
  return allowedEmailDomains.some((domain) =>
    normalizedEmail.endsWith(`@${domain}`),
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/",
    error: "/",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_MSU_CLIENT_ID!,
      clientSecret: process.env.AUTH_MSU_CLIENT_SECRET!,
      authorization: {
        params: {
          // บังคับให้เลือก account ทุกครั้ง
          prompt: "select_account",
          hd: allowedEmailDomains[0] ?? "msu.ac.th",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      const email = user.email;

      if (!email || allowedEmailDomains.length === 0) {
        return false;
      }

      return isAllowedEmail(email);
    },

    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.image = (token.picture as string) ?? session.user.image;
      }
      return session;
    },
  },
};
