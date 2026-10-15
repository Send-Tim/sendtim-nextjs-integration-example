import { NextRequest, NextResponse } from "next/server";
import { sendtimRequest, sendtimResponse } from "../_lib/sendtim";
import { checkRateLimit, getClientKey } from "../_lib/rate-limit";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 10_000;
const MAX_PROPERTY_LENGTH = 120;
const ALLOWED_PROPERTY_KEYS = new Set(["company", "source"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: { code: "origin_not_allowed", message: "Originea cererii nu este permisă." } }, { status: 403 });
  }

  const rateLimit = checkRateLimit(getClientKey(request));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: { code: "rate_limited", message: "Prea multe cereri. Încearcă din nou mai târziu." } },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: { code: "payload_too_large", message: "Cererea este prea mare." } }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: { code: "payload_too_large", message: "Cererea este prea mare." } }, { status: 413 });
    }
    const parsed: unknown = JSON.parse(rawBody);
    if (!isRecord(parsed)) throw new Error("Body must be an object");
    body = parsed;
  } catch {
    return NextResponse.json({ error: { code: "validation_failed", message: "Corpul cererii trebuie să fie JSON valid." } }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = body.name === undefined ? "" : typeof body.name === "string" ? body.name.trim() : null;
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: { code: "validation_failed", message: "Introdu o adresă de email validă." } }, { status: 400 });
  }
  if (name === null || name.length > 80) {
    return NextResponse.json({ error: { code: "validation_failed", message: "Prenumele nu este valid." } }, { status: 400 });
  }

  const properties: Record<string, string> = {};
  if (body.properties !== undefined) {
    if (!isRecord(body.properties)) {
      return NextResponse.json({ error: { code: "validation_failed", message: "properties trebuie să fie un obiect JSON." } }, { status: 400 });
    }

    for (const [key, value] of Object.entries(body.properties)) {
      if (!ALLOWED_PROPERTY_KEYS.has(key) || typeof value !== "string" || value.length > MAX_PROPERTY_LENGTH) {
        return NextResponse.json(
          { error: { code: "validation_failed", message: "properties conține un câmp nepermis sau invalid." } },
          { status: 400 },
        );
      }
      properties[key] = value.trim();
    }
  }

  const result = await sendtimRequest("/contacts", {
    method: "POST",
    // Keep controlled fields authoritative even if the input shape changes later.
    body: JSON.stringify({ ...properties, email, ...(name ? { name } : {}) }),
  });
  return sendtimResponse(result);
}
