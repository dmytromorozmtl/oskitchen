import {
  enrichBriefingTilesLinks,
} from "@/lib/briefing/owner-daily-briefing-tile-links-era19";
import type {
  OwnerDailyBriefingActionRole,
  OwnerDailyBriefingRankedAction,
  OwnerDailyBriefingTile,
  OwnerDailyBriefingTileDraft,
} from "@/lib/briefing/owner-daily-briefing-era19";
import {
  BRIEFING_FULFILLMENT_COMMAND_FLOW_TILE_ID,
  FULFILLMENT_COMMAND_FLOW_ORDER_HUB_ROUTE,
  FULFILLMENT_COMMAND_FLOW_ORDERS_ROUTE,
  OWNER_DAILY_BRIEFING_FULFILLMENT_COMMAND_FLOW_ERA19_POLICY_ID,
} from "@/lib/briefing/owner-daily-briefing-fulfillment-command-flow-era19-policy";
import {
  buildBriefingKitchenKdsSummary,
  type OwnerDailyBriefingKitchenInput,
} from "@/lib/briefing/owner-daily-briefing-kitchen-era19";
import { BRIEFING_KDS_PRIORITY_LANE_HREF, KDS_KITCHEN_ROUTE } from "@/lib/kitchen/kds-priority-lane-era19-policy";
import { buildPackingQcClarityHref } from "@/lib/packing/packing-qc-clarity-era19";

export const OWNER_DAILY_BRIEFING_FULFILLMENT_COMMAND_FLOW_AGGREGATOR_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-fulfillment-command-flow-aggregator-v1" as const;

export {
  BRIEFING_FULFILLMENT_COMMAND_FLOW_TILE_ID,
  OWNER_DAILY_BRIEFING_FULFILLMENT_COMMAND_FLOW_ERA19_POLICY_ID,
};

export type FulfillmentCommandFlowBriefingInput = OwnerDailyBriefingKitchenInput & {
  activeOrders: number;
  ordersToday: number;
  blockedOrdersApprox: number;
  posKitchenQueueToday: number;
  productionWorkOpen: number;
};

export type FulfillmentCommandFlowBottleneck = "stuck_orders" | "kds" | "packing";

export type FulfillmentCommandFlowSnapshot = {
  hasOrderPipeline: boolean;
  hasKitchenWork: boolean;
  hasPackingWork: boolean;
  kdsQueueCount: number;
  showPriorityLane: boolean;
  bottleneck: FulfillmentCommandFlowBottleneck;
  bottleneckHref: string;
  bottleneckLabel: string;
};

function draftTile(tile: OwnerDailyBriefingTileDraft): OwnerDailyBriefingTile {
  return enrichBriefingTilesLinks([tile])[0]!;
}

export function summarizeFulfillmentCommandFlow(
  input: FulfillmentCommandFlowBriefingInput,
): FulfillmentCommandFlowSnapshot | null {
  const summary = buildBriefingKitchenKdsSummary(input.kdsOrders);
  const kdsPressure = input.posKitchenQueueToday + input.productionWorkOpen;
  const hasOrderPipeline = input.activeOrders > 0 || input.ordersToday > 0;
  const hasKitchenWork =
    kdsPressure > 0 || summary.queueCount > 0 || summary.showPriorityLane;
  const hasPackingWork = input.packingQueueOpen > 0;

  const active =
    (input.blockedOrdersApprox > 0 && (hasKitchenWork || hasPackingWork)) ||
    (hasOrderPipeline && hasKitchenWork && hasPackingWork);

  if (!active) return null;

  let bottleneck: FulfillmentCommandFlowBottleneck;
  let bottleneckHref: string;
  let bottleneckLabel: string;

  if (input.blockedOrdersApprox > 0) {
    bottleneck = "stuck_orders";
    bottleneckHref = FULFILLMENT_COMMAND_FLOW_ORDER_HUB_ROUTE;
    bottleneckLabel = `${input.blockedOrdersApprox} stuck`;
  } else if (summary.showPriorityLane || summary.overdueCount > 0 || kdsPressure > 0) {
    bottleneck = "kds";
    bottleneckHref = summary.showPriorityLane
      ? BRIEFING_KDS_PRIORITY_LANE_HREF
      : KDS_KITCHEN_ROUTE;
    bottleneckLabel =
      summary.overdueCount > 0
        ? `${summary.overdueCount} KDS overdue`
        : `${Math.max(summary.queueCount, kdsPressure)} KDS`;
  } else {
    bottleneck = "packing";
    bottleneckHref = buildPackingQcClarityHref();
    bottleneckLabel = `${input.packingQueueOpen} pack`;
  }

  return {
    hasOrderPipeline,
    hasKitchenWork,
    hasPackingWork,
    kdsQueueCount: summary.queueCount,
    showPriorityLane: summary.showPriorityLane,
    bottleneck,
    bottleneckHref,
    bottleneckLabel,
  };
}

