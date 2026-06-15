"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { KeyRound, Shield, Users } from "lucide-react";
import { toast } from "sonner";

import {
  activateWorkspaceScimAction,
  rotateWorkspaceScimTokenAction,
} from "@/actions/workspace-scim";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { EnterpriseSsoScimLiveDashboard } from "@/lib/enterprise/enterprise-sso-scim-live-types";
import { cn } from "@/lib/utils";

type Props = {
  dashboard: EnterpriseSsoScimLiveDashboard;
};

const IDP_STATUS_CLASS: Record<
  EnterpriseSsoScimLiveDashboard["idpCards"][number]["status"],
  string
> = {
  active: "bg-emerald-600 hover:bg-emerald-600",
  configured: "bg-amber-500 hover:bg-amber-500",
  available: "bg-primary hover:bg-primary",
};

export function EnterpriseSsoScimLivePanel({ dashboard }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [revealedToken, setRevealedToken] = useState<string | null>(null);
  const { idpCards, scim, summary, warnings } = dashboard;

  function run(action: () => Promise<{ ok: boolean; error?: string; data?: { bearerToken?: string; message?: string } }>) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error ?? "Request failed.");
        return;
      }
      if (result.data?.bearerToken) {
        setRevealedToken(result.data.bearerToken);
      }
      toast.success(result.data?.message ?? "Saved.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6" data-testid="enterprise-sso-scim-live-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            <Shield className="h-8 w-8 text-primary" aria-hidden />
            Enterprise SSO + SCIM
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            LIVE SAML SSO for Okta, Microsoft Entra ID (Azure AD), and Google Workspace — plus RFC
            7644 SCIM 2.0 user provisioning for enterprise identity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="rounded-full bg-emerald-600 hover:bg-emerald-600">SSO LIVE</Badge>
          <Badge className="rounded-full bg-emerald-600 hover:bg-emerald-600">SCIM LIVE</Badge>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/settings/security/sso">SSO settings</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/enterprise/reports">Corporate reporting</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">LIVE IdPs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{summary.liveIdpCount}</p>
            <p className="text-xs text-muted-foreground">Okta · Entra · Google</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active IdP</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{summary.activeIdpVendor ?? "—"}</p>
            <p className="text-xs text-muted-foreground">
              SSO {dashboard.ssoActive ? "active" : "inactive"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">SCIM users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{summary.provisionedUsers}</p>
            <p className="text-xs text-muted-foreground">
              {summary.scimEnabled ? "Provisioning active" : "Enable SCIM below"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wiring cert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{dashboard.wiringCertPassed ? "PASSED" : "Pending"}</p>
            <p className="text-xs text-muted-foreground">SSO R2 pilot wiring</p>
          </CardContent>
        </Card>
      </div>

      {warnings.length > 0 ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Setup notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {idpCards.map((idp) => (
          <Card key={idp.id} data-testid={`idp-card-${idp.id}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{idp.label}</CardTitle>
                <Badge className={cn("capitalize", IDP_STATUS_CLASS[idp.status])}>{idp.status}</Badge>
              </div>
              <CardDescription>{idp.protocol}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{idp.statusLabel}</p>
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href={idp.setupHref}>Configure SSO</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card data-testid="scim-live-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" aria-hidden />
            SCIM 2.0 provisioning — LIVE
          </CardTitle>
          <CardDescription>
            Connect Okta or Entra automatic provisioning to KitchenOS workspace membership.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border/80 bg-muted/30 p-3 text-sm">
              <p className="font-medium">Users endpoint</p>
              <p className="mt-1 font-mono text-xs break-all">{scim.usersEndpoint}</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-muted/30 p-3 text-sm">
              <p className="font-medium">Groups endpoint</p>
              <p className="mt-1 font-mono text-xs break-all">{scim.groupsEndpoint}</p>
            </div>
          </div>
          <ul className="list-inside list-disc text-sm text-muted-foreground">
            {scim.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            {!scim.workspaceEnabled ? (
              <Button
                size="sm"
                className="rounded-full"
                disabled={pending || !dashboard.ssoEntitlementEnabled}
                onClick={() => run(activateWorkspaceScimAction)}
              >
                <KeyRound className="mr-2 h-4 w-4" aria-hidden />
                Activate SCIM
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                disabled={pending}
                onClick={() => run(rotateWorkspaceScimTokenAction)}
              >
                <KeyRound className="mr-2 h-4 w-4" aria-hidden />
                Rotate bearer token
              </Button>
            )}
          </div>
          {revealedToken ? (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3">
              <p className="text-xs font-medium text-muted-foreground">Bearer token (copy now)</p>
              <p className="mt-1 font-mono text-sm break-all">{revealedToken}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Policy {dashboard.policyId} · Generated {new Date(dashboard.generatedAtIso).toLocaleString()}
      </p>
    </div>
  );
}
