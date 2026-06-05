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

const SESSION_MAX_AGE_SECONDS = 3 * 60 * 60; // 3 ชั่วโมง

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS, // JWT หมดอายุหลัง 3 ชั่วโมง
  },

  pages: {
    signIn: "/",
    error: "/",
  },

  // ตั้งค่า cookie เป็น session cookie (ไม่มี maxAge)
  // เมื่อปิด browser/tab cookie จะถูกลบอัตโนมัติ
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // ไม่ตั้ง maxAge → browser จะลบ cookie เมื่อปิด tab/browser
      },
    },
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
        token.loginAt = Date.now(); // จดเวลาเข้าสู่ระบบ
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.image = (token.picture as string) ?? session.user.image;
      }
      // ส่งเวลา loginAt ไปให้ client เพื่อนับถอยหลัง
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any).loginAt = token.loginAt;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any).maxAge = SESSION_MAX_AGE_SECONDS;
      return session;
    },
  },
};
