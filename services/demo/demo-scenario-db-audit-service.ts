import { ChannelConflictResolutionStatus, MenuStrategy, ProductMappingStatus } from "@prisma/client";

import type { GoldenDemoScenarioId } from "@/lib/demo/demo-data-contract";
import { channelConflictWhereForOwner } from "@/lib/scope/channel-import-scope";
import { kitchenCustomerListWhereForOwner } from "@/lib/scope/workspace-customer-scope";
import { productMappingListWhereForOwner } from "@/lib/scope/workspace-product-mapping-scope";
import {
  externalOrderListWhereForOwner,
  externalProductListWhereForOwner,
} from "@/lib/scope/workspace-channel-scope";
import { printedLabelListWhereForOwner } from "@/lib/scope/workspace-printed-label-scope";
import { posAuditEventListWhereForOwner } from "@/lib/scope/workspace-accounting-scope";
import {
  analyticsSnapshotListWhereForOwner,
  cateringQuoteListWhereForOwner,
  deliveryRouteListWhereForOwner,
  executiveSnapshotListWhereForOwner,
  ingredientDemandRunListWhereForOwner,
  locationListWhereForOwner,
  menuListWhereForOwnerAnd,
  orderListWhereForOwner,
  orderListWhereForOwnerAnd,
  packingTaskListWhereForOwner,
  posTransactionListWhereForOwner,
  productListWhereForOwner,
  productionBatchListWhereForOwner,
  productionWorkItemListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export type DemoDbAuditStatus = "PASS" | "WARN" | "FAIL";

export type DemoDbCheck = {
  id: string;
  status: DemoDbAuditStatus;
  message: string;
};

export type DemoDbScenarioRow = {
  scenarioId: GoldenDemoScenarioId;
  title: string;
  status: DemoDbAuditStatus;
  checks: DemoDbCheck[];
};

function rollup(checks: DemoDbCheck[]): DemoDbAuditStatus {
  if (checks.some((c) => c.status === "FAIL")) return "FAIL";
  if (checks.some((c) => c.status === "WARN")) return "WARN";
  return "PASS";
}

function pass(id: string, message: string): DemoDbCheck {
  return { id, status: "PASS", message };
}

function warn(id: string, message: string): DemoDbCheck {
  return { id, status: "WARN", message };
}

function fail(id: string, message: string): DemoDbCheck {
  return { id, status: "FAIL", message };
}

/**
 * Read-only DB validation for a single demo workspace (owner profile scope).
 * Does not seed, delete, or mutate data.
 */
export async function auditDemoWorkspaceAgainstGoldenScenarios(workspaceId: string): Promise<{
  ownerUserId: string;
  demoMode: boolean;
  rows: DemoDbScenarioRow[];
}> {
  const ws = await prisma.workspace.findFirst({
    where: { id: workspaceId },
    select: { id: true, ownerUserId: true },
  });
  if (!ws) {
    return {
      ownerUserId: "",
      demoMode: false,
      rows: [
        {
          scenarioId: "meal-prep-weekly",
          title: "Workspace",
          status: "FAIL",
          checks: [fail("workspace", "Workspace id not found.")],
        },
      ],
    };
  }

  const uid = ws.ownerUserId;
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: uid },
    select: { demoMode: true },
  });
  const demoMode = kitchen?.demoMode ?? false;

  if (!demoMode) {
    return {
      ownerUserId: uid,
      demoMode: false,
      rows: [
        {
          scenarioId: "meal-prep-weekly",
          title: "Demo mode gate",
          status: "FAIL",
          checks: [
            fail(
              "demo_mode",
              "Owner kitchenSettings.demoMode is off — enable demo mode for this workspace before DB golden audits.",
            ),
          ],
        },
      ],
    };
  }

  const [
    weeklyMenuWhere,
    productWhere,
    orderWhere,
    posOrderWhere,
    ordersWithPickupWhere,
    customerWhere,
    externalOrderWhere,
    externalProductWhere,
    mappingWhere,
    channelConflictWhere,
    productionWorkWhere,
    productionBatchWhere,
    packingTaskWhere,
    deliveryRouteWhere,
    ingredientRunWhere,
    posTxWhere,
    posAuditWhere,
    analyticsWhere,
    executiveWhere,
    cateringWhere,
    locationWhere,
  ] = await Promise.all([
    menuListWhereForOwnerAnd(uid, {
      strategy: MenuStrategy.WEEKLY_PREORDER,
      catalogOnly: false,
    }),
    productListWhereForOwner(uid),
    orderListWhereForOwner(uid),
    orderListWhereForOwnerAnd(uid, {
      creationSource: { equals: "POS", mode: "insensitive" },
    }),
    orderListWhereForOwnerAnd(uid, { pickupDate: { not: null } }),
    kitchenCustomerListWhereForOwner(uid),
    externalOrderListWhereForOwner(uid),
    externalProductListWhereForOwner(uid),
    productMappingListWhereForOwner(uid),
    channelConflictWhereForOwner(uid),
    productionWorkItemListWhereForOwner(uid),
    productionBatchListWhereForOwner(uid),
    packingTaskListWhereForOwner(uid),
    deliveryRouteListWhereForOwner(uid),
    ingredientDemandRunListWhereForOwner(uid),
    posTransactionListWhereForOwner(uid),
    posAuditEventListWhereForOwner(uid),
    analyticsSnapshotListWhereForOwner(uid),
    executiveSnapshotListWhereForOwner(uid),
    cateringQuoteListWhereForOwner(uid),
    locationListWhereForOwner(uid),
  ]);

  const [
    weeklyMenus,
    menuProducts,
    orders,
    productionWork,
    productionBatches,
    packingTasks,
    printedLabels,
    deliveryRoutes,
    deliveryStops,
    ingredientRuns,
    customers,
    posOrders,
    posTx,
    posReceipts,
    posAudit,
    analytics,
    executive,
    cateringQuotes,
    cateringFollowUps,
    cateringConverted,
    cateringWithEventDate,
    ordersWithPickupDate,
    externalOrders,
    unmappedExternalProducts,
    mappingNeedsReview,
    channelConflicts,
    brands,
    locations,
    brandGroups,
    nutritionProfiles,
    allergenProfiles,
  ] = await Promise.all([
    prisma.menu.count({ where: weeklyMenuWhere }),
    prisma.product.count({ where: productWhere }),
    prisma.order.count({ where: orderWhere }),
    prisma.productionWorkItem.count({ where: productionWorkWhere }),
    prisma.productionBatch.count({ where: productionBatchWhere }),
    prisma.packingTask.count({ where: packingTaskWhere }),
    prisma.printedLabel.count({ where: await printedLabelListWhereForOwner(uid) }),
    prisma.deliveryRoute.count({ where: deliveryRouteWhere }),
    prisma.deliveryStop.count({ where: { order: orderWhere } }),
    prisma.ingredientDemandRun.count({ where: ingredientRunWhere }),
    prisma.kitchenCustomer.count({ where: customerWhere }),
    prisma.order.count({ where: posOrderWhere }),
    prisma.pOSTransaction.count({ where: posTxWhere }),
    prisma.pOSReceipt.count({ where: { transaction: posTxWhere } }),
    prisma.pOSAuditEvent.count({ where: posAuditWhere }),
    prisma.analyticsSnapshot.count({ where: analyticsWhere }),
    prisma.executiveSnapshot.count({ where: executiveWhere }),
    prisma.cateringQuote.count({ where: cateringWhere }),
    prisma.cateringQuoteFollowUp.count({ where: { quote: cateringWhere } }),
    prisma.cateringQuote.count({
      where: { AND: [cateringWhere, { convertedOrderId: { not: null } }] },
    }),
    prisma.cateringQuote.count({
      where: { AND: [cateringWhere, { eventDate: { not: null } }] },
    }),
    prisma.order.count({ where: ordersWithPickupWhere }),
    prisma.externalOrder.count({ where: externalOrderWhere }),
    prisma.externalProduct.count({
      where: { AND: [externalProductWhere, { mappedProductId: null }] },
    }),
    prisma.productMapping.count({
      where: {
        AND: [
          mappingWhere,
          { status: ProductMappingStatus.NEEDS_REVIEW, internalProductId: null },
        ],
      },
    }),
    prisma.channelConflict.count({
      where: {
        AND: [channelConflictWhere, { status: ChannelConflictResolutionStatus.OPEN }],
      },
    }),
    prisma.brand.count({ where: { workspaceId } }),
    prisma.location.count({ where: locationWhere }),
    prisma.order.groupBy({
      by: ["brandId"],
      where: { AND: [orderWhere, { brandId: { not: null } }] },
      _count: { _all: true },
    }),
    prisma.nutritionProfile.count({ where: { product: productWhere } }),
    prisma.allergenProfile.count({ where: { product: productWhere } }),
  ]);

  const productionSignal = productionWork + productionBatches;
  const packingSignal = packingTasks + printedLabels;
  const routeSignal = deliveryRoutes + deliveryStops;
  const distinctBrandsOnOrders = brandGroups.filter((g) => g.brandId != null).length;

  const mealPrep: DemoDbCheck[] = [
    weeklyMenus > 0 ? pass("weekly_menu", `${weeklyMenus} weekly-style menu(s).`) : fail("weekly_menu", "No WEEKLY_PREORDER menu rows."),
    menuProducts > 0 ? pass("menu_items", `${menuProducts} product row(s) under menus.`) : fail("menu_items", "No menu products."),
    orders > 0 ? pass("orders", `${orders} order(s).`) : fail("orders", "No orders."),
    productionSignal > 0
      ? pass("production", `Production signal: work items + batches = ${productionSignal}.`)
      : warn("production", "No production batches/work items — model may be empty for this seed."),
    packingSignal > 0
      ? pass("packing", `Packing signal: tasks + printed labels = ${packingSignal}.`)
      : warn("packing", "No packing tasks or printed labels — vertical may not emit packing in seed."),
    routeSignal > 0
      ? pass("routes", `Route/delivery signal: routes ${deliveryRoutes}, stops ${deliveryStops}.`)
      : warn("routes", "No delivery routes/stops — WARN if delivery is not modeled."),
    ingredientRuns > 0
      ? pass("ingredient_demand", `${ingredientRuns} ingredient demand run(s).`)
      : warn("ingredient_demand", "No ingredient demand runs — AvT/demand may not be seeded."),
    customers > 0 ? pass("crm_customer", `${customers} kitchen customer(s).`) : warn("crm_customer", "No CRM customers yet."),
  ];

  const cafe: DemoDbCheck[] = [
    posOrders > 0 ? pass("pos_orders", `${posOrders} POS-sourced order(s).`) : fail("pos_orders", "No POS orders (creationSource POS)."),
    posTx > 0 ? pass("pos_transaction", `${posTx} POS transaction(s).`) : warn("pos_transaction", "No POS transactions — receipt path may be incomplete."),
    posReceipts > 0 ? pass("pos_receipt", `${posReceipts} receipt row(s).`) : warn("pos_receipt", "No POS receipts — Model not implemented yet for this tenant."),
    posOrders >= 2
      ? pass("pos_mix", "Multiple POS orders — ready vs routed split not distinguished in schema; treating as signal.")
      : warn("pos_mix", "Fewer than 2 POS orders — cannot distinguish ready-now vs kitchen-routed mix."),
    productionSignal > 0
      ? pass("kitchen_routed", `Kitchen production signal ${productionSignal}.`)
      : warn("kitchen_routed", "No production work for POS narrative."),
    customers > 0 ? pass("guest_crm", `${customers} customer profile(s).`) : warn("guest_crm", "No customers — guest attach story not present."),
    analytics + executive > 0
      ? pass("analytics", `Analytics/executive snapshots: ${analytics + executive}.`)
      : warn("analytics", "No analytics snapshots — Model not implemented yet or not seeded."),
    posAudit > 0 ? pass("pos_activity", `${posAudit} POS audit event(s).`) : warn("pos_activity", "No POS audit events — activity timeline not seeded."),
  ];

  const bakery: DemoDbCheck[] = [
    orders > 0 ? pass("preorder", `${orders} order(s).`) : fail("preorder", "No orders."),
    ordersWithPickupDate > 0
      ? pass("pickup_window", `${ordersWithPickupDate} order(s) with pickupDate.`)
      : warn("pickup_window", "No pickupDate on orders — pickup window not explicit."),
    productionBatches > 0
      ? pass("batch_production", `${productionBatches} production batch(es).`)
      : warn("batch_production", "No production batches."),
    nutritionProfiles + allergenProfiles > 0
      ? pass("label_signal", `Nutrition/allergen profiles: ${nutritionProfiles + allergenProfiles}.`)
      : warn("label_signal", "No nutrition/allergen profiles — Model not implemented yet for this seed."),
  ];

  const catering: DemoDbCheck[] = [
    cateringQuotes > 0 ? pass("quote", `${cateringQuotes} catering quote(s).`) : fail("quote", "No catering quotes."),
    cateringConverted > 0
      ? pass("event_order", `${cateringConverted} quote(s) converted to orders.`)
      : warn("event_order", "No converted catering orders."),
    cateringWithEventDate > 0
      ? pass("event_date", `${cateringWithEventDate} quote(s) with eventDate.`)
      : warn("event_date", "No catering eventDate set."),
    packingTasks > 0 ? pass("loadout_packing", `${packingTasks} packing task(s).`) : warn("loadout_packing", "No packing tasks for loadout story."),
    cateringFollowUps > 0
      ? pass("crm_followup", `${cateringFollowUps} catering quote follow-up(s).`)
      : warn("crm_followup", "No catering follow-ups."),
  ];

  const ghost: DemoDbCheck[] = [
    externalOrders > 0 ? pass("channel_order", `${externalOrders} external order(s).`) : fail("channel_order", "No external orders."),
    unmappedExternalProducts > 0
      ? pass("unmapped_product", `${unmappedExternalProducts} unmapped external product(s).`)
      : warn("unmapped_product", "No unmapped external products."),
    mappingNeedsReview + channelConflicts > 0
      ? pass("mapping_suggestion", `Open mapping/conflict signals: mappings ${mappingNeedsReview}, conflicts ${channelConflicts}.`)
      : warn("mapping_suggestion", "No open mapping review rows or channel conflicts."),
    productionSignal + packingSignal > 0
      ? pass("ops_signal", `Production/packing combined signal ${productionSignal + packingSignal}.`)
      : warn("ops_signal", "No production/packing rows for channel workload."),
  ];

  const multi: DemoDbCheck[] = [
    brands >= 2 ? pass("brands", `${brands} brand(s) on workspace.`) : fail("brands", "Need at least two brands for multi-brand scenario."),
    locations > 0 ? pass("location", `${locations} location(s) for owner.`) : warn("location", "No locations — shared kitchen signal weak."),
    distinctBrandsOnOrders >= 2
      ? pass("brand_orders", `Orders span ${distinctBrandsOnOrders} brand(s).`)
      : warn("brand_orders", "Orders do not show multi-brand mix — Model not implemented yet or seed uses single brand."),
    executive + analytics > 0
      ? pass("exec_analytics", `Executive/analytics snapshots ${executive + analytics}.`)
      : warn("exec_analytics", "No executive/analytics snapshots."),
  ];

  const rows: DemoDbScenarioRow[] = [
    { scenarioId: "meal-prep-weekly", title: "Meal prep weekly operations", status: rollup(mealPrep), checks: mealPrep },
    { scenarioId: "cafe-pos", title: "Cafe POS counter sale", status: rollup(cafe), checks: cafe },
    { scenarioId: "bakery-preorder", title: "Bakery preorder pickup", status: rollup(bakery), checks: bakery },
    { scenarioId: "catering-event", title: "Catering event", status: rollup(catering), checks: catering },
    { scenarioId: "ghost-channel", title: "Ghost kitchen channel operations", status: rollup(ghost), checks: ghost },
    { scenarioId: "multi-brand-commissary", title: "Multi-brand / commissary", status: rollup(multi), checks: multi },
  ];

  return { ownerUserId: uid, demoMode: true, rows };
}

export function summarizeDemoDbAudit(rows: DemoDbScenarioRow[]): {
  passCount: number;
  warnCount: number;
  failCount: number;
} {
  return {
    passCount: rows.filter((r) => r.status === "PASS").length,
    warnCount: rows.filter((r) => r.status === "WARN").length,
    failCount: rows.filter((r) => r.status === "FAIL").length,
  };
}
