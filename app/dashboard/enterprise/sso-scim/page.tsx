import type { Metadata } from "next";

import { EnterpriseSsoScimLivePanel } from "@/components/enterprise/enterprise-sso-scim-live-panel";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadEnterpriseSsoScimLiveDashboard } from "@/services/enterprise/enterprise-sso-scim-live-service";

export const metadata: Metadata = {
  title: "Enterprise SSO + SCIM — LIVE",
  description:
    "LIVE SAML SSO for Okta, Microsoft Entra ID, and Google Workspace with RFC 7644 SCIM provisioning.",
};

export const dynamic = "force-dynamic";

export default async function EnterpriseSsoScimLivePage() {
  const { workspaceId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">Enterprise SSO + SCIM requires a workspace</CardTitle>
          <CardDescription>
            Configure your workspace to enable LIVE SAML SSO and SCIM 2.0 user provisioning.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const dashboard = await loadEnterpriseSsoScimLiveDashboard(workspaceId);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 pb-10">
      <EnterpriseSsoScimLivePanel dashboard={dashboard} />
    </div>
  );
}
