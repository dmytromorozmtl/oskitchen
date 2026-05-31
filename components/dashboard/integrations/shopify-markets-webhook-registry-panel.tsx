"use client";

import { useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Activity, Loader2, RefreshCw, Webhook } from "lucide-react";

import {
  registerShopifyMarketsWebhooksAction,
  syncShopifyMarketsWebhookRegistryAction,
} from "@/actions/shopify-markets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  driftStatusLabel,
  SHOPIFY_MARKETS_WEBHOOK_REGISTRY_HONESTY,
} from "@/lib/commercial/shopify-markets-webhook-registry";
import {
  SHOPIFY_MARKETS_WEBHOOK_REGISTRY_REQUIRED_SCOPES,
  type ShopifyMarketsSyncSettings,
} from "@/lib/integrations/shopify-markets-settings";

type ShopifyMarketsWebhookRegistryPanelProps = {
  connectionId: string | null;
  hasCredentials: boolean;
  syncSettings: ShopifyMarketsSyncSettings;
  canManage: boolean;
};

function driftBadgeVariant(
  status: string,
): "outline" | "secondary" | "destructive" {
  if (status === "ok") return "outline";
  if (status === "stale" || status === "never_delivered") return "secondary";
  return "destructive";
}

export function ShopifyMarketsWebhookRegistryPanel({
  connectionId,
  hasCredentials,
  syncSettings,
  canManage,
}: ShopifyMarketsWebhookRegistryPanelProps) {
  const [syncPending, startSync] = useTransition();
  const [registerPending, startRegister] = useTransition();
  const pending = syncPending || registerPending;

  const rows = Object.values(syncSettings.marketWebhookRegistry ?? {});
  const driftOpen =
    syncSettings.lastWebhookRegistryDriftCount ??
    rows.filter((row) => row.driftStatus !== "ok").length;

  return (
    <Card id="shopify-markets-webhook-registry" className="scroll-mt-24 border-border/80">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Webhook className="h-4 w-4" />
              Markets webhook registry — Phase 9 BETA
            </CardTitle>
            <CardDescription>
              Sync Shopify Admin webhook subscriptions against KitchenOS routes for markets sync
              (markets/* + products/update). Delivery health uses webhook event log.
            </CardDescription>
          </div>
          {driftOpen > 0 ? (
            <Badge variant="destructive">{driftOpen} drift</Badge>
          ) : rows.length > 0 ? (
            <Badge variant="outline">All healthy</Badge>
          ) : (
            <Badge variant="secondary">Not synced</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">{SHOPIFY_MARKETS_WEBHOOK_REGISTRY_HONESTY}</p>
        <p className="text-xs text-muted-foreground">
          Scopes:{" "}
          {SHOPIFY_MARKETS_WEBHOOK_REGISTRY_REQUIRED_SCOPES.map((scope) => (
            <code key={scope} className="mx-0.5 rounded bg-muted px-1">
              {scope}
            </code>
          ))}
        </p>

        {canManage && connectionId ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="rounded-full"
              disabled={pending || !hasCredentials}
              onClick={() =>
                startSync(async () => {
                  await syncShopifyMarketsWebhookRegistryAction(connectionId);
                })
              }
            >
              {syncPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Sync registry</span>
            </Button>
            <Button
              type="button"
              size="sm"
              className="rounded-full"
              disabled={pending || !hasCredentials}
              onClick={() =>
                startRegister(async () => {
                  await registerShopifyMarketsWebhooksAction(connectionId);
                })
              }
            >
              {registerPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
              <span className="ml-2">Register missing webhooks</span>
            </Button>
          </div>
        ) : null}

        {syncSettings.lastWebhookRegistrySyncAt ? (
          <p className="text-xs text-muted-foreground">
            Last registry sync{" "}
            {formatDistanceToNow(new Date(syncSettings.lastWebhookRegistrySyncAt), {
              addSuffix: true,
            })}
            {syncSettings.webhookRegistrySyncError ? (
              <> · {syncSettings.webhookRegistrySyncError}</>
            ) : null}
          </p>
        ) : null}

        {syncSettings.lastWebhookRegistryRegisterAt ? (
          <p className="text-xs text-muted-foreground">
            Last registration{" "}
            {formatDistanceToNow(new Date(syncSettings.lastWebhookRegistryRegisterAt), {
              addSuffix: true,
            })}
            {syncSettings.lastWebhookRegistryRegisterError ? (
              <> · {syncSettings.lastWebhookRegistryRegisterError}</>
            ) : null}
          </p>
        ) : null}

        {rows.length > 0 ? (
          <div className="space-y-2">
            {rows.map((row) => (
              <div
                key={row.topic}
                className="rounded-lg border border-border/70 p-3 text-xs text-muted-foreground"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{row.label}</span>
                  <Badge variant={driftBadgeVariant(row.driftStatus)}>
                    {driftStatusLabel(row.driftStatus)}
                  </Badge>
                  <span className="font-mono">{row.topic}</span>
                </div>
                <p className="mt-1 break-all">
                  Expected: <span className="font-mono">{row.expectedCallbackUrl}</span>
                </p>
                {row.actualCallbackUrl ? (
                  <p className="break-all">
                    Shopify: <span className="font-mono">{row.actualCallbackUrl}</span>
                  </p>
                ) : (
                  <p>Shopify: not registered</p>
                )}
                {row.lastDeliveryAt ? (
                  <p>
                    Last delivery{" "}
                    {formatDistanceToNow(new Date(row.lastDeliveryAt), { addSuffix: true })}
                    {row.failureCount > 0 ? ` · ${row.failureCount} failed event(s)` : ""}
                  </p>
                ) : (
                  <p>No verified deliveries logged yet</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Run sync after saving credentials — also runs automatically after market discovery.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
