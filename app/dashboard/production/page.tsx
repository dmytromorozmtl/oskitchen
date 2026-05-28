import { endOfDay, format, parseISO, startOfDay } from "date-fns";

import { ProductionCommandCenter } from "@/components/dashboard/production-command-center";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { TodayQueue } from "@/components/production/today-queue";
import { isDailyServiceMode } from "@/lib/operating-modes/resolver";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { getTenantOperatingMode } from "@/lib/operating-modes/tenant-mode";
import { normalizeProductionView } from "@/lib/production/production-views";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findOwnerKitchenSettings } from "@/lib/scope/owner-kitchen-settings";
import { getTodayQueue } from "@/services/production/daily-queue-service";
import { aggregateWorkItemKpis } from "@/lib/production/production-aggregation";
import { overloadFromItems } from "@/lib/production/production-capacity";
import { productionEmptyStateForBusiness } from "@/lib/production/production-modes";
import { productionPageSubtitle, productionPageTitle } from "@/lib/production/production-terminology";
import { productListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

function parseProductionDay(raw: string | undefined): Date {
  if (!raw?.trim()) return startOfDay(new Date());
  try {
    return startOfDay(parseISO(raw.trim()));
  } catch {
    return startOfDay(new Date());
  }
}

export default async function ProductionPage({
  searchParams,
}: {
  searchParams?: Promise<{ date?: string; view?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const actor = await requireWorkspacePermissionActor();
  const { sessionUser, dataUserId } = actor;
  const operatingMode = await getTenantOperatingMode(dataUserId);

  if (isDailyServiceMode(operatingMode)) {
    const orders = await getTodayQueue(dataUserId);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Today&apos;s Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Same-day orders in real time — bump from Kitchen Display when items are ready.
          </p>
        </div>
        <TodayQueue initialOrders={orders} />
      </div>
    );
  }

  if (!hasPermission(actor.granted, "production.manage")) {
    return <PermissionDeniedSurfaceCard surfaceId="production_board" />;
  }

  const productionDay = parseProductionDay(sp.date);
  const dayEnd = endOfDay(productionDay);
  const view = normalizeProductionView(sp.view);

  const productWhere = await productListWhereForOwner(dataUserId);

  const [kitchen, workItemsRaw, batchesRaw, products, productionStations] = await Promise.all([
    findOwnerKitchenSettings(dataUserId, { businessType: true }),
    prisma.productionWorkItem.findMany({
      where: {
        userId: dataUserId,
        OR: [
          { batch: { productionDate: productionDay } },
          {
            AND: [
              { batchId: null },
              { createdAt: { gte: productionDay, lte: dayEnd } },
            ],
          },
        ],
      },
      orderBy: [{ dueAt: "asc" }, { createdAt: "asc" }],
      take: 500,
    }),
    prisma.productionBatch.findMany({
      where: { userId: dataUserId, productionDate: productionDay },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.product.findMany({
      where: productWhere,
      include: {
        menu: true,
        productionTask: true,
      },
      orderBy: [{ menuId: "asc" }, { sortOrder: "asc" }],
    }),
    prisma.productionStation.findMany({
      where: { userId: dataUserId, active: true },
      orderBy: { sortOrder: "asc" },
      select: { name: true },
    }),
  ]);

  const businessType = kitchen?.businessType ?? null;

  const workItems = workItemsRaw.map((w) => ({
    id: w.id,
    title: w.title,
    quantity: w.quantity,
    station: w.station,
    stage: w.stage,
    status: w.status,
    sourceType: w.sourceType,
    dueAt: w.dueAt ? w.dueAt.toISOString() : null,
    requiresPacking: w.requiresPacking,
    requiresLabel: w.requiresLabel,
    allergenWarning: w.allergenWarning,
  }));

  const batches = batchesRaw.map((b) => ({
    id: b.id,
    title: b.title,
    mode: b.mode,
    status: b.status,
    totalItems: b.totalItems,
    completedItems: b.completedItems,
    productionDate: b.productionDate.toISOString(),
  }));

  const kpiInput = workItemsRaw.map((w) => ({
    status: w.status,
    priority: w.priority,
    requiresPacking: w.requiresPacking,
    station: w.station,
    dueAt: w.dueAt,
    estimatedMinutes: null,
  }));
  const agg = aggregateWorkItemKpis(kpiInput);
  const kpis = {
    ...agg,
    stationWarnings: overloadFromItems(kpiInput),
  };

  const legacyRows = products.map((p) => ({
    productId: p.id,
    title: p.title,
    menuTitle: p.menu.title,
    category: p.category,
    preparedDate: p.preparedDate ? p.preparedDate.toISOString() : null,
    cooked: p.productionTask?.cooked ?? false,
    packed: p.productionTask?.packed ?? false,
    labeled: p.productionTask?.labeled ?? false,
    assignedTo: p.productionTask?.assignedTo ?? null,
  }));

  const productionDateIso = `${format(productionDay, "yyyy-MM-dd")}T00:00:00.000Z`;

  return (
    <ProductionCommandCenter
      pageTitle={productionPageTitle(businessType)}
      pageSubtitle={productionPageSubtitle()}
      productionDateIso={productionDateIso}
      emptyCopy={productionEmptyStateForBusiness(businessType)}
      kpis={kpis}
      workItems={workItems}
      batches={batches}
      legacyRows={legacyRows}
      stationNames={productionStations.map((s) => s.name)}
      view={view}
    />
  );
}
