import Link from "next/link";

import { B2bReceivablesDashboard } from "@/components/dashboard/receivables/b2b-receivables-dashboard";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isShopifyMarketsB2bArDashboardEnabled } from "@/lib/commercial/shopify-market-b2b-ar-dashboard";
import type { B2bArAgingBucket } from "@/lib/integrations/shopify-b2b-ar-aging-metadata";
import {
  hasOrderHubPageAccess,
  loadWorkspacePermissionPageActor,
} from "@/lib/ux/permission-denied-page-access-era19";
import { prisma } from "@/lib/prisma";
import { orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";
import { buildB2bArDashboardSnapshotForOwner } from "@/services/integrations/shopify-b2b-ar-dashboard-service";

function parseBucket(raw: string | undefined): B2bArAgingBucket | "all" | "overdue" {
  if (
    raw === "current" ||
    raw === "days_0_30" ||
    raw === "days_31_60" ||
    raw === "days_61_plus" ||
    raw === "overdue"
  ) {
    return raw;
  }
  return "all";
}

export default async function ReceivablesPage({
  searchParams,
}: {
  searchParams?: Promise<{ bucket?: string }>;
}) {
  const actor = await loadWorkspacePermissionPageActor();
  if (!hasOrderHubPageAccess(actor)) {
    return <PermissionDeniedSurfaceCard surfaceId="order_hub" />;
  }

  if (!isShopifyMarketsB2bArDashboardEnabled()) {
    return (
      <Card className="mx-auto max-w-2xl border-border/80">
        <CardHeader>
          <CardTitle>B2B receivables</CardTitle>
          <CardDescription>
            Consolidated AR dashboard is disabled in this environment. Set{" "}
            <code className="font-mono text-xs">SHOPIFY_MARKETS_B2B_AR_DASHBOARD=1</code> to enable.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const sp = (await searchParams) ?? {};
  const activeBucket = parseBucket(sp.bucket);
  const snapshot = await buildB2bArDashboardSnapshotForOwner({
    userId: actor.dataUserId,
    recordView: true,
  });

  if (!snapshot) {
    return (
      <Card className="mx-auto max-w-2xl border-border/80">
        <CardHeader>
          <CardTitle>B2B receivables</CardTitle>
          <CardDescription>
            Connect Shopify Markets and enable the B2B AR dashboard on Integrations → Shopify.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="rounded-full">
            <Link href="/dashboard/integrations/shopify">Open Shopify integration</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const orderIds = snapshot.rows.map((row) => row.orderId);
  const orders = orderIds.length
    ? await prisma.order.findMany({
        where: {
          AND: [await orderListWhereForOwner(actor.dataUserId), { id: { in: orderIds } }],
        },
        select: { id: true, sourceMetadataJson: true, paymentStatus: true },
      })
    : [];
  const ordersById = new Map(
    orders.map((order) => [
      order.id,
      { sourceMetadataJson: order.sourceMetadataJson, paymentStatus: order.paymentStatus },
    ]),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">B2B receivables</h1>
          <p className="text-sm text-muted-foreground">
            {snapshot.openTotal} open · {snapshot.overdueTotal} overdue · updated{" "}
            {new Date(snapshot.computedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {snapshot.openTotal === 0 ? (
        <Card className="border-border/80 bg-card/90">
          <CardHeader>
            <CardTitle>No open B2B receivables</CardTitle>
            <CardDescription>
              Promoted Shopify B2B net-terms orders with invoice drafts will appear here once open.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/order-hub">Go to Order Hub</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <B2bReceivablesDashboard
          snapshot={snapshot}
          ordersById={ordersById}
          activeBucket={activeBucket}
        />
      )}
    </div>
  );
}
