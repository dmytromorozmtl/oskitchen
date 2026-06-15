import { NextResponse } from "next/server";

/**
 * Sandbox OAuth callback helper for local partner development.
 * Displays the authorization code for manual token exchange during pilot.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const state = url.searchParams.get("state");

  if (error) {
    return NextResponse.json({ ok: false, error, state }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json(
      { ok: false, error: "missing_code", hint: "Complete consent in dashboard first." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    code,
    state,
    hint: "Exchange this code at POST /api/oauth/token with client_id, client_secret, redirect_uri.",
  });
}
