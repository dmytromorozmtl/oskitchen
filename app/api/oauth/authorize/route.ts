import { NextResponse } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { validatePartnerOAuthAuthorizeParams } from "@/services/platform/partner-oauth-service";

export const dynamic = "force-dynamic";

/** OAuth 2.0 authorization endpoint — redirects to dashboard consent when authenticated. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = {
    clientId: url.searchParams.get("client_id") ?? "",
    redirectUri: url.searchParams.get("redirect_uri") ?? "",
    responseType: url.searchParams.get("response_type") ?? "",
    scope: url.searchParams.get("scope") ?? "",
    state: url.searchParams.get("state"),
  };

  const validated = validatePartnerOAuthAuthorizeParams(params);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  try {
    await requireSessionUser();
  } catch {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("redirect", `${url.pathname}${url.search}`);
    return NextResponse.redirect(loginUrl);
  }

  const actor = await requireWorkspacePermissionActor();
  const canInstall = hasPermission(actor.granted, "integrations.manage");
  if (!canInstall) {
    return NextResponse.json(
      { error: "You do not have permission to install partner apps in this workspace." },
      { status: 403 },
    );
  }

  const consentUrl = new URL("/dashboard/integrations/oauth-apps/consent", url.origin);
  consentUrl.searchParams.set("client_id", params.clientId);
  consentUrl.searchParams.set("redirect_uri", params.redirectUri);
  consentUrl.searchParams.set("scope", validated.scopes.join(" "));
  if (params.state) consentUrl.searchParams.set("state", params.state);

  return NextResponse.redirect(consentUrl);
}
