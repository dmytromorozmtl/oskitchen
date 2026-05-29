import Link from "next/link";
import { Webhook } from "lucide-react";

import { CopyTextButton } from "@/components/channels/copy-text-button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { PlanGate } from "@/components/plans/plan-gate";
import { IntegrationActionButton } from "@/components/integrations/integration-action-button";
import { WebhookQueueAttentionStrip } from "@/components/integrations/webhook-queue-attention-strip";
import { WebhookQueueRowNextAction } from "@/components/integrations/webhook-queue-row-next-action";
import { WebhookReplayRow } from "@/components/integrations/webhook-replay-row";
import { SensitiveErrorPreview } from "@/components/integrations/sensitive-error-preview";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getCachedWebhookEventListWhere } from "@/lib/scope/cached-workspace-resource-scope";
import { CHANNEL_REGISTRY_ENTRIES } from "@/lib/channels/channel-registry";
import { SITE_URL } from "@/lib/constants";
import { buildWebhookQueueFocusSnapshot } from "@/lib/integrations/webhook-queue-focus-era18";
import { prisma } from "@/lib/prisma";
import { toSafeErrorPreview } from "@/lib/security/sensitive-redaction";

export default async function SalesChannelsWebhookCenterPage() {
  const { userId } = await getTenantActor();
  const webhookWhere = await getCachedWebhookEventListWhere();
  const [events, unprocessedCount, invalidSignatureCount, processingErrorCount] = await Promise.all([
    prisma.webhookEvent.findMany({
      where: webhookWhere,
      orderBy: { receivedAt: "desc" },
      take: 200,
    }),
    prisma.webhookEvent.count({
      where: { AND: [webhookWhere, { processed: false }] },
    }),
    prisma.webhookEvent.count({
      where: { AND: [webhookWhere, { processed: false, signatureValid: false }] },
    }),
    prisma.webhookEvent.count({
      where: {
        AND: [webhookWhere, { processingError: { not: null } }],
      },
    }),
  ]);

  const focusSnapshot = buildWebhookQueueFocusSnapshot({
    unprocessedCount,
    invalidSignatureCount,
    processingErrorCount,
  });

  return (
    <>
      <div className="mb-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Webhook endpoints</h2>
            <p className="text-sm text-muted-foreground">
              Configure these in your partner console. Event history below may be plan-gated for
              replay tooling — URLs remain documented for all tenants.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/dashboard/integrations/webhooks">Legacy URL</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registered routes</CardTitle>
            <CardDescription>
              Copy the base URL into your partner console. WooCommerce URLs typically include{" "}
              <span className="font-mono text-xs">?cid=</span> with your connection id from the setup
              screen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {CHANNEL_REGISTRY_ENTRIES.filter((c) => c.supportsWebhooks && c.webhookRoutes.length > 0).map(
              (c) => (
                <div key={c.providerKey} className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <p className="font-medium text-foreground">{c.label}</p>
                  <ul className="mt-2 space-y-2">
                    {c.webhookRoutes.map((route) => {
                      const url = `${SITE_URL}${route}`;
                      return (
                        <li key={route} className="flex flex-wrap items-center justify-between gap-2">
                          <code className="max-w-[min(100%,52rem)] break-all text-xs text-muted-foreground">
                            {url}
                          </code>
                          <CopyTextButton text={url} label="Copy" />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ),
            )}
          </CardContent>
        </Card>
      </div>

      <PlanGate userId={userId} feature="webhook_replay" title="Webhook log">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Webhook activity</h2>
              <p className="text-sm text-muted-foreground">
                Same ingestion log as legacy route — raw payloads stay server-side; never copy
                secrets into tickets.
              </p>
            </div>
          </div>

          <WebhookQueueAttentionStrip snapshot={focusSnapshot} />

          {!events.length ? (
            <EmptyState
              icon={Webhook}
              title="No webhook events yet"
              description="Point WooCommerce or Shopify at your KitchenOS webhook URLs. Verification status appears here — Stripe billing webhooks use a separate pipeline."
              primaryLabel="Channel operations center"
              primaryHref="/dashboard/sales-channels"
              secondaryLabel="WooCommerce setup"
              secondaryHref="/dashboard/integrations/woocommerce"
              demoHref="/demo"
            />
          ) : null}

          {events.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent events</CardTitle>
                <CardDescription>
                  Duplicate external IDs short-circuit processing while still returning HTTP 200 to
                  partners when safe.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Received</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Signature</TableHead>
                      <TableHead>Processed</TableHead>
                      <TableHead>Next action</TableHead>
                      <TableHead className="min-w-[240px]">Replay</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((ev) => (
                      <TableRow key={ev.id} id={`webhook-event-${ev.id}`}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDistanceToNow(ev.receivedAt, { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-full">
                            {ev.provider}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{ev.topic}</TableCell>
                        <TableCell>
                          {ev.signatureValid ? (
                            <span className="text-emerald-600">Valid</span>
                          ) : (
                            <span className="text-destructive">Invalid</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {ev.processed ? (
                            <span className="text-emerald-600">Yes</span>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                          {ev.processingError ? (
                            (() => {
                              const preview = toSafeErrorPreview(ev.processingError, 120);
                              return (
                                <SensitiveErrorPreview
                                  text={preview.text === "—" ? null : preview.text}
                                  redacted={preview.redacted}
                                  textClassName="truncate text-xs text-destructive"
                                />
                              );
                            })()
                          ) : null}
                          <div className="mt-1 flex flex-wrap gap-2">
                            <IntegrationActionButton
                              provider={String(ev.provider)}
                              action="integration_retry"
                              variant="inline"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <WebhookQueueRowNextAction
                            event={{
                              id: ev.id,
                              provider: String(ev.provider),
                              signatureValid: ev.signatureValid,
                              processed: ev.processed,
                              processingError: ev.processingError,
                            }}
                          />
                        </TableCell>
                        <TableCell className="align-top">
                          <WebhookReplayRow
                            webhookEventId={ev.id}
                            signatureValid={ev.signatureValid}
                            surface="workspace"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </PlanGate>
    </>
  );
}
