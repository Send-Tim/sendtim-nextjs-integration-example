import { NextResponse } from "next/server";

const API_BASE = "https://sendtim.com/api/v1";

export async function sendtimRequest(path: string, init: RequestInit = {}) {
  const apiKey = process.env.SENDTIM_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      data: { error: { code: "configuration_error", message: "Lipsește SENDTIM_API_KEY în configurarea serverului." } },
    };
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch {
    return {
      ok: false,
      status: 502,
      data: { error: { code: "upstream_unavailable", message: "Nu am putut contacta Sendtim. Încearcă din nou puțin mai târziu." } },
    };
  }
}

export function sendtimResponse(result: Awaited<ReturnType<typeof sendtimRequest>>) {
  if (result.ok) {
    return NextResponse.json(result.data, { status: result.status });
  }

  // Do not expose upstream/server details from a public demo endpoint.
  return NextResponse.json(
    {
      error: {
        code: "sendtim_request_failed",
        message: "Nu am putut procesa cererea. Încearcă din nou mai târziu.",
      },
    },
    { status: result.status },
  );
}
