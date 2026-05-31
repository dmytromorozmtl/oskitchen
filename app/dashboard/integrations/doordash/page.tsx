import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getIntegrationById } from "@/lib/integrations/integration-registry";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  getDoorDashCapabilitySnapshot,
  listDoorDashDeliveries,
} from "@/services/integrations/doordash/doordash-service";
import { IntegrationProvider } from "@prisma/client";

export default async function DoorDashIntegrationPage() {
  const { userId } = await getTenantActor();
  const integration = getIntegrationById("doordash");
  const capability = getDoorDashCapabilitySnapshot();
  const deliveries = await listDoorDashDeliveries(userId);
  const connectionWhere = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.DOORDASH,
  );
  const connection = await prisma.integrationConnection.findFirst({
    where: connectionWhere,
    select: { id: true, status: true, lastError: true },
  });

  const webhookUrl = connection
    ? `/api/webhooks/doordash/orders?cid=${connection.id}`
    : "/api/webhooks/doordash/orders?cid=<connection-id>";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {capability.placeholderMode ? (
        <PlaceholderBanner
          feature="DoorDash integration"
          detail="Configure DOORDASH_API_KEY, DOORDASH_MERCHANT_ID, and DOORDASH_WEBHOOK_SECRET to enable DoorDash BETA."
        />
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">DoorDash integration</h1>
          <p className="text-sm text-muted-foreground">
            {integration?.name} · {integration?.status} · marketplace ingest + Drive delivery
          </p>
        </div>
        <Badge variant={capability.hasCredentials ? "secondary" : "outline"}>
          {capability.hasCredentials ? "BETA credentials configured" : "Credentials missing"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ChecklistItem label="Environment credentials saved" done={capability.hasCredentials} />
          <ChecklistItem label="Webhook order ingest" done={capability.liveImportReady} />
          <ChecklistItem label="Marketplace poll import" done={capability.liveImportReady} />
          <ChecklistItem label="Menu sync API" done={capability.liveImportReady} />
          <ChecklistItem label="Drive delivery creation" done={capability.liveDeliveryReady} />
          <p className="pt-2 text-muted-foreground">
            DoorDash BETA requires partner-approved API credentials. OS Kitchen verifies webhook
            signatures and normalizes orders — it does not claim production LIVE until your merchant
            program certifies traffic.
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
            Register this webhook URL in the DoorDash developer portal (order.created,
            order.updated, order.cancelled):
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
        <CardContent className="space-y-3 overflow-x-auto">
          {deliveries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No DoorDash Drive deliveries yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Order</th>
                  <th className="py-2">Tracking</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id} className="border-b">
                    <td className="py-2 pr-4">{d.createdAt.toLocaleString()}</td>
                    <td className="py-2 pr-4">{d.status}</td>
                    <td className="py-2 pr-4">{d.order?.customerName ?? "—"}</td>
                    <td className="py-2">{d.trackingUrl ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
