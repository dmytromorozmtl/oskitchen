import Link from "next/link";

import { DisconnectIntegrationButton } from "@/components/dashboard/disconnect-integration-button";
import { IntegrationClientForm } from "@/components/dashboard/integration-client-form";
import { IntegrationToolRow } from "@/components/dashboard/integration-tool-row";
import { saveShopifySettings } from "@/actions/integrations";
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

export default async function ShopifyIntegrationPage() {
  const { sessionUser, userId } = await requireTenantActor();
  const [conn, profile] = await Promise.all([
    prisma.integrationConnection.findFirst({
      where: await integrationConnectionByProviderWhereForOwner(
        userId,
        IntegrationProvider.SHOPIFY,
      ),
    }),
    prisma.userProfile.findUnique({
      where: { id: sessionUser.id },
      select: { role: true },
    }),
  ]);

  const settings = (conn?.settingsJson ?? {}) as { apiVersion?: string };
  const hasToken = Boolean(conn?.accessTokenEncrypted);
  const certification = parseCertificationRecord(conn?.settingsJson);
  const isOwner = profile?.role === UserRole.OWNER;

  return (
    <PlanGate userId={userId} feature="shopify" title="Shopify">
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Shopify</h1>
            <CapabilityBadge status="BETA" />
          </div>
          <p className="text-sm text-muted-foreground">
            Custom app Admin API token + webhook signing secret.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/sales-channels">← Back</Link>
        </Button>
      </div>

      <ChannelPilotSetupWizard
        provider="shopify"
        hasConnection={Boolean(conn)}
        hasCredentials={hasToken}
        hasWebhookSecret={Boolean(conn?.webhookSecretEncrypted)}
        hasStoreIdentity={Boolean(conn?.shopDomain)}
        certification={certification}
      />

      {!isEncryptionConfigured() ? (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Encryption required</CardTitle>
            <CardDescription>
              Configure <code className="font-mono text-xs">ENCRYPTION_KEY</code> before
              storing tokens.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card id="channel-pilot-connection" className="border-border/80 bg-card/90 shadow-sm scroll-mt-24">
        <CardHeader>
          <CardTitle>Store connection</CardTitle>
          <CardDescription>
            Domain must match <span className="font-mono text-xs">*.myshopify.com</span>.
            Leave token blank to keep the saved value.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <IntegrationClientForm saveAction={saveShopifySettings}>
            <div className="space-y-2">
              <Label htmlFor="name">Label</Label>
              <Input
                id="name"
                name="name"
                defaultValue={conn?.name ?? "My Shopify store"}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shopDomain">Shop domain</Label>
              <Input
                id="shopDomain"
                name="shopDomain"
                placeholder="your-store.myshopify.com"
                defaultValue={conn?.shopDomain ?? ""}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminAccessToken">Admin API access token</Label>
              <Input
                id="adminAccessToken"
                name="adminAccessToken"
                type="password"
                autoComplete="off"
                placeholder={hasToken ? "•••••••• (saved — type to replace)" : ""}
                className="rounded-xl font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhookSecret">Webhook signing secret</Label>
              <Input
                id="webhookSecret"
                name="webhookSecret"
                type="password"
                autoComplete="off"
                placeholder={conn?.webhookSecretEncrypted ? "•••••••• (saved)" : ""}
                className="rounded-xl font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiVersion">API version</Label>
              <Input
                id="apiVersion"
                name="apiVersion"
                defaultValue={settings.apiVersion ?? "2025-01"}
                className="rounded-xl font-mono text-sm"
              />
            </div>
            <Button type="submit" className="rounded-full">
              Save encrypted credentials
            </Button>
          </IntegrationClientForm>
        </CardContent>
      </Card>

      <IntegrationCertificationPanel
        connectionId={conn?.id ?? null}
        providerLabel="Shopify"
        certification={certification}
        isOwner={isOwner}
      />

      <Card id="channel-pilot-webhooks" className="scroll-mt-24">
        <CardHeader>
          <CardTitle className="text-base">Webhook endpoints</CardTitle>
          <CardDescription>
            Register in Shopify admin (same secret as above). Base:{" "}
            <span className="font-mono text-xs">{SITE_URL}/api/webhooks/shopify/</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 font-mono text-xs">
          <div>orders-create</div>
          <div>orders-updated</div>
          <div>products-update</div>
          <div>app-uninstalled</div>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-muted/15">
        <CardHeader>
          <CardTitle className="text-base">What works / limitations</CardTitle>
          <CardDescription>
            Custom app token + HMAC webhooks. GraphQL order sync batches are logged as channel import
            staging.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Works:</span> encrypted Admin API token,
            webhook secret, orders/products sync, signed webhooks, external Order Hub rows, staging
            batch per sync job, duplicate webhook id protection.
          </p>
          <p>
            <span className="font-medium text-foreground">Not yet:</span> automatic internal Order
            creation for every Shopify row, inventory reservations, and marketplace-specific
            adjustments.
          </p>
          <p>
            <span className="font-medium text-foreground">Setup checklist:</span> custom app scopes
            for orders and products, webhook topics listed above, store domain match, then run sync
            and review staging.
          </p>
          <p>
            <span className="font-medium text-foreground">Troubleshooting:</span> 401 on webhook →
            secret mismatch. No rows in Hub → verify shop domain on the connection matches the
            webhook header.
          </p>
        </CardContent>
      </Card>

      <Card id="channel-pilot-tools" className="scroll-mt-24">
        <CardHeader>
          <CardTitle className="text-base">Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <IntegrationToolRow connectionId={conn?.id ?? null} provider="shopify" />
          {conn ? <DisconnectIntegrationButton connectionId={conn.id} /> : null}
        </CardContent>
      </Card>
    </div>
    </PlanGate>
  );
}
