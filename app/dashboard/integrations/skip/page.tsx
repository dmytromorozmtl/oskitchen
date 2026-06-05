import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiveBadge } from "@/components/integrations/beta-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { SITE_URL } from "@/lib/constants";
import { getIntegrationById } from "@/lib/integrations/integration-registry";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  getSkipCapabilitySnapshot,
  getSkipLiveMessage,
} from "@/services/integrations/skip/skip-service";
import { IntegrationProvider } from "@prisma/client";

export default async function SkipIntegrationPage() {
  const { userId } = await getTenantActor();
  const integration = getIntegrationById("skip");
  const capability = getSkipCapabilitySnapshot();
  const connectionWhere = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.SKIP,
  );
  const connection = await prisma.integrationConnection.findFirst({
    where: connectionWhere,
    select: { id: true, status: true, lastError: true, externalStoreId: true },
  });

  const webhookUrl = connection
    ? `${SITE_URL}/api/webhooks/skip/orders?cid=${connection.id}`
    : `${SITE_URL}/api/webhooks/skip/orders?cid=<connection-id>`;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {capability.placeholderMode ? (
        <PlaceholderBanner
          feature="Skip / Just Eat integration"
          detail="Configure SKIP_CLIENT_ID, SKIP_CLIENT_SECRET, SKIP_RESTAURANT_ID, and SKIP_WEBHOOK_SECRET to enable LIVE order ingest."
        />
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">Skip / Just Eat</h1>
            <LiveBadge title="LIVE — Canadian Skip and UK Just Eat marketplace ingest" />
          </div>
          <p className="text-sm text-muted-foreground">
            {integration?.name} · LIVE · OAuth, webhook → KDS, status push
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" className="rounded-full">
            <Link href="/dashboard/integrations/skip/live">Open LIVE dashboard</Link>
          </Button>
          <Badge variant={capability.hasCredentials ? "secondary" : "outline"}>
            {capability.hasCredentials ? "LIVE credentials configured" : "Credentials missing"}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ChecklistItem label="OAuth credentials configured" done={capability.hasCredentials} />
          <ChecklistItem label="Webhook order ingest → KDS" done={capability.liveImportReady} />
          <ChecklistItem label="Status sync to Skip API" done={capability.liveStatusReady} />
          <p className="pt-2 text-muted-foreground">{getSkipLiveMessage(capability.hasCredentials)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Webhook URL</CardTitle>
        </CardHeader>
        <CardContent>
          <code className="block break-all rounded-lg bg-muted px-3 py-2 text-xs">{webhookUrl}</code>
          <p className="mt-2 text-xs text-muted-foreground">
            Register in Skip / Just Eat partner portal for order.created and order.status_update events.
          </p>
        </CardContent>
      </Card>

      {connection?.lastError ? (
        <Card className="border-destructive/40">
          <CardContent className="pt-6 text-sm text-destructive">{connection.lastError}</CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function ChecklistItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={done ? "text-emerald-600" : "text-muted-foreground"}>{done ? "✓" : "○"}</span>
      <span>{label}</span>
    </div>
  );
}
