import Link from "next/link";

import { DisconnectIntegrationButton } from "@/components/dashboard/disconnect-integration-button";
import { IntegrationClientForm } from "@/components/dashboard/integration-client-form";
import { saveUberDirectSettings } from "@/actions/integrations";
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
import { BetaBadge } from "@/components/integrations/beta-badge";
import { PlanGate } from "@/components/plans/plan-gate";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { IntegrationProvider } from "@prisma/client";
import { getUberDirectCapabilitySnapshot } from "@/services/delivery/uber-direct";

export default async function UberDirectIntegrationPage() {
  const { userId } = await getTenantActor();
  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByProviderWhereForOwner(
      userId,
      IntegrationProvider.UBER_DIRECT,
    ),
  });

  const settings = (conn?.settingsJson ?? {}) as {
    pickupAddress?: string;
    deliveryQuoteEnabled?: boolean;
    autoDispatchEnabled?: boolean;
    deliveryRadiusKm?: number | null;
    defaultPickupInstructions?: string;
  };
  const capability = getUberDirectCapabilitySnapshot();

  return (
    <PlanGate userId={userId} feature="uber_direct" title="Uber Direct">
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Uber Direct</h1>
            <BetaBadge />
          </div>
          <p className="text-sm text-muted-foreground">
            Delivery dispatch (separate from Uber Eats marketplace orders). BETA — sandbox/pilot only
            until Uber Direct partner approval.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/sales-channels">← Back</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
          <CardDescription>
            API routes <code className="text-xs">/api/delivery/quote</code>,{" "}
            <code className="text-xs">/api/delivery/create</code>, and{" "}
            <code className="text-xs">/api/delivery/cancel</code> call Uber Direct when credentials
            are configured. Webhook updates dispatch rows at{" "}
            <code className="text-xs">/api/webhooks/uber-direct</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          {capability.placeholderMode ? (
            <p className="text-muted-foreground">Set Uber Direct env vars to enable BETA API calls.</p>
          ) : (
            <p className="text-emerald-600">Uber Direct BETA credentials detected.</p>
          )}
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
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <IntegrationClientForm saveAction={saveUberDirectSettings}>
            <div className="space-y-2">
              <Label htmlFor="name">Label</Label>
              <Input
                id="name"
                name="name"
                defaultValue={conn?.name ?? "Uber Direct"}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer ID</Label>
              <Input
                id="customerId"
                name="customerId"
                autoComplete="off"
                placeholder={conn?.accessTokenEncrypted ? "•••••••• (saved)" : ""}
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
              <Label htmlFor="pickupAddress">Default pickup location</Label>
              <Input
                id="pickupAddress"
                name="pickupAddress"
                defaultValue={settings.pickupAddress ?? ""}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryRadiusKm">Delivery radius (km)</Label>
              <Input
                id="deliveryRadiusKm"
                name="deliveryRadiusKm"
                type="number"
                min={1}
                max={200}
                defaultValue={settings.deliveryRadiusKm ?? ""}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultPickupInstructions">Pickup instructions</Label>
              <Input
                id="defaultPickupInstructions"
                name="defaultPickupInstructions"
                defaultValue={settings.defaultPickupInstructions ?? ""}
                className="rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-4">
              <div className="flex items-center gap-2">
                <input
                  id="deliveryQuoteEnabled"
                  name="deliveryQuoteEnabled"
                  type="checkbox"
                  defaultChecked={settings.deliveryQuoteEnabled ?? false}
                  className="h-4 w-4 rounded border border-input"
                />
                <Label htmlFor="deliveryQuoteEnabled" className="font-normal">
                  Enable quote flow (placeholder)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="autoDispatchEnabled"
                  name="autoDispatchEnabled"
                  type="checkbox"
                  defaultChecked={settings.autoDispatchEnabled ?? false}
                  className="h-4 w-4 rounded border border-input"
                />
                <Label htmlFor="autoDispatchEnabled" className="font-normal">
                  Auto-dispatch (placeholder)
                </Label>
              </div>
            </div>
            <Button type="submit" className="rounded-full">
              Save
            </Button>
          </IntegrationClientForm>
        </CardContent>
      </Card>

      {conn ? (
        <div className="flex justify-end">
          <DisconnectIntegrationButton connectionId={conn.id} />
        </div>
      ) : null}
    </div>
    </PlanGate>
  );
}
