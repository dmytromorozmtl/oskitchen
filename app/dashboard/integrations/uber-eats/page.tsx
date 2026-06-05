import Link from "next/link";

import { DisconnectIntegrationButton } from "@/components/dashboard/disconnect-integration-button";
import { IntegrationClientForm } from "@/components/dashboard/integration-client-form";
import { saveUberEatsSettings } from "@/actions/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LiveBadge } from "@/components/integrations/beta-badge";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isEncryptionConfigured } from "@/lib/crypto";
import { SITE_URL } from "@/lib/constants";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  getUberEatsCapabilitySnapshot,
} from "@/services/integrations/uber-eats/uber-eats-service";
import { IntegrationProvider } from "@prisma/client";

export default async function UberEatsIntegrationPage() {
  const { userId } = await getTenantActor();
  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByProviderWhereForOwner(
      userId,
      IntegrationProvider.UBER_EATS,
    ),
  });

  const settings = (conn?.settingsJson ?? {}) as {
    menuSyncEnabled?: boolean;
    orderIngestionEnabled?: boolean;
  };

  const capability = getUberEatsCapabilitySnapshot();

  const webhookUrl = conn
    ? `${SITE_URL}/api/webhooks/uber-eats/orders?cid=${conn.id}`
    : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {capability.placeholderMode ? (
        <PlaceholderBanner
          feature="Uber Eats integration"
          detail="Configure UBER_EATS_CLIENT_ID, UBER_EATS_CLIENT_SECRET, and UBER_EATS_STORE_ID to enable LIVE order ingest and menu sync."
        />
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Uber Eats</h1>
            <LiveBadge />
          </div>
          <p className="text-sm text-muted-foreground">
            Marketplace LIVE — OAuth, signed webhooks → KDS, menu sync, status push.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" className="rounded-full">
            <Link href="/dashboard/integrations/uber-eats/live">Open LIVE dashboard</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/dashboard/sales-channels">← Back</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ChecklistItem label="OAuth credentials saved" done={Boolean(conn?.consumerKeyEncrypted)} />
          <ChecklistItem label="Store UUID configured" done={Boolean(conn?.externalStoreId?.trim())} />
          <ChecklistItem label="Webhook order ingest" done={capability.liveImportReady} />
          <ChecklistItem label="Menu sync API" done={capability.liveMenuReady} />
          <p className="pt-2 text-muted-foreground">
            Uber partner credentials are required for production marketplace traffic.
          </p>
        </CardContent>
      </Card>

      {!isEncryptionConfigured() ? (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Encryption required</CardTitle>
            <CardDescription>Set ENCRYPTION_KEY before saving secrets.</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Credentials (encrypted)</CardTitle>
          <CardDescription>
            Mapped to generic encrypted fields until Uber-specific KMS layout is finalized.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IntegrationClientForm saveAction={saveUberEatsSettings}>
            <div className="space-y-2">
              <Label htmlFor="name">Label</Label>
              <Input
                id="name"
                name="name"
                defaultValue={conn?.name ?? "Uber Eats store"}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="externalStoreId">External store ID</Label>
              <Input
                id="externalStoreId"
                name="externalStoreId"
                defaultValue={conn?.externalStoreId ?? ""}
                className="rounded-xl font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                name="clientId"
                autoComplete="off"
                placeholder={conn?.consumerKeyEncrypted ? "•••••••• (saved)" : ""}
                className="rounded-xl font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientSecret">Client secret</Label>
              <Input
                id="clientSecret"
                name="clientSecret"
                type="password"
                autoComplete="off"
                placeholder={conn?.consumerSecretEncrypted ? "•••••••• (saved)" : ""}
                className="rounded-xl font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhookSigningSecret">Webhook signing secret</Label>
              <Input
                id="webhookSigningSecret"
                name="webhookSigningSecret"
                type="password"
                autoComplete="off"
                placeholder={conn?.webhookSecretEncrypted ? "•••••••• (saved)" : ""}
                className="rounded-xl font-mono text-sm"
              />
            </div>
            <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-4">
              <div className="flex items-center gap-2">
                <input
                  id="menuSyncEnabled"
                  name="menuSyncEnabled"
                  type="checkbox"
                  defaultChecked={settings.menuSyncEnabled ?? false}
                  className="h-4 w-4 rounded border border-input"
                />
                <Label htmlFor="menuSyncEnabled" className="font-normal">
                  Menu sync (BETA)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="orderIngestionEnabled"
                  name="orderIngestionEnabled"
                  type="checkbox"
                  defaultChecked={settings.orderIngestionEnabled ?? true}
                  className="h-4 w-4 rounded border border-input"
                />
                <Label htmlFor="orderIngestionEnabled" className="font-normal">
                  Order ingestion webhook (BETA)
                </Label>
              </div>
            </div>
            <Button type="submit" className="rounded-full">
              Save
            </Button>
          </IntegrationClientForm>
        </CardContent>
      </Card>

      {webhookUrl ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Webhook URL</CardTitle>
            <CardDescription>
              Register in Uber developer portal for order.placed and order.status_update events.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 break-all font-mono text-xs">
            {webhookUrl}
            <p>
              <Link className="font-sans text-sm text-primary underline" href="/dashboard/integration-health">
                Integration health & recovery
              </Link>
            </p>
          </CardContent>
        </Card>
      ) : null}

      {conn ? (
        <div className="flex justify-end">
          <DisconnectIntegrationButton connectionId={conn.id} />
        </div>
      ) : null}
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
