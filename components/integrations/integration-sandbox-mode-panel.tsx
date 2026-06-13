import Link from "next/link";
import { FlaskConical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { INTEGRATION_SANDBOX_EXAMPLE_FILE } from "@/lib/integrations/integration-sandbox-policy";
import type { IntegrationSandboxModeSnapshot } from "@/lib/integrations/integration-sandbox-mode-snapshot";

type Props = {
  snapshot: IntegrationSandboxModeSnapshot;
};

export function IntegrationSandboxModePanel({ snapshot }: Props) {
  const configuredLabel = `${snapshot.merchantConfiguredCount}/${snapshot.expectedCount - 1} merchant surfaces`;

  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FlaskConical className="h-4 w-4 text-muted-foreground" aria-hidden />
          Integration sandbox mode
        </CardTitle>
        <CardDescription>
          Server-side test credential registry for 18 LIVE integrations — values never shown in
          dashboard. Copy <code className="text-xs">{INTEGRATION_SANDBOX_EXAMPLE_FILE}</code> for
          local/staging sandbox runs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="outline" className="rounded-full">
            {configuredLabel} configured
          </Badge>
          {snapshot.integrationHealthReady ? (
            <Badge variant="secondary" className="rounded-full">
              Integration health probe ready
            </Badge>
          ) : (
            <Badge variant="outline" className="rounded-full text-amber-700 dark:text-amber-300">
              Needs E2E_STAGING_BASE_URL
            </Badge>
          )}
        </div>

        {snapshot.sharedMissing.length > 0 ? (
          <p className="font-mono text-[11px] text-muted-foreground">
            Shared env missing: {snapshot.sharedMissing.join(", ")}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Shared sandbox env complete on this server.</p>
        )}

        <ul className="grid gap-2 sm:grid-cols-2">
          {snapshot.rows.map((row) => (
            <li
              key={row.integrationId}
              className="rounded-lg border border-border/60 bg-muted/10 px-3 py-2 text-sm"
              data-testid={`integration-sandbox-row-${row.integrationId}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{row.name}</span>
                <Badge
                  variant={row.configured ? "secondary" : "outline"}
                  className="rounded-full text-[10px] uppercase"
                >
                  {row.configured ? "configured" : "missing"}
                </Badge>
              </div>
              {!row.configured && row.missingKeys.length > 0 ? (
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  needs: {row.missingKeys.slice(0, 3).join(", ")}
                  {row.missingKeys.length > 3 ? "…" : ""}
                </p>
              ) : row.presentKeyCount > 0 ? (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {row.presentKeyCount} sandbox key(s) present
                </p>
              ) : null}
            </li>
          ))}
        </ul>

        <p className="text-xs text-muted-foreground">
          CLI: <code className="text-[11px]">npm run check:integration-sandbox</code> ·{" "}
          <Link href="/dashboard/sales-channels" className="text-primary hover:underline">
            Channel setup →
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
