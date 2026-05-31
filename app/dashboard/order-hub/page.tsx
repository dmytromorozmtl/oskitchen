import Link from "next/link";
import { LayoutGrid } from "lucide-react";

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
import { readKitchenOrderB2bMetadata } from "@/lib/integrations/shopify-b2b-kitchen-order-metadata";
import { formatCustomerPrimaryLabel } from "@/lib/customers/customer-display";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import {
  hasOrderHubPageAccess,
  loadWorkspacePermissionPageActor,
} from "@/lib/ux/permission-denied-page-access-era19";
import { IntegrationProvider } from "@prisma/client";
import { OrderHubExportButton } from "@/components/dashboard/order-hub-export-button";
import { OrderHubFulfillmentFlowProofPanel } from "@/components/dashboard/order-hub/order-hub-fulfillment-flow-proof-panel";
import { OrderHubCommercialOpsStrip } from "@/components/dashboard/order-hub/order-hub-commercial-ops-strip";
import { OrderHubAttentionStrip } from "@/components/dashboard/order-hub-attention-strip";
import {
  buildStorefrontFulfillmentFlowProofSlice,
  resolveP0ChannelProofPassed,
} from "@/lib/commercial/era20-storefront-fulfillment-flow-proof-era20";
import { buildOrderHubCommercialOpsStripSlice } from "@/lib/order-hub/order-hub-commercial-ops-era28";
import { loadCommercialPilotOpsStatusModel } from "@/services/commercial/commercial-pilot-ops-status-service";
import { loadStorefrontSummariesForOrderIds } from "@/lib/storefront/order-hub-commerce";
import {
  resolveExternalOrderHubRowNextAction,
  resolveInternalOrderHubRowNextAction,
} from "@/lib/order-hub/order-hub-stuck-state-era18";
import { loadOrderHubExactTabCounts } from "@/services/order-hub/order-hub-exact-counts-service";
import { loadOrderHubPageData } from "@/services/order-hub/order-hub-service";
import {
  ORDER_HUB_TABS,
  computeOrderHubTabCounts,
  filterExternalOrders,
  filterInternalOrders,
} from "@/services/order-hub/order-triage-service";

function providerLabel(p: IntegrationProvider) {
  switch (p) {
    case IntegrationProvider.WOOCOMMERCE:
      return "WooCommerce";
    case IntegrationProvider.SHOPIFY:
      return "Shopify";
    case IntegrationProvider.UBER_EATS:
      return "Uber Eats";
    case IntegrationProvider.UBER_DIRECT:
      return "Uber Direct";
    default:
      return String(p);
  }
}

