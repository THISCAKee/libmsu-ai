import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  verifyAdminSession,
} from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const authenticated = verifyAdminSession(
    token,
    process.env.ADMIN_SESSION_SECRET ?? "",
  );
  return NextResponse.json({ authenticated });
}
