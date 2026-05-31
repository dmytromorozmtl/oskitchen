"use client";

import Link from "next/link";
import { useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Loader2, Trash2 } from "lucide-react";

import { revokePartnerOAuthInstallationAction } from "@/actions/partner-oauth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PARTNER_OAUTH_SCOPE_LABEL, type PartnerOAuthScope } from "@/lib/developer/partner-oauth-scopes";
import {
  buildPartnerOAuthAuthorizeUrl,
  type PartnerOAuthAppDefinition,
} from "@/lib/oauth/partner-oauth-app-catalog";
import type { PartnerAppInstallationView } from "@/services/platform/partner-oauth-service";

type PartnerOAuthAppsPanelProps = {
  installations: PartnerAppInstallationView[];
  apps: PartnerOAuthAppDefinition[];
  canManage: boolean;
  origin: string;
};

export function PartnerOAuthAppsPanel({
  installations,
  apps,
  canManage,
  origin,
}: PartnerOAuthAppsPanelProps) {
  const [pending, startTransition] = useTransition();

  const installedClientIds = new Set(
    installations.filter((i) => i.status === "ACTIVE").map((i) => i.clientId),
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sandbox apps</CardTitle>
          <CardDescription>
            Curated OAuth apps for pilot partners — install via authorization code flow. Production app
            review pipeline is Phase 4.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {apps.map((app) => {
            const installed = installedClientIds.has(app.clientId);
            const redirectUri = app.redirectUris[0] ?? "";
            const installHref = buildPartnerOAuthAuthorizeUrl({
              clientId: app.clientId,
              redirectUri,
              scopes: app.allowedScopes,
              state: `install-${app.clientId}`,
              origin,
            });
            return (
              <div key={app.clientId} className="rounded-lg border border-border/70 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{app.name}</h3>
                  <Badge variant="outline">{app.status}</Badge>
                  {installed ? <Badge variant="secondary">Installed</Badge> : null}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{app.publisher}</p>
                <p className="mt-2 text-sm text-muted-foreground">{app.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {app.allowedScopes.map((scope) => (
                    <Badge key={scope} variant="outline" className="text-[10px] font-normal">
                      {scope}
                    </Badge>
                  ))}
                </div>
                {canManage ? (
                  <Button asChild size="sm" className="mt-3 rounded-full" disabled={!redirectUri}>
                    <Link href={installHref}>
                      {installed ? "Re-authorize" : "Install"}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Installed apps</CardTitle>
          <CardDescription>
            Active OAuth installations for this workspace. Revoke immediately if a partner is offboarded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {installations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No OAuth apps installed yet.</p>
          ) : (
            installations.map((row) => (
              <div key={row.id} className="rounded-lg border border-border/70 p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{row.appName}</span>
                      <Badge variant={row.status === "ACTIVE" ? "secondary" : "outline"}>
                        {row.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{row.publisher}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {row.tokenPrefix}… · {row.clientId}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {row.scopesGranted.map((scope: PartnerOAuthScope) => (
                        <Badge key={scope} variant="outline" className="text-[10px] font-normal">
                          {PARTNER_OAUTH_SCOPE_LABEL[scope]}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Installed {formatDistanceToNow(row.installedAt, { addSuffix: true })}
                      {row.lastUsedAt
                        ? ` · last used ${formatDistanceToNow(row.lastUsedAt, { addSuffix: true })}`
                        : ""}
                    </p>
                  </div>
                  {canManage && row.status === "ACTIVE" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await revokePartnerOAuthInstallationAction(row.id);
                        })
                      }
                    >
                      {pending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