export default async function OrderHubPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const actor = await loadWorkspacePermissionPageActor();
  if (!hasOrderHubPageAccess(actor)) {
    return <PermissionDeniedSurfaceCard surfaceId="order_hub" />;
  }

  const { sessionUser: user, dataUserId } = actor;
  const sp = (await searchParams) ?? {};
  const tab = typeof sp.tab === "string" ? sp.tab : "all";

  const [{ internalOrders, externalOrders, mappingBlockedCount }, exactTabCounts, commercialOps] =
    await Promise.all([
      loadOrderHubPageData(dataUserId),
      loadOrderHubExactTabCounts(dataUserId),
      loadCommercialPilotOpsStatusModel().catch(() => null),
    ]);

  const p0 = commercialOps?.p0Staging.summary ?? null;
  const fulfillmentFlowProof = buildStorefrontFulfillmentFlowProofSlice({
    p0ChannelProofPassed: resolveP0ChannelProofPassed(
      p0?.p0ProofStatus,
      p0?.children?.channelLive?.proofStatus ?? null,
    ),
  });
  const commercialOpsStrip = buildOrderHubCommercialOpsStripSlice(commercialOps);

  const storefrontSummaries = await loadStorefrontSummariesForOrderIds(
    dataUserId,
    internalOrders.map((o) => o.id),
  );
  const internalFiltered = filterInternalOrders(tab, internalOrders);
  const externalFiltered = filterExternalOrders(tab, externalOrders);
  const tabCounts = computeOrderHubTabCounts({ internalOrders, externalOrders, mappingBlockedCount });

  const hubEmpty = internalOrders.length === 0 && externalOrders.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Order hub</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Incoming orders from OS Kitchen and your sales channels in one operational view. Tabs triage the internal
            pipeline; channel rows follow sync health. <span className="font-medium text-foreground">Workspace totals</span>{" "}
            count your full database; the <span className="font-medium text-foreground">snapshot</span> row matches the
            same 150-row preview used in the tables below.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderHubExportButton />
          <OrderHubExportButton storefrontOnly />
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/orders">OS Kitchen orders</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl border border-border/70 bg-muted/30 p-1">
        {ORDER_HUB_TABS.map((t) => (
          <Link
            key={t.id}
            href={`/dashboard/order-hub?tab=${t.id}`}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/15 px-3 py-3 text-xs">
        <p className="mb-2 font-medium text-muted-foreground">Workspace totals (database)</p>
        <div className="flex flex-wrap gap-2">
          {exactTabCounts.map((row) => (
            <Link
              key={`db-${row.id}`}
              href={`/dashboard/order-hub?tab=${row.id}`}
              title={`OS Kitchen rows: ${row.internal} · Channel rows: ${row.external}${
                row.internalCapped ? " — internal missing-* counts may be a lower bound (scan cap)." : ""
              }`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 font-medium text-foreground transition-colors hover:bg-muted/50",
                tab === row.id && "border-primary/40 ring-1 ring-primary/20",
              )}
            >
              <span>{row.label}</span>
              <span className="tabular-nums text-muted-foreground">{row.total}</span>
              {row.internalCapped ? <span className="text-[10px] text-amber-700">*</span> : null}
            </Link>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">*</span> Internal &quot;missing customer / fulfillment&quot;
          tabs scan up to the most recent non-terminal OS Kitchen orders (bounded scan); if you are at the cap, treat
          the number as a minimum until the backlog is cleared.
        </p>

        {!hubEmpty ? (
          <>
            <hr className="my-3 border-border/60" />
            <p className="mb-2 font-medium text-muted-foreground">Queue snapshot (latest fetch)</p>
            <div className="flex flex-wrap gap-2">
              {tabCounts.map((row) => (
                <Link
                  key={row.id}
                  href={`/dashboard/order-hub?tab=${row.id}`}
                  title={`OS Kitchen rows: ${row.internal} · Channel rows: ${row.external}`}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 font-medium text-foreground transition-colors hover:bg-muted/50",
                    tab === row.id && "border-primary/40 ring-1 ring-primary/20",
                  )}
                >
                  <span>{row.label}</span>
                  <span className="tabular-nums text-muted-foreground">{row.total}</span>
                </Link>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Snapshot is capped at the latest 150 OS Kitchen rows and 150 channel rows per load. For the full
              sortable list, open{" "}
              <Link href="/dashboard/orders" className="font-medium text-primary underline-offset-2 hover:underline">
                Orders
              </Link>
              .
            </p>
          </>
        ) : null}
      </div>

      <OrderHubFulfillmentFlowProofPanel slice={fulfillmentFlowProof} />

      {commercialOpsStrip ? <OrderHubCommercialOpsStrip slice={commercialOpsStrip} /> : null}

      <OrderHubAttentionStrip mappingBlockedCount={mappingBlockedCount} exactTabCounts={exactTabCounts} />

      {hubEmpty ? (
        <EmptyState
          icon={LayoutGrid}
          title="No incoming orders yet"
          description="Create manual orders, connect WooCommerce or Shopify, or load the guided demo to see cross-channel rows, sync badges, and webhook health in context."
          primaryLabel="Create manual order"
          primaryHref="/dashboard/orders/new"
          secondaryLabel="Sales channels"
          secondaryHref="/dashboard/sales-channels"
          demoHref="/demo"
        />
      ) : null}

      {!hubEmpty ? (
        <>
          <Card className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle>OS Kitchen orders · {ORDER_HUB_TABS.find((x) => x.id === tab)?.label ?? "All"}</CardTitle>
              <CardDescription>Captured inside OS Kitchen — deep links open the full order detail.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fulfillment</TableHead>
                    <TableHead>Storefront</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Import batch</TableHead>
                    <TableHead>Next action</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Open</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internalFiltered.map((o) => {
                    const sf = storefrontSummaries.get(o.id);
                    const nextAction = resolveInternalOrderHubRowNextAction(o, {
                      paymentFailed:
                        sf?.paymentMode === "ONLINE_PAYMENT" && sf.paymentStatus === "FAILED",
                      paymentPending:
                        sf?.paymentMode === "ONLINE_PAYMENT" && sf.paymentStatus === "PENDING",
                    });
                    const b2b = readKitchenOrderB2bMetadata(o.sourceMetadataJson);
                    return (
                    <TableRow key={o.id} data-order-id={o.id}>
                      <TableCell>
                        <Link href={`/dashboard/orders/${o.id}`} className="font-medium text-primary hover:underline">
                          {formatCustomerPrimaryLabel({
                            customerName: o.customerName,
                            customerEmail: o.customerEmail,
                          })}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1">
                          <Badge variant="secondary" className="rounded-full">
                            {o.status}
                          </Badge>
                          {b2b ? (
                            <Badge
                              className="rounded-full bg-indigo-500/15 text-[10px] text-indigo-900 dark:text-indigo-100"
                              title={b2b.routingSummary}
                            >
                              {b2b.orderNotesBadge}
                            </Badge>
                          ) : null}
                          {o.isChannelTestOrder ? (
                            <Badge variant="outline" className="rounded-full text-[10px] uppercase">
                              Test
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{o.fulfillmentType}</TableCell>
                      <TableCell className="text-xs">
                        {sf ? (
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="rounded-full font-mono text-[10px]">
                              {sf.orderNumber}
                            </Badge>
                            {sf.marketName || sf.marketId ? (
                              <Badge className="rounded-full bg-violet-500/15 text-[10px] text-violet-900 dark:text-violet-100">
                                Market: {sf.marketName ?? sf.marketId}
                              </Badge>
                            ) : null}
                            {sf.taxTotal > 0 ? (
                              <Badge variant="outline" className="rounded-full text-[10px]">
                                Tax {String(sf.taxTotal)}
                              </Badge>
                            ) : null}
                            {sf.paymentMode === "ONLINE_PAYMENT" && sf.paymentStatus === "FAILED" ? (
                              <Badge variant="destructive" className="rounded-full text-[10px]">
                                Payment failed
                              </Badge>
                            ) : null}
                            {sf.paymentMode === "ONLINE_PAYMENT" && sf.paymentStatus === "PENDING" ? (
                              <Badge variant="outline" className="rounded-full text-[10px]">
                                Payment pending
                              </Badge>
                            ) : null}
                          </div>
                        ) : o.creationSource === "STOREFRONT" ? (
                          <span className="text-muted-foreground">Legacy SF</span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {o.creationSource === "POS" || o.orderType === "POS_SALE"
                          ? "POS"
                          : (o.channelTraceJson as { source?: string } | null)?.source ?? "OS Kitchen"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {o.channelImportBatch ? (
                          <Link
                            className="font-mono text-primary underline-offset-2 hover:underline"
                            href={`/dashboard/sales-channels/imports/${o.channelImportBatch.id}`}
                          >
                            {o.channelImportBatch.sourceType}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {nextAction ? (
                          <Link
                            href={nextAction.href}
                            className={
                              nextAction.tone === "urgent"
                                ? "font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-200"
                                : "font-medium text-primary underline-offset-2 hover:underline"
                            }
                          >
                            {nextAction.label}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">On track</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">{String(o.total)}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm" className="rounded-full">
                          <Link href={`/dashboard/orders/${o.id}`}>Open</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                  })}
                  {internalFiltered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-muted-foreground">
                        No rows in this tab. Switch to All or adjust filters.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {tab === "all" ||
          tab === "failed" ||
          tab === "needs_review" ||
          tab === "needs_mapping" ||
          tab === "missing_customer_info" ||
          tab === "missing_fulfillment_info" ? (
            <Card className="border-border/80 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle>Incoming channel orders</CardTitle>
                <CardDescription>
                  Pulled from connected sales channels via sync or webhooks. Resolve failures, map SKUs, then convert
                  into OS Kitchen orders when ready.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Channel</TableHead>
                      <TableHead>External #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Sync</TableHead>
                      <TableHead>Import batch</TableHead>
                      <TableHead>Next action</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {externalFiltered.map((o) => {
                      const nextAction = resolveExternalOrderHubRowNextAction(o);
                      return (
                      <TableRow key={o.id}>
                        <TableCell>
                          <Badge variant="outline" className="rounded-full">
                            {providerLabel(o.provider)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {o.externalOrderNumber ?? o.externalOrderId}
                        </TableCell>
                        <TableCell>{o.customerName ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-full">
                            {o.syncStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {o.channelImportBatch ? (
                            <Link
                              className="font-mono text-primary underline-offset-2 hover:underline"
                              href={`/dashboard/sales-channels/imports/${o.channelImportBatch.id}`}
                            >
                              {o.channelImportBatch.status}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {nextAction ? (
                            <Link
                              href={nextAction.href}
                              className={
                                nextAction.tone === "urgent"
                                  ? "font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-200"
                                  : "font-medium text-primary underline-offset-2 hover:underline"
                              }
                            >
                              {nextAction.label}
                            </Link>
                          ) : o.syncStatus === "SYNCING" ? (
                            <span className="text-muted-foreground">Syncing…</span>
                          ) : (
                            <span className="text-muted-foreground">On track</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{o.total != null ? String(o.total) : "—"}</TableCell>
                      </TableRow>
                    );
                    })}
                    {externalFiltered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-muted-foreground">
                          No channel rows in this tab.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
