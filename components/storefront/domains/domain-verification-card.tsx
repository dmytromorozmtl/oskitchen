import { verifyStorefrontDomainDnsAction, refreshStorefrontDomainStatusAction } from "@/actions/storefront-domains";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import {
  domainStatusDisplayLabel,
  formatDomainRecheckHint,
} from "@/lib/storefront/domain-status-labels";

import { DomainDnsInstructions } from "./domain-dns-instructions";

export function DomainVerificationCard({
  hostname,
  status,
  lastCheckedAt,
  lastError,
  token,
}: {
  hostname: string | null;
  status: string | null;
  lastCheckedAt: Date | null;
  lastError: string | null;
  token: string | null;
}) {
  const h = hostname?.trim() || "";
  const tok = token?.trim() || "";
  const preview = tok ? `${tok.slice(0, 6)}…` : "";
  const txtName = h && tok ? `_kos-verify.${h}` : "";

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle>Verification</CardTitle>
        <CardDescription>DNS checks run from the OS Kitchen server. TLS certificate issuance is not probed here.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p>
          <span className="text-muted-foreground">Status:</span>{" "}
          <span className="font-mono text-xs">{domainStatusDisplayLabel(status)}</span>
          {status ? (
            <span className="ml-2 text-xs text-muted-foreground">({status})</span>
          ) : null}
        </p>
        <p className="text-xs text-muted-foreground">{formatDomainRecheckHint(lastCheckedAt)}</p>
        {lastCheckedAt ? (
          <p>
            <span className="text-muted-foreground">Last checked:</span> {lastCheckedAt.toLocaleString()}
          </p>
        ) : null}
        {lastError ? (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-950 dark:text-amber-100">{lastError}</p>
        ) : null}
        {h ? <DomainDnsInstructions hostname={h} txtName={txtName} tokenPreview={preview} /> : null}
        <div className="flex flex-wrap gap-2">
          <form action={verifyStorefrontDomainDnsAction}>
            <Button type="submit" className="rounded-full" disabled={!h}>
              Verify DNS
            </Button>
          </form>
          <form action={refreshStorefrontDomainStatusAction}>
            <Button type="submit" variant="outline" className="rounded-full" disabled={!h}>
              Recheck now
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
