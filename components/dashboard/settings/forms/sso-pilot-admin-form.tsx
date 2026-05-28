"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import {
  activateWorkspaceSsoPilotAction,
  configureWorkspaceSsoPilotAction,
  deactivateWorkspaceSsoPilotAction,
} from "@/actions/workspace-sso";
import { getActionError } from "@/lib/action-result";
import type { WorkspaceSsoAdminView } from "@/lib/enterprise/workspace-sso-admin-service";
import { SsoPilotSetupWizard } from "@/components/dashboard/settings/sso-pilot-setup-wizard";
import { buildSsoPilotLoginUrl } from "@/lib/enterprise/enterprise-sso-login-entry-focus-era18";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type SsoPilotAdminFormProps = {
  initial: WorkspaceSsoAdminView;
};

export function SsoPilotAdminForm({ initial }: SsoPilotAdminFormProps) {
  const [view, setView] = React.useState(initial);
  const [pending, startTransition] = React.useTransition();

  const settings = view.settings;
  const [idpVendor, setIdpVendor] = React.useState(settings?.idpVendor ?? "OKTA");
  const [allowedEmailDomains, setAllowedEmailDomains] = React.useState(
    (settings?.allowedEmailDomains ?? []).join("\n"),
  );
  const [supabaseSsoProviderRef, setSupabaseSsoProviderRef] = React.useState(
    settings?.supabaseSsoProviderRef ?? "",
  );
  const [loginHintDomain, setLoginHintDomain] = React.useState(settings?.loginHintDomain ?? "");
  const [breakGlassOwnerEnabled, setBreakGlassOwnerEnabled] = React.useState(
    settings?.breakGlassOwnerEnabled ?? true,
  );

  function refreshLocal(next: Partial<WorkspaceSsoAdminView>) {
    setView((current) => ({ ...current, ...next }));
  }

  function onConfigure(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("idpVendor", idpVendor);
    fd.set("allowedEmailDomains", allowedEmailDomains);
    fd.set("supabaseSsoProviderRef", supabaseSsoProviderRef);
    fd.set("loginHintDomain", loginHintDomain);
    if (breakGlassOwnerEnabled) fd.set("breakGlassOwnerEnabled", "on");

    startTransition(async () => {
      const res = await configureWorkspaceSsoPilotAction(fd);
      if (!res.ok) {
        toast.error(getActionError(res) ?? "Failed to save SSO configuration.");
        return;
      }
      toast.success("SSO pilot configuration saved (inactive until activated).");
      refreshLocal({ configured: true, active: false, runtimeGateAllowed: false });
    });
  }

  function onActivate() {
    startTransition(async () => {
      const res = await activateWorkspaceSsoPilotAction();
      if (!res.ok) {
        toast.error(getActionError(res) ?? "Failed to activate SSO pilot.");
        return;
      }
      toast.success("SSO pilot activated for this workspace.");
      refreshLocal({ active: true, runtimeGateAllowed: true });
    });
  }

  function onDeactivate() {
    startTransition(async () => {
      const res = await deactivateWorkspaceSsoPilotAction();
      if (!res.ok) {
        toast.error(getActionError(res) ?? "Failed to deactivate SSO pilot.");
        return;
      }
      toast.success("SSO pilot deactivated.");
      refreshLocal({ active: false, runtimeGateAllowed: false });
    });
  }

  return (
    <div className="space-y-6">
      <SsoPilotSetupWizard view={view} />

      <Card id="sso-pilot-status">
        <CardHeader>
          <CardTitle className="text-base">Pilot status</CardTitle>
          <CardDescription>
            SSO remains pilot-gated — not production SAML/OIDC for all tenants.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant={view.ssoEntitlementEnabled ? "default" : "destructive"}>
            ssoOidc entitlement: {view.ssoEntitlementEnabled ? "enabled" : "missing"}
          </Badge>
          <Badge variant={view.configured ? "secondary" : "outline"}>
            configured: {view.configured ? "yes" : "no"}
          </Badge>
          <Badge variant={view.active ? "default" : "outline"}>
            pilot active: {view.active ? "yes" : "no"}
          </Badge>
        </CardContent>
      </Card>

      {!view.ssoEntitlementEnabled ? (
        <Card id="sso-pilot-entitlement">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Enterprise SSO entitlement (`ssoOidc`) is required before configuring a pilot tenant.
            Upgrade plan or add an entitlement override for the workspace owner.
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={onConfigure} className="space-y-6">
          <Card id="sso-pilot-configuration">
            <CardHeader>
              <CardTitle className="text-base">Pilot IdP configuration</CardTitle>
              <CardDescription>
                Configure Supabase SAML SSO for one pilot tenant. IdP metadata is managed in Supabase
                dashboard — reference the provider id below.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="idpVendor">IdP vendor</Label>
                <select
                  id="idpVendor"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={idpVendor}
                  onChange={(e) => setIdpVendor(e.target.value as "OKTA" | "ENTRA_ID")}
                  disabled={pending}
                >
                  <option value="OKTA">Okta</option>
                  <option value="ENTRA_ID">Microsoft Entra ID</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supabaseSsoProviderRef">Supabase SSO provider reference</Label>
                <Input
                  id="supabaseSsoProviderRef"
                  value={supabaseSsoProviderRef}
                  onChange={(e) => setSupabaseSsoProviderRef(e.target.value)}
                  placeholder="okta-pilot-tenant"
                  disabled={pending}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowedEmailDomains">Allowed email domains</Label>
                <Textarea
                  id="allowedEmailDomains"
                  value={allowedEmailDomains}
                  onChange={(e) => setAllowedEmailDomains(e.target.value)}
                  placeholder={"acme.com\nsubsidiary.com"}
                  rows={3}
                  disabled={pending}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loginHintDomain">Login hint domain (optional)</Label>
                <Input
                  id="loginHintDomain"
                  value={loginHintDomain}
                  onChange={(e) => setLoginHintDomain(e.target.value)}
                  placeholder="acme.com"
                  disabled={pending}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={breakGlassOwnerEnabled}
                  onChange={(e) => setBreakGlassOwnerEnabled(e.target.checked)}
                  disabled={pending}
                />
                Allow break-glass email/password for workspace owner
              </label>
            </CardContent>
          </Card>

          <div id="sso-pilot-activation" className="flex flex-wrap gap-2 scroll-mt-24">
            <Button type="submit" disabled={pending}>
              Save pilot configuration
            </Button>
            <Button type="button" variant="secondary" disabled={pending || !view.configured} onClick={onActivate}>
              Activate SSO pilot
            </Button>
            <Button type="button" variant="outline" disabled={pending || !view.active} onClick={onDeactivate}>
              Deactivate SSO pilot
            </Button>
          </div>
        </form>
      )}

      <Card id="sso-pilot-login-entry">
        <CardHeader>
          <CardTitle className="text-base">Staff login entry</CardTitle>
          <CardDescription>
            When active, staff open{" "}
            <Link
              href={buildSsoPilotLoginUrl(view.workspaceId)}
              className="text-primary hover:underline"
            >
              /login with workspace pre-filled
            </Link>{" "}
            and choose “Sign in with SSO”. Workspace id{" "}
            <code className="text-xs">{view.workspaceId}</code>.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
