import { NextResponse } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const password = process.env.ADMIN_PASSWORD ?? "";
  const sessionSecret = process.env.ADMIN_SESSION_SECRET ?? "";
  if (!password || !sessionSecret) {
    return NextResponse.json(
      { success: false, error: "ระบบผู้ดูแลยังไม่ได้ตั้งค่า" },
      { status: 503 },
    );
  }

  let candidate = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    candidate = typeof body.password === "string" ? body.password : "";
  } catch {
    // Return the same generic response as every invalid credential.
  }

  if (!verifyAdminPassword(candidate, password)) {
    return NextResponse.json(
      { success: false, error: "รหัสผ่านไม่ถูกต้อง" },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE_NAME, createAdminSession(sessionSecret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
