import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BetaBadge } from "@/components/integrations/beta-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getIntegrationById } from "@/lib/integrations/integration-registry";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  getGrubhubCapabilitySnapshot,
  listGrubhubDeliveries,
} from "@/services/integrations/grubhub/grubhub-service";
import { IntegrationProvider } from "@prisma/client";

export default async function GrubhubIntegrationPage() {
  const { userId } = await getTenantActor();
  const integration = getIntegrationById("grubhub");
  const capability = getGrubhubCapabilitySnapshot();
  const deliveries = await listGrubhubDeliveries(userId);
  const connectionWhere = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.GRUBHUB,
  );
  const connection = await prisma.integrationConnection.findFirst({
    where: connectionWhere,
    select: { id: true, status: true, lastError: true },
  });

  const webhookUrl = connection
    ? `/api/webhooks/grubhub/orders?cid=${connection.id}`
    : "/api/webhooks/grubhub/orders?cid=<connection-id>";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {capability.placeholderMode ? (
        <PlaceholderBanner
          feature="Grubhub integration"
          detail="Configure GRUBHUB_API_KEY, GRUBHUB_MERCHANT_ID, and GRUBHUB_WEBHOOK_SECRET to enable Grubhub BETA."
        />
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">Grubhub integration</h1>
            <BetaBadge />
          </div>
          <p className="text-sm text-muted-foreground">
            {integration?.name} · {integration?.status} · marketplace ingest + menu sync
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" className="rounded-full">
            <Link href="/dashboard/integrations/grubhub/live">Open LIVE dashboard</Link>
          </Button>
          <Badge variant={capability.hasCredentials ? "secondary" : "outline"}>
            {capability.hasCredentials ? "BETA credentials configured" : "Credentials missing"}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ChecklistItem label="Environment credentials saved" done={capability.hasCredentials} />
          <ChecklistItem label="Webhook order ingest" done={capability.liveOrderReady} />
          <ChecklistItem label="Marketplace poll import" done={capability.liveOrderReady} />
          <ChecklistItem label="Menu sync API" done={capability.liveMenuReady} />
          <p className="pt-2 text-muted-foreground">
            Grubhub BETA requires partner-approved API credentials. OS Kitchen verifies webhook
            signatures — it does not claim production LIVE until your merchant program certifies traffic.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connection & webhooks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Connection status:{" "}
            <span className="font-medium">{connection?.status ?? "Not connected"}</span>
          </p>
          <p className="text-muted-foreground">
            Register this webhook URL in the Grubhub developer portal:
          </p>
          <code className="block overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs">{webhookUrl}</code>
          {connection?.lastError ? (
            <p className="text-destructive">Last error: {connection.lastError}</p>
          ) : null}
          <p>
            <Link className="text-primary underline" href="/dashboard/integration-health">
              Integration health & recovery
            </Link>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery history</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          {deliveries.length === 0 ? (
            <p className="text-muted-foreground">No Grubhub delivery records yet.</p>
          ) : (
            deliveries.map((d) => (
              <div key={d.id} className="flex justify-between border-b py-2">
                <span>{d.externalOrderId ?? d.id.slice(0, 8)}</span>
                <span className="text-muted-foreground">{d.status}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ChecklistItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden
        className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
          done ? "border-emerald-500 bg-emerald-500/10 text-emerald-600" : "border-border text-muted-foreground"
        }`}
      >
        {done ? "✓" : ""}
      </span>
      <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}
