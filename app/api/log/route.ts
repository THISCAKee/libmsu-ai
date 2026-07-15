import { NextResponse } from "next/server";

const formatTimestamp = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour12: false,
  }).formatToParts(new Date());

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("hour")}:${getPart("minute")} ${getPart("day")}/${getPart("month")}/${getPart("year")}`;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, studentId, year, faculty, major, department, action, platformName } = body;
    const timestamp = formatTimestamp();
    const payload = {
      timestamp,
      name,
      role,
      studentId: role === "นิสิต" ? studentId : "-",
      year: role === "นิสิต" ? year : "-",
      faculty: role === "นิสิต" ? faculty : "-",
      major: role === "นิสิต" ? major : "-",
      department: role === "บุคลากร" ? department : "-",
      action: action || "Click AI Platform",
      platformName: platformName || "-",
    };

    const scriptUrl = process.env.GOOGLE_SHEETS_SCRIPT_URL;

    console.log("Logging entry:", payload);

    if (!scriptUrl) {
      console.error("GOOGLE_SHEETS_SCRIPT_URL is not configured.");
      return NextResponse.json(
        { success: false, error: "Logging service is not configured" },
        { status: 503 },
      );
    }

    // Send data to Google Apps Script Web App
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let scriptResult: { success?: boolean; error?: string } | null = null;

    try {
      scriptResult = JSON.parse(responseText);
    } catch {
      // ตรวจสอบด้านล่างในรูปแบบคำตอบที่ไม่ถูกต้องจาก Apps Script
    }

    if (!response.ok || scriptResult?.success !== true) {
      const detail =
        scriptResult?.error || responseText || `HTTP ${response.status}`;
      console.error("Failed to log to Google Sheets Apps Script:", detail);
      return NextResponse.json(
        { success: false, error: "Failed to record usage" },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Logging error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
