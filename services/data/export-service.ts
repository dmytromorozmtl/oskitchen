import { Prisma } from "@prisma/client";

import {
  buildDataExportDomain,
  buildDataExportLane,
  buildDataPortabilitySnapshot,
  DATA_EXPORT_LANE_DOMAINS,
} from "@/lib/data/export-builders";
import type { DataPortabilitySnapshot } from "@/lib/data/export-types";
import { resolveVisibleExportTypes } from "@/lib/import-export/export-page-access";
import type { ExportType } from "@/lib/import-export/export-types";
import { prisma } from "@/lib/prisma";
import { hasSuperAdminRoleRow } from "@/lib/platform-super-bypass";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";
import {
  auditLogListWhereForOwner,
  costSnapshotListWhereForOwner,
  ingredientDemandRunListWhereForOwner,
  ingredientListWhereForOwner,
  integrationConnectionListWhereForOwner,
  locationListWhereForOwner,
  menuListWhereForOwner,
  nutritionProfileListWhereForOwner,
  packingBatchListWhereForOwner,
  productListWhereForOwner,
  purchaseOrderListWhereForOwner,
  recipeListWhereForOwner,
  supplierListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { recordExportJob } from "@/services/import-export/export-service";

export type { DataPortabilitySnapshot } from "@/lib/data/export-types";

async function countExportDomainRows(userId: string, kind: ExportType): Promise<number> {
  const [
    orderScope,
    menuScope,
    ingredientScope,
    integrationScope,
    locationScope,
    recipeScope,
    supplierScope,
    purchaseOrderScope,
    costSnapshotScope,
    demandRunScope,
    nutritionScope,
    packingBatchScope,
    auditLogScope,
  ] = await Promise.all([
    orderListWhereForOwner(userId),
    menuListWhereForOwner(userId),
    ingredientListWhereForOwner(userId),
    integrationConnectionListWhereForOwner(userId),
    locationListWhereForOwner(userId),
    recipeListWhereForOwner(userId),
    supplierListWhereForOwner(userId),
    purchaseOrderListWhereForOwner(userId),
    costSnapshotListWhereForOwner(userId),
    ingredientDemandRunListWhereForOwner(userId),
    nutritionProfileListWhereForOwner(userId),
    packingBatchListWhereForOwner(userId),
    auditLogListWhereForOwner(userId),
  ]);

  switch (kind) {
    case "orders":
      return prisma.order.count({ where: orderScope });
    case "customers": {
      const orders = await prisma.order.findMany({
        where: orderScope,
        select: { customerEmail: true },
        take: 5000,
      });
      return new Set(orders.map((o) => o.customerEmail.toLowerCase())).size;
    }
    case "products": {
      const productWhere = await productListWhereForOwner(userId);
      return prisma.product.count({ where: productWhere });
    }
    case "production": {
      const productWhere = await productListWhereForOwner(userId);
      return prisma.product.count({ where: productWhere });
    }
    case "inventory":
      return prisma.ingredient.count({ where: ingredientScope });
    case "integrations_metadata":
      return prisma.integrationConnection.count({ where: integrationScope });
    case "menus":
      return prisma.menu.count({ where: menuScope });
    case "brands":
      return prisma.brand.count({ where: { workspace: { ownerUserId: userId } } });
    case "locations":
      return prisma.location.count({ where: locationScope });
    case "recipes":
      return prisma.recipe.count({ where: recipeScope });
    case "suppliers":
      return prisma.supplier.count({ where: supplierScope });
    case "purchase_orders":
      return prisma.purchaseOrder.count({ where: purchaseOrderScope });
    case "costing_snapshots":
      return prisma.costSnapshot.count({ where: costSnapshotScope });
    case "ingredient_demand":
      return prisma.ingredientDemandRun.count({ where: demandRunScope });
    case "nutrition_labels":
      return prisma.nutritionProfile.count({ where: nutritionScope });
    case "packing":
      return prisma.packingBatch.count({ where: packingBatchScope });
    case "reports":
      return 1;
    case "audit_logs":
      return prisma.auditLog.count({ where: auditLogScope });
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export async function loadDataPortabilitySnapshot(input: {
  userId: string;
  sessionUserId: string;
  granted: ReadonlySet<PermissionKey>;
}): Promise<DataPortabilitySnapshot> {
  const isPlatformSuperAdmin = await hasSuperAdminRoleRow(input.sessionUserId);
  const visibleTypes = new Set(
    resolveVisibleExportTypes({
      granted: input.granted,
      isPlatformSuperAdmin,
    }),
  );

  const [workspace, profile, rowCounts] = await Promise.all([
    prisma.workspace.findFirst({
      where: { ownerUserId: input.userId },
      select: { name: true },
    }),
    prisma.userProfile.findUnique({
      where: { id: input.userId },
      select: { companyName: true },
    }),
    Promise.all(
      (Object.values(DATA_EXPORT_LANE_DOMAINS).flat() as ExportType[]).map(async (type) => ({
        type,
        rowCount: await countExportDomainRows(input.userId, type),
      })),
    ),
  ]);

  const rowCountByType = new Map(rowCounts.map((row) => [row.type, row.rowCount]));

  const lanes = (Object.keys(DATA_EXPORT_LANE_DOMAINS) as Array<keyof typeof DATA_EXPORT_LANE_DOMAINS>).map(
    (laneId) =>
      buildDataExportLane({
        id: laneId,
        domains: DATA_EXPORT_LANE_DOMAINS[laneId].map((type) =>
          buildDataExportDomain({
            type,
            rowCount: rowCountByType.get(type) ?? 0,
            accessible: visibleTypes.has(type),
          }),
        ),
      }),
  );

  return buildDataPortabilitySnapshot({
    workspaceLabel: workspace?.name ?? profile?.companyName ?? "Workspace",
    lanes,
  });
}

export async function buildPortabilityManifestJson(snapshot: DataPortabilitySnapshot): Promise<string> {
  return JSON.stringify(
    {
      policyId: snapshot.policyId,
      generatedAtIso: snapshot.generatedAtIso,
      workspaceLabel: snapshot.workspaceLabel,
      summary: snapshot.summary,
      domains: snapshot.lanes.flatMap((lane) =>
        lane.domains
          .filter((domain) => domain.accessible)
          .map((domain) => ({
            lane: lane.id,
            type: domain.type,
            label: domain.label,
            description: domain.description,
            rowCount: domain.rowCount,
            downloadHref: domain.downloadHref,
            format: domain.format,
          })),
      ),
    },
    null,
    2,
  );
}

export async function recordPortabilityManifestExport(input: {
  userId: string;
  sessionUserId: string;
  snapshot: DataPortabilitySnapshot;
}): Promise<void> {
  await recordExportJob(
    input.userId,
    input.sessionUserId,
    "portability_manifest",
    "kitchenos-portability-manifest.json",
    input.snapshot.summary.accessibleDomainCount,
    {
      totalRows: input.snapshot.summary.totalRows,
      domainCount: input.snapshot.summary.domainCount,
    } satisfies Prisma.InputJsonObject,
  );
}
