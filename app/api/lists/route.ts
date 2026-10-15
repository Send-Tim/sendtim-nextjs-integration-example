import { NextResponse } from "next/server";
import { hasAdminAccess } from "../_lib/admin";
import { sendtimRequest, sendtimResponse } from "../_lib/sendtim";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ error: { code: "unauthenticated", message: "Autentificare necesară." } }, { status: 401 });
  }

  return sendtimResponse(await sendtimRequest("/lists"));
}
