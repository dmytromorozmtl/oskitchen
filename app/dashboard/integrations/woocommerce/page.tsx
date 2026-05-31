import Link from "next/link";

import { DisconnectIntegrationButton } from "@/components/dashboard/disconnect-integration-button";
import { IntegrationClientForm } from "@/components/dashboard/integration-client-form";
import { IntegrationToolRow } from "@/components/dashboard/integration-tool-row";
import { saveWooCommerceSettings } from "@/actions/integrations";
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
import { ChannelPilotSetupWizard } from "@/components/integrations/channel-pilot-setup-wizard";
import { IntegrationCertificationPanel } from "@/components/dashboard/integration-certification-panel";
import { CapabilityBadge } from "@/components/capabilities/capability-badge";
import { PlanGate } from "@/components/plans/plan-gate";
import { parseCertificationRecord } from "@/lib/integrations/channel-certification-types";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { IntegrationProvider, UserRole } from "@prisma/client";

export default async function WooCommerceIntegrationPage() {
  const { sessionUser, userId } = await requireTenantActor();
  const [conn, profile] = await Promise.all([
    prisma.integrationConnection.findFirst({
      where: await integrationConnectionByProviderWhereForOwner(
        userId,
        IntegrationProvider.WOOCOMMERCE,
      ),
    }),
    prisma.userProfile.findUnique({
      where: { id: sessionUser.id },
      select: { role: true },
    }),
  ]);

  const settings = (conn?.settingsJson ?? {}) as {
    autoImportOrders?: boolean;
    autoCreateProducts?: boolean;
  };

  const hasSecrets = Boolean(conn?.consumerKeyEncrypted && conn.consumerSecretEncrypted);
  const webhookUrl = conn
    ? `${SITE_URL}/api/webhooks/woocommerce?cid=${conn.id}`
    : null;
  const certification = parseCertificationRecord(conn?.settingsJson);
  const isOwner = profile?.role === UserRole.OWNER;

  return (
    <PlanGate userId={userId} feature="woocommerce" title="WooCommerce">
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">WooCommerce</h1>
            <CapabilityBadge status="BETA" />
          </div>
          <p className="text-sm text-muted-foreground">
            REST consumer keys and webhook signing secret (encrypted).
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/sales-channels">← Back</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/inventory-sync">Inventory sync →</Link>
        </Button>
      </div>

      <ChannelPilotSetupWizard
        provider="woocommerce"
        hasConnection={Boolean(conn)}
        hasCredentials={hasSecrets}
        hasWebhookSecret={Boolean(conn?.webhookSecretEncrypted)}
        hasStoreIdentity={Boolean(conn?.baseUrl)}
        certification={certification}
        webhookUrl={webhookUrl}
      />

      {!isEncryptionConfigured() ? (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Encryption required</CardTitle>
            <CardDescription>
              Set <code className="font-mono text-xs">ENCRYPTION_KEY</code> in{" "}
              <code className="font-mono text-xs">.env.local</code> before saving any API
              secrets (see <code className="font-mono text-xs">.env.example</code>).
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card id="channel-pilot-connection" className="border-border/80 bg-card/90 shadow-sm scroll-mt-24">
        <CardHeader>
          <CardTitle>Connection</CardTitle>
          <CardDescription>
            Use HTTPS store URLs. Leave consumer key/secret blank to keep existing encrypted
            values.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IntegrationClientForm saveAction={saveWooCommerceSettings}>
            <div className="space-y-2">
              <Label htmlFor="name">Label</Label>
              <Input
                id="name"
                name="name"
                defaultValue={conn?.name ?? "My WooCommerce store"}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseUrl">Store URL</Label>
              <Input
                id="baseUrl"
                name="baseUrl"
                type="url"
                placeholder="https://yourstore.com"
                defaultValue={conn?.baseUrl ?? ""}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consumerKey">Consumer key</Label>
              <Input
                id="consumerKey"
                name="consumerKey"
                autoComplete="off"
                placeholder={hasSecrets ? "•••••••• (saved — type to replace)" : ""}
                className="rounded-xl font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consumerSecret">Consumer secret</Label>
              <Input
                id="consumerSecret"
                name="consumerSecret"
                type="password"
                autoComplete="off"
                placeholder={hasSecrets ? "•••••••• (saved — type to replace)" : ""}
                className="rounded-xl font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhookSecret">Webhook secret</Label>
              <Input
                id="webhookSecret"
                name="webhookSecret"
                type="password"
                autoComplete="off"
                placeholder={conn?.webhookSecretEncrypted ? "•••••••• (saved)" : ""}
                className="rounded-xl font-mono text-sm"
              />
            </div>

            <details className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm">
              <summary className="cursor-pointer font-medium text-foreground">
                Advanced (not required for pilot)
              </summary>
              <div className="mt-3 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <input
                    id="autoImportOrders"
                    name="autoImportOrders"
                    type="checkbox"
                    defaultChecked={settings.autoImportOrders ?? false}
                    className="h-4 w-4 rounded border border-input"
                  />
                  <Label htmlFor="autoImportOrders" className="font-normal">
                    Auto-import orders (planned — toggle stored in settings)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="autoCreateProducts"
                    name="autoCreateProducts"
                    type="checkbox"
                    defaultChecked={settings.autoCreateProducts ?? false}
                    className="h-4 w-4 rounded border border-input"
                  />
                  <Label htmlFor="autoCreateProducts" className="font-normal">
                    Auto-create internal products from catalog sync (planned)
                  </Label>
                </div>
              </div>
            </details>

            <Button type="submit" className="rounded-full">
              Save encrypted credentials
            </Button>
          </IntegrationClientForm>
        </CardContent>
      </Card>

      <IntegrationCertificationPanel
        connectionId={conn?.id ?? null}
        providerLabel="WooCommerce"
        certification={certification}
        isOwner={isOwner}
      />

      {webhookUrl ? (
        <Card id="channel-pilot-webhooks" className="scroll-mt-24">
          <CardHeader>
            <CardTitle className="text-base">Webhook URL</CardTitle>
            <CardDescription>
              Create a WooCommerce webhook targeting this URL with topics{" "}
              <code className="text-xs">order.*</code> and{" "}
              <code className="text-xs">product.*</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="font-mono text-xs break-all">{webhookUrl}</CardContent>
        </Card>
      ) : null}

      <Card className="border-border/80 bg-muted/15">
        <CardHeader>
          <CardTitle className="text-base">What works / limitations</CardTitle>
          <CardDescription>
            Live REST + webhook ingestion for orders and products. No simulated approvals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Works:</span> encrypted credentials, test
            connection, order/product sync, signed webhooks, Order Hub external rows, import staging
            batch per webhook, duplicate delivery id protection.
          </p>
          <p>
            <span className="font-medium text-foreground">Not yet:</span> automatic internal Order
            creation from every external row, full rate-limit backoff UI, multi-currency FX, and
            partner-specific SLA dashboards.
          </p>
          <p>
            <span className="font-medium text-foreground">Setup checklist:</span> HTTPS store URL,
            read/write REST keys, webhook secret matching Woo, topics{" "}
            <code className="text-xs">order.*</code> / <code className="text-xs">product.*</code>,
            then run sync and confirm staging under Sales channels.
          </p>
          <p>
            <span className="font-medium text-foreground">Troubleshooting:</span> 401 on webhook →
            verify signing secret. Duplicate responses → normal for Woo retries. Missing rows →
            check connection status and last sync error.
          </p>
        </CardContent>
      </Card>

      <Card id="channel-pilot-tools" className="scroll-mt-24">
        <CardHeader>
          <CardTitle className="text-base">Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <IntegrationToolRow connectionId={conn?.id ?? null} provider="woocommerce" />
          {conn ? <DisconnectIntegrationButton connectionId={conn.id} /> : null}
        </CardContent>
      </Card>
    </div>
    </PlanGate>
  );
}
