import { NextResponse } from "next/server";

import { verifyPartnerAppEmbedToken } from "@/lib/oauth/partner-app-embed-token";

export const dynamic = "force-dynamic";

/** Partner-facing embed session verification — validates HMAC-signed embed_token. */
export async function POST(request: Request) {
  let body: { token?: string; embed_token?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const token = String(body.token ?? body.embed_token ?? "").trim();
  if (!token) {
    return NextResponse.json({ ok: false, error: "missing_token" }, { status: 400 });
  }

  const payload = verifyPartnerAppEmbedToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "invalid_or_expired_token" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    session: {
      installationId: payload.installationId,
      workspaceId: payload.workspaceId,
      clientId: payload.clientId,
      userId: payload.userId,
      issuedAt: payload.iat,
      expiresAt: payload.exp,
    },
  });
}
