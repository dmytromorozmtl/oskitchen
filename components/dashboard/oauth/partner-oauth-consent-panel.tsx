"use client";

import { useTransition } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

import {
  approvePartnerOAuthConsentAction,
  denyPartnerOAuthConsentAction,
} from "@/actions/partner-oauth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PARTNER_OAUTH_SCOPE_LABEL, type PartnerOAuthScope } from "@/lib/developer/partner-oauth-scopes";
import type { PartnerOAuthAppDefinition } from "@/lib/oauth/partner-oauth-app-catalog";

type PartnerOAuthConsentPanelProps = {
  app: PartnerOAuthAppDefinition;
  redirectUri: string;
  scopes: PartnerOAuthScope[];
  state?: string;
  canManage: boolean;
};

export function PartnerOAuthConsentPanel({
  app,
  redirectUri,
  scopes,
  state,
  canManage,
}: PartnerOAuthConsentPanelProps) {
  const [pending, startTransition] = useTransition();

  function approve() {
    startTransition(async () => {
      await approvePartnerOAuthConsentAction({
        client_id: app.clientId,
        redirect_uri: redirectUri,
        scope: scopes.join(" "),
        state,
      });
    });
  }

  function deny() {
    startTransition(async () => {
      await denyPartnerOAuthConsentAction({ redirect_uri: redirectUri, state });
    });
  }

  return (
    <Card className="mx-auto max-w-lg border-border/70">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Install {app.name}?</CardTitle>
        </div>
        <CardDescription>
          {app.publisher} is requesting access to your workspace via OAuth. Tokens are workspace-scoped
          and can be revoked anytime.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <p className="font-medium">Redirect URI</p>
          <p className="mt-1 break-all font-mono text-xs text-muted-foreground">{redirectUri}</p>
        </div>
        <div>
          <p className="mb-2 font-medium">Requested permissions</p>
          <div className="space-y-2">
            {scopes.map((scope) => (
              <div key={scope} className="rounded-md border border-border/60 px-3 py-2">
                <Badge variant="outline" className="mb-1 font-mono text-[10px]">
                  {scope}
                </Badge>
                <p className="text-xs text-muted-foreground">{PARTNER_OAUTH_SCOPE_LABEL[scope]}</p>
              </div>
            ))}
          </div>
        </div>
        {app.honestyNote ? (
          <p className="rounded-md border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-xs text-muted-foreground">
            {app.honestyNote}
          </p>
        ) : null}
        {canManage ? (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={approve} disabled={pending}>
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Authorize
            </Button>
            <Button variant="outline" onClick={deny} disabled={pending}>
              Deny
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground">Integration management permission required to authorize.</p>
        )}
      </CardContent>
    </Card>
  );
}
