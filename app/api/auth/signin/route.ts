import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const redirectUrl = new URL("/", url.origin);

  if (error) {
    redirectUrl.searchParams.set("error", error);
  }

  return NextResponse.redirect(redirectUrl);
}
