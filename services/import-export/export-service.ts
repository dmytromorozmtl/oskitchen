import { ExportJobStatus } from "@prisma/client";

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
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/import-export/csv-format";
import type { ExportType } from "@/lib/import-export/export-types";

export type ExportBuildResult = { filename: string; body: string; rowCount: number };

export type BuildExportOptions = {
  /** Enables `audit_logs` CSV (platform superadmin only). */
  isSuperAdmin?: boolean;
};

export async function recordExportJob(
  userId: string,
  createdById: string | undefined,
  type: string,
  fileName: string,
  rowCount: number,
  filtersJson?: unknown,
): Promise<void> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  await prisma.exportJob.create({
    data: {
      userId,
      workspaceId: workspaceId ?? undefined,
      type,
      fileName,
      rowCount,
      status: ExportJobStatus.COMPLETED,
      completedAt: new Date(),
      createdById: createdById ?? undefined,
      filtersJson: filtersJson === undefined ? undefined : (filtersJson as object),
    },
  });
}

export async function buildExportCsv(
  userId: string,
  kind: ExportType,
  opts?: BuildExportOptions,
): Promise<ExportBuildResult> {
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
    case "orders": {
      const orders = await prisma.order.findMany({
        where: orderScope,
        orderBy: { createdAt: "desc" },
        take: 5000,
      });
      const body = toCsv(
        [
          "id",
          "customerName",
          "customerEmail",
          "status",
          "fulfillmentType",
          "total",
          "pickupDate",
          "createdAt",
        ],
        orders.map((o) => [
          o.id,
          o.customerName,
          o.customerEmail,
          o.status,
          o.fulfillmentType,
          o.total.toString(),
          o.pickupDate?.toISOString() ?? "",
          o.createdAt.toISOString(),
        ]),
      );
      return { filename: "kitchenos-orders.csv", body, rowCount: orders.length };
    }
    case "customers": {
      const orders = await prisma.order.findMany({
        where: orderScope,
        select: { customerEmail: true, customerName: true, total: true },
      });
      const map = new Map<string, { name: string; orders: number; lifetime: number }>();
      for (const o of orders) {
        const key = o.customerEmail.toLowerCase();
        const prev = map.get(key);
        const spend = Number(o.total);
        if (!prev) map.set(key, { name: o.customerName, orders: 1, lifetime: spend });
        else {
          map.set(key, {
            name: o.customerName,
            orders: prev.orders + 1,
            lifetime: prev.lifetime + spend,
          });
        }
      }
      const rows = [...map.entries()].map(([email, v]) => [email, v.name, v.orders, v.lifetime.toFixed(2)]);
      const body = toCsv(["email", "name", "orders", "lifetimeValue"], rows);
      return { filename: "kitchenos-customers.csv", body, rowCount: rows.length };
    }
    case "products": {
      const productWhere = await productListWhereForOwner(userId);
      const products = await prisma.product.findMany({
        where: productWhere,
        include: { menu: true },
        orderBy: [{ menuId: "asc" }, { sortOrder: "asc" }],
      });
      const body = toCsv(
        ["id", "menuTitle", "title", "category", "price", "active", "preparedDate"],
        products.map((p) => [
          p.id,
          p.menu.title,
          p.title,
          p.category,
          p.price.toString(),
          p.active ? "yes" : "no",
          p.preparedDate.toISOString(),
        ]),
      );
      return { filename: "kitchenos-menu-items.csv", body, rowCount: products.length };
    }
    case "production": {
      const productWhere = await productListWhereForOwner(userId);
      const products = await prisma.product.findMany({
        where: productWhere,
        include: { menu: true, productionTask: true },
        orderBy: [{ menuId: "asc" }, { sortOrder: "asc" }],
      });
      const body = toCsv(
        ["productId", "title", "menuTitle", "preparedDate", "cooked", "packed", "labeled", "assignedTo"],
        products.map((p) => [
          p.id,
          p.title,
          p.menu.title,
          p.preparedDate.toISOString(),
          p.productionTask?.cooked ? "yes" : "no",
          p.productionTask?.packed ? "yes" : "no",
          p.productionTask?.labeled ? "yes" : "no",
          p.productionTask?.assignedTo ?? "",
        ]),
      );
      return { filename: "kitchenos-production.csv", body, rowCount: products.length };
    }
    case "inventory": {
      const ingredients = await prisma.ingredient.findMany({
        where: ingredientScope,
        orderBy: { name: "asc" },
        take: 5000,
      });
      if (ingredients.length === 0) {
        const body = toCsv(
          ["note"],
          [
            [
              "No ingredient rows yet — add costing ingredients to populate purchasing + inventory exports.",
            ],
          ],
        );
        return { filename: "kitchenos-ingredients.csv", body, rowCount: 1 };
      }
      const body = toCsv(
        ["id", "name", "unit", "supplier", "costPerUnit", "currentStock", "parLevel"],
        ingredients.map((i) => [
          i.id,
          i.name,
          i.unit,
          i.supplier ?? "",
          i.costPerUnit.toString(),
          i.currentStock.toString(),
          i.parLevel.toString(),
        ]),
      );
      return { filename: "kitchenos-ingredients.csv", body, rowCount: ingredients.length };
    }
    case "integrations_metadata": {
      const conns = await prisma.integrationConnection.findMany({
        where: integrationScope,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          provider: true,
          name: true,
          status: true,
          shopDomain: true,
          baseUrl: true,
          lastSyncAt: true,
          lastError: true,
          externalStoreId: true,
        },
      });
      const body = toCsv(
        [
          "id",
          "provider",
          "name",
          "status",
          "shopDomain",
          "baseUrl",
          "externalStoreId",
          "lastSyncAt",
          "lastError",
        ],
        conns.map((c) => [
          c.id,
          c.provider,
          c.name,
          c.status,
          c.shopDomain ?? "",
          c.baseUrl ?? "",
          c.externalStoreId ?? "",
          c.lastSyncAt?.toISOString() ?? "",
          c.lastError ?? "",
        ]),
      );
      return { filename: "kitchenos-integrations-metadata.csv", body, rowCount: conns.length };
    }
    case "menus": {
      const menus = await prisma.menu.findMany({
        where: menuScope,
        orderBy: { createdAt: "desc" },
        take: 2000,
      });
      const body = toCsv(
        ["id", "title", "strategy", "published", "catalogOnly", "startDate", "endDate", "active"],
        menus.map((m) => [
          m.id,
          m.title,
          m.strategy,
          m.published ? "yes" : "no",
          m.catalogOnly ? "yes" : "no",
          m.startDate.toISOString(),
          m.endDate.toISOString(),
          m.active ? "yes" : "no",
        ]),
      );
      return { filename: "kitchenos-menus.csv", body, rowCount: menus.length };
    }
    case "brands": {
      const brands = await prisma.brand.findMany({
        where: { workspace: { ownerUserId: userId } },
        orderBy: { createdAt: "desc" },
        take: 2000,
      });
      const body = toCsv(
        ["id", "name", "slug", "conceptKind", "lifecycleStatus", "locationId", "defaultMenuId"],
        brands.map((b) => [
          b.id,
          b.name,
          b.slug,
          b.conceptKind,
          b.lifecycleStatus,
          b.locationId ?? "",
          b.defaultMenuId ?? "",
        ]),
      );
      return { filename: "kitchenos-brands.csv", body, rowCount: brands.length };
    }
    case "locations": {
      const locs = await prisma.location.findMany({
        where: locationScope,
        orderBy: { name: "asc" },
      });
      const body = toCsv(["id", "name", "timezone", "active"], locs.map((l) => [l.id, l.name, l.timezone, l.active ? "yes" : "no"]));
      return { filename: "kitchenos-locations.csv", body, rowCount: locs.length };
    }
    case "recipes": {
      const recipes = await prisma.recipe.findMany({
        where: recipeScope,
        include: { product: { select: { title: true } } },
        orderBy: { updatedAt: "desc" },
        take: 5000,
      });
      const body = toCsv(
        ["recipeId", "productId", "productTitle", "yieldQuantity", "yieldUnit", "laborMinutes", "packagingCost", "active"],
        recipes.map((r) => [
          r.id,
          r.productId,
          r.product.title,
          r.yieldQuantity.toString(),
          r.yieldUnit,
          r.laborMinutes,
          r.packagingCost.toString(),
          r.active ? "yes" : "no",
        ]),
      );
      return { filename: "kitchenos-recipes.csv", body, rowCount: recipes.length };
    }
    case "suppliers": {
      const sups = await prisma.supplier.findMany({
        where: supplierScope,
        orderBy: { name: "asc" },
        take: 2000,
      });
      const body = toCsv(
        ["id", "name", "email", "phone", "active", "minimumOrderAmount", "leadTimeDays"],
        sups.map((s) => [
          s.id,
          s.name,
          s.email ?? "",
          s.phone ?? "",
          s.active ? "yes" : "no",
          s.minimumOrderAmount?.toString() ?? "",
          s.leadTimeDays?.toString() ?? "",
        ]),
      );
      return { filename: "kitchenos-suppliers.csv", body, rowCount: sups.length };
    }
    case "purchase_orders": {
      const pos = await prisma.purchaseOrder.findMany({
        where: purchaseOrderScope,
        include: { supplier: { select: { name: true } }, lines: true },
        orderBy: { createdAt: "desc" },
        take: 2000,
      });
      const body = toCsv(
        ["id", "supplierName", "status", "total", "lineCount", "createdAt"],
        pos.map((p) => [
          p.id,
          p.supplier.name,
          p.status,
          p.total.toString(),
          p.lines.length,
          p.createdAt.toISOString(),
        ]),
      );
      return { filename: "kitchenos-purchase-orders.csv", body, rowCount: pos.length };
    }
    case "costing_snapshots": {
      const snaps = await prisma.costSnapshot.findMany({
        where: costSnapshotScope,
        include: { product: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        take: 8000,
      });
      const body = toCsv(
        [
          "id",
          "productId",
          "productTitle",
          "ingredientCost",
          "laborCost",
          "packagingCost",
          "totalCost",
          "salePrice",
          "marginPercent",
          "createdAt",
        ],
        snaps.map((s) => [
          s.id,
          s.productId,
          s.product.title,
          s.ingredientCost.toString(),
          s.laborCost.toString(),
          s.packagingCost.toString(),
          s.totalCost.toString(),
          s.salePrice.toString(),
          s.marginPercent.toString(),
          s.createdAt.toISOString(),
        ]),
      );
      return { filename: "kitchenos-costing-snapshots.csv", body, rowCount: snaps.length };
    }
    case "ingredient_demand": {
      const runs = await prisma.ingredientDemandRun.findMany({
        where: demandRunScope,
        orderBy: { createdAt: "desc" },
        take: 500,
        include: { lines: true },
      });
      const body = toCsv(
        ["runId", "title", "status", "dateFrom", "dateTo", "totalLines", "shortageLines", "estimatedCost", "createdAt"],
        runs.map((r) => [
          r.id,
          r.title,
          r.status,
          r.dateFrom.toISOString(),
          r.dateTo.toISOString(),
          r.totalLines,
          r.shortageLines,
          r.estimatedCost?.toString() ?? "",
          r.createdAt.toISOString(),
        ]),
      );
      return { filename: "kitchenos-ingredient-demand-runs.csv", body, rowCount: runs.length };
    }
    case "nutrition_labels": {
      const profiles = await prisma.nutritionProfile.findMany({
        where: nutritionScope,
        include: { product: { select: { title: true, id: true } } },
        take: 3000,
      });
      const body = toCsv(
        ["productId", "productTitle", "calories", "protein", "totalCarbohydrate", "fat", "verificationStatus"],
        profiles.map((n) => [
          n.productId,
          n.product.title,
          n.calories?.toString() ?? "",
          n.protein?.toString() ?? "",
          n.totalCarbohydrate?.toString() ?? "",
          n.fat?.toString() ?? "",
          n.verificationStatus,
        ]),
      );
      return { filename: "kitchenos-nutrition-labels.csv", body, rowCount: profiles.length };
    }
    case "packing": {
      const batches = await prisma.packingBatch.findMany({
        where: packingBatchScope,
        orderBy: { packingDate: "desc" },
        take: 3000,
      });
      const body = toCsv(
        [
          "id",
          "title",
          "packingDate",
          "status",
          "mode",
          "totalOrders",
          "totalItems",
          "packedItems",
          "labelStatus",
          "verificationStatus",
          "createdAt",
        ],
        batches.map((b) => [
          b.id,
          b.title,
          b.packingDate.toISOString(),
          b.status,
          b.mode,
          b.totalOrders,
          b.totalItems,
          b.packedItems,
          b.labelStatus,
          b.verificationStatus,
          b.createdAt.toISOString(),
        ]),
      );
      return { filename: "kitchenos-packing-batches.csv", body, rowCount: batches.length };
    }
    case "reports": {
      const body = toCsv(
        ["note"],
        [
          [
            "Operational reports export from dedicated Reports routes is planned; use existing dashboards and CSV exports for now.",
          ],
        ],
      );
      return { filename: "kitchenos-reports-placeholder.csv", body, rowCount: 1 };
    }
    case "audit_logs": {
      if (!opts?.isSuperAdmin) {
        throw new Error("AUDIT_EXPORT_FORBIDDEN");
      }
      const logs = await prisma.auditLog.findMany({
        where: auditLogScope,
        orderBy: { createdAt: "desc" },
        take: 8000,
      });
      const body = toCsv(
        ["id", "workspaceId", "action", "entityType", "entityId", "metadataJson", "createdAt"],
        logs.map((l) => [
          l.id,
          l.workspaceId ?? "",
          l.action,
          l.entityType,
          l.entityId ?? "",
          l.metadataJson != null ? JSON.stringify(l.metadataJson) : "",
          l.createdAt.toISOString(),
        ]),
      );
      return { filename: "kitchenos-audit-logs.csv", body, rowCount: logs.length };
    }
    default: {
      throw new Error(`Unsupported export type: ${String(kind)}`);
    }
  }
}
