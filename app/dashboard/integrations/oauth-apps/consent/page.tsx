import { redirect } from "next/navigation";

import { PartnerOAuthConsentPanel } from "@/components/dashboard/oauth/partner-oauth-consent-panel";
import { requireIntegrationsReadPage } from "@/lib/integrations/integrations-page-access";
import { intersectPartnerOAuthScopes, parsePartnerOAuthScopeList } from "@/lib/developer/partner-oauth-scopes";
import {
  getMergedPartnerOAuthAppByClientId,
  isPartnerOAuthAppInstallable,
  listMergedPartnerOAuthAppDefinitions,
} from "@/services/platform/partner-oauth-app-registry-service";
import { isRedirectUriAllowed } from "@/lib/oauth/partner-oauth-app-catalog";

type ConsentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PartnerOAuthConsentPage({ searchParams }: ConsentPageProps) {
  const access = await requireIntegrationsReadPage();
  if (!access.ok) return access.deny;

  const params = await searchParams;
  const clientId = String(params.client_id ?? "");
  const redirectUri = String(params.redirect_uri ?? "");
  const scopeRaw = String(params.scope ?? "");
  const state = params.state ? String(params.state) : undefined;

  const app = await getMergedPartnerOAuthAppByClientId(clientId);
  if (!app || !isPartnerOAuthAppInstallable(app.status) || !isRedirectUriAllowed(app, redirectUri)) {
    redirect("/dashboard/integrations/oauth-apps");
  }

  const requested = parsePartnerOAuthScopeList(scopeRaw);
  const scopes = intersectPartnerOAuthScopes(requested, app.allowedScopes);
  if (scopes.length === 0) {
    redirect("/dashboard/integrations/oauth-apps");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Authorize partner app</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review permissions before redirecting back to the partner application.
        </p>
      </div>
      <PartnerOAuthConsentPanel
        app={app}
        redirectUri={redirectUri}
        scopes={scopes}
        state={state}
        canManage={access.canManage}
      />
    </div>
  );
}