export function buildBriefingFulfillmentCommandFlowTile(
  input: FulfillmentCommandFlowBriefingInput,
): OwnerDailyBriefingTile | null {
  const flow = summarizeFulfillmentCommandFlow(input);
  if (!flow) return null;

  const orderStage =
    input.blockedOrdersApprox > 0
      ? `${input.blockedOrdersApprox} stuck in Order Hub`
      : `${input.activeOrders || input.ordersToday} in pipeline`;
  const kdsStage = flow.showPriorityLane
    ? "KDS priority lane active"
    : `${flow.kdsQueueCount + input.posKitchenQueueToday + input.productionWorkOpen} kitchen ticket(s)`;
  const packStage = `${input.packingQueueOpen} pack job(s) open`;

  return draftTile({
    id: BRIEFING_FULFILLMENT_COMMAND_FLOW_TILE_ID,
    category: "orders",
    label: "Order → KDS → Packing",
    value: flow.bottleneckLabel,
    detail: `${orderStage} · ${kdsStage} · ${packStage} — clear ${flow.bottleneck.replace("_", " ")} first.`,
    href: flow.bottleneckHref,
    availability: "available",
    tone: flow.bottleneck === "stuck_orders" ? "attention" : "attention",
    priority: 1,
  });
}

export function enrichBriefingFulfillmentCommandFlowPackTiles(
  tiles: readonly OwnerDailyBriefingTile[],
  input: FulfillmentCommandFlowBriefingInput,
): OwnerDailyBriefingTile[] {
  const flow = summarizeFulfillmentCommandFlow(input);
  const flowTile = buildBriefingFulfillmentCommandFlowTile(input);

  let next = tiles.filter((tile) => tile.id !== BRIEFING_FULFILLMENT_COMMAND_FLOW_TILE_ID);

  if (flowTile) {
    const ordersIndex = next.findIndex((tile) => tile.id === "orders-today");
    if (ordersIndex >= 0) {
      const withFlow = [...next];
      withFlow.splice(ordersIndex + 1, 0, flowTile);
      next = withFlow;
    } else {
      next = [flowTile, ...next];
    }
  }

  if (!flow) return next;

  return next.map((tile) => {
    if (tile.id === "kds-pressure") {
      return {
        ...tile,
        href: flow.showPriorityLane ? BRIEFING_KDS_PRIORITY_LANE_HREF : tile.href,
        detail: `${tile.detail} Fulfillment chain active — kitchen is the current handoff from orders.`,
      };
    }
    if (tile.id === "packing-status" && input.packingQueueOpen > 0) {
      return {
        ...tile,
        href: buildPackingQcClarityHref(),
        detail: `${tile.detail} Orders cleared KDS — run outbound QC before handoff.`,
        tone: "attention" as const,
      };
    }
    if (tile.id === "stuck-orders" && input.blockedOrdersApprox > 0) {
      return {
        ...tile,
        href: FULFILLMENT_COMMAND_FLOW_ORDER_HUB_ROUTE,
        detail: `${tile.detail} Pipeline blocked upstream — triage before KDS and packing.`,
      };
    }
    if (tile.id === "orders-today" && input.blockedOrdersApprox === 0) {
      return {
        ...tile,
        href: FULFILLMENT_COMMAND_FLOW_ORDERS_ROUTE,
        detail: `${tile.detail} Intake feeds KDS then packing — monitor the full chain.`,
      };
    }
    return tile;
  });
}

export function buildOwnerDailyBriefingFulfillmentCommandFlowActions(
  input: FulfillmentCommandFlowBriefingInput,
  ownerRole: OwnerDailyBriefingActionRole,
): OwnerDailyBriefingRankedAction[] {
  const flow = summarizeFulfillmentCommandFlow(input);
  if (!flow) return [];

  const bottleneckDetail =
    flow.bottleneck === "stuck_orders"
      ? `${input.blockedOrdersApprox} order(s) stuck upstream — clear Order Hub before kitchen and packing can move.`
      : flow.bottleneck === "kds"
        ? `Kitchen queue is the bottleneck with ${input.activeOrders || input.ordersToday} active order(s) and ${input.packingQueueOpen} pack job(s) waiting downstream.`
        : `${input.packingQueueOpen} pack job(s) open while orders and KDS are active — run QC before handoff.`;

  return [
    {
      id: "fulfillment-command-flow",
      title: "Clear fulfillment pipeline bottleneck",
      reason: `Order → KDS → Packing chain is under pressure. ${bottleneckDetail}`,
      severity: flow.bottleneck === "stuck_orders" ? "critical" : "high",
      ownerRole,
      href: flow.bottleneckHref,
      status: "open",
      unblockCondition:
        "Intake, kitchen tickets, and outbound packing move without stuck orders or overdue handoffs.",
      priority: 3,
      ctaLabel:
        flow.bottleneck === "stuck_orders"
          ? "Open Order Hub"
          : flow.bottleneck === "kds"
            ? "Open kitchen"
            : "Open packing QC",
      tone: "urgent",
    },
  ];
}

export function mergeBriefingFulfillmentCommandFlowTopActions(
  generalActions: readonly OwnerDailyBriefingRankedAction[],
  flowActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  const withoutDuplicate = generalActions.filter(
    (action) => action.id !== "fulfillment-command-flow",
  );
  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [...flowActions, ...withoutDuplicate]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

export function briefingFulfillmentCommandFlowPolicySnapshot(): {
  policyId: typeof OWNER_DAILY_BRIEFING_FULFILLMENT_COMMAND_FLOW_ERA19_POLICY_ID;
  orderHubRoute: typeof FULFILLMENT_COMMAND_FLOW_ORDER_HUB_ROUTE;
} {
  return {
    policyId: OWNER_DAILY_BRIEFING_FULFILLMENT_COMMAND_FLOW_ERA19_POLICY_ID,
    orderHubRoute: FULFILLMENT_COMMAND_FLOW_ORDER_HUB_ROUTE,
  };
}
