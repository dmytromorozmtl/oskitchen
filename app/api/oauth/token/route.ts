import { NextResponse } from "next/server";

import { exchangePartnerOAuthAuthorizationCode } from "@/services/platform/partner-oauth-service";

export const dynamic = "force-dynamic";

type TokenBody = {
  grant_type?: string;
  code?: string;
  redirect_uri?: string;
  client_id?: string;
  client_secret?: string;
};

async function parseTokenBody(request: Request): Promise<TokenBody> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await request.json().catch(() => ({}))) as TokenBody;
  }
  const form = await request.formData().catch(() => null);
  if (!form) return {};
  return {
    grant_type: form.get("grant_type")?.toString(),
    code: form.get("code")?.toString(),
    redirect_uri: form.get("redirect_uri")?.toString(),
    client_id: form.get("client_id")?.toString(),
    client_secret: form.get("client_secret")?.toString(),
  };
}

/** OAuth 2.0 token endpoint — authorization_code grant only (Phase 3). */
export async function POST(request: Request) {
  const body = await parseTokenBody(request);

  if (body.grant_type !== "authorization_code") {
    return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400 });
  }

  if (!body.code || !body.client_id || !body.client_secret || !body.redirect_uri) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const result = await exchangePartnerOAuthAuthorizationCode({
    clientId: body.client_id,
    clientSecret: body.client_secret,
    code: body.code,
    redirectUri: body.redirect_uri,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    access_token: result.accessToken,
    token_type: result.tokenType,
    scope: result.scope,
    installation_id: result.installationId,
  });
}
