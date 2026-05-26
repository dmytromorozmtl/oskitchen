import Link from "next/link";

import { DisconnectIntegrationButton } from "@/components/dashboard/disconnect-integration-button";
import { IntegrationClientForm } from "@/components/dashboard/integration-client-form";
import { saveUberEatsSettings } from "@/actions/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isEncryptionConfigured } from "@/lib/crypto";
import { SITE_URL } from "@/lib/constants";
import { CapabilityBadge } from "@/components/capabilities/capability-badge";
import { PlanGate } from "@/components/plans/plan-gate";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
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

  const webhookUrl = conn
    ? `${SITE_URL}/api/webhooks/uber-eats/orders?cid=${conn.id}`
    : null;

  return (
    <PlanGate userId={userId} feature="uber_eats" title="Uber Eats">
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Uber Eats</h1>
            <CapabilityBadge status="PARTNER_ACCESS_REQUIRED" />
          </div>
          <p className="text-sm text-muted-foreground">
            Marketplace adapter — partner credentials required for production.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/sales-channels">← Back</Link>
        </Button>
      </div>

      <Card className="border-amber-500/40 bg-amber-500/10">
        <CardHeader>
          <CardTitle className="text-base">Partner access</CardTitle>
          <CardDescription className="text-amber-950 dark:text-amber-50">
            Request Uber Eats developer / integration access for your brand. Until then,
            KitchenOS stores configuration only and shows graceful placeholders in sync and
            test actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-inside list-disc space-y-1">
            <li>Confirm marketplace participation with Uber.</li>
            <li>Obtain OAuth client credentials and store UUID.</li>
            <li>Configure webhook URL below once Uber provisions signing.</li>
            <li>Replace stub normalizers with official payload shapes.</li>
          </ul>
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
                  Menu sync (placeholder)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="orderIngestionEnabled"
                  name="orderIngestionEnabled"
                  type="checkbox"
                  defaultChecked={settings.orderIngestionEnabled ?? false}
                  className="h-4 w-4 rounded border border-input"
                />
                <Label htmlFor="orderIngestionEnabled" className="font-normal">
                  Order ingestion webhook (stub)
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
          </CardHeader>
          <CardContent className="break-all font-mono text-xs">{webhookUrl}</CardContent>
        </Card>
      ) : null}

      {conn ? (
        <div className="flex justify-end">
          <DisconnectIntegrationButton connectionId={conn.id} />
        </div>
      ) : null}
    </div>
    </PlanGate>
  );
}
