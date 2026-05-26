import Link from "next/link";
import { Webhook } from "lucide-react";

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
import { WebhookReplayRow } from "@/components/integrations/webhook-replay-row";
import { SensitiveErrorPreview } from "@/components/integrations/sensitive-error-preview";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { toSafeErrorPreview } from "@/lib/security/sensitive-redaction";

export default async function WebhookEventsPage() {
  const { userId } = await getTenantActor();
  const events = await prisma.webhookEvent.findMany({
    where: { userId },
    orderBy: { receivedAt: "desc" },
    take: 200,
  });

  return (
    <PlanGate userId={userId} feature="webhook_replay" title="Webhook log">
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Webhook activity</h1>
          <p className="text-sm text-muted-foreground">
            Idempotent ingestion log — replay UI ties into the same processor next.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/sales-channels">← Channel operations center</Link>
        </Button>
      </div>

      {!events.length ? (
        <EmptyState
          icon={Webhook}
          title="No webhook events yet"
          description="Once WooCommerce or Shopify points at your KitchenOS URLs, signed payloads appear here with verification status — perfect for proving integrations on sales calls."
          primaryLabel="Sales channels"
          primaryHref="/dashboard/sales-channels"
          secondaryLabel="Open channel setup"
          secondaryHref="/dashboard/sales-channels"
          demoHref="/demo"
        />
      ) : null}

      {events.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent events</CardTitle>
            <CardDescription>
              Duplicate external IDs short-circuit processing and still return HTTP 200 to
              partners.
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
                  <TableHead className="min-w-[240px]">Replay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((ev) => (
                  <TableRow key={ev.id}>
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
  );
}
