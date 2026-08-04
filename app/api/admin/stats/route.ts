import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  verifyAdminSession,
} from "@/lib/admin-auth";
import {
  AdminDataConfigurationError,
  fetchUsageRows,
} from "@/lib/admin-data";
import { buildAdminStats, listUsageYears } from "@/lib/admin-stats";

export async function GET(request: NextRequest) {
  const authenticated = verifyAdminSession(
    request.cookies.get(ADMIN_COOKIE_NAME)?.value,
    process.env.ADMIN_SESSION_SECRET ?? "",
  );
  if (!authenticated) {
    return NextResponse.json(
      { success: false, error: "กรุณาเข้าสู่ระบบผู้ดูแล" },
      { status: 401 },
    );
  }

  const requestedYear = request.nextUrl.searchParams.get("year");
  if (requestedYear && !/^\d{4}$/.test(requestedYear)) {
    return NextResponse.json(
      { success: false, error: "ปีที่เลือกไม่ถูกต้อง" },
      { status: 400 },
    );
  }

  try {
    const rows = await fetchUsageRows();
    const years = listUsageYears(rows);
    const currentYear = new Date().getFullYear();
    const selectedYear = requestedYear
      ? Number(requestedYear)
      : years.includes(currentYear)
        ? currentYear
        : (years[0] ?? currentYear);

    return NextResponse.json({
      success: true,
      years,
      selectedYear,
      stats: buildAdminStats(rows, selectedYear),
    });
  } catch (error) {
    if (error instanceof AdminDataConfigurationError) {
      return NextResponse.json(
        { success: false, error: "ระบบรายงานยังไม่ได้ตั้งค่า" },
        { status: 503 },
      );
    }
    console.error("Admin statistics error:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถโหลดข้อมูลรายงานได้" },
      { status: 502 },
    );
  }
}
