/**
 * Briefing fulfillment command flow — Evolution Era 19 Convergence Cycle 38.
 *
 * Unifies storefront order → KDS → packing deep-links on Today when the full
 * pipeline is under pressure. No fake SLA or auto-routing claims.
 */

import { OWNER_DAILY_BRIEFING_MANAGER_KDS_ERA19_POLICY_ID } from "@/lib/briefing/owner-daily-briefing-manager-kds-era19-policy";
import { OWNER_DAILY_BRIEFING_OWNER_KDS_ERA19_POLICY_ID } from "@/lib/briefing/owner-daily-briefing-owner-kds-era19-policy";
import { PACKING_QC_CLARITY_ERA19_POLICY_ID } from "@/lib/packing/packing-qc-clarity-era19-policy";

export const OWNER_DAILY_BRIEFING_FULFILLMENT_COMMAND_FLOW_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-fulfillment-command-flow-v1" as const;

export const OWNER_DAILY_BRIEFING_FULFILLMENT_COMMAND_FLOW_ERA19_EXTENDS_POLICIES = [
  OWNER_DAILY_BRIEFING_OWNER_KDS_ERA19_POLICY_ID,
  OWNER_DAILY_BRIEFING_MANAGER_KDS_ERA19_POLICY_ID,
  PACKING_QC_CLARITY_ERA19_POLICY_ID,
] as const;

export const OWNER_DAILY_BRIEFING_FULFILLMENT_COMMAND_FLOW_ERA19_BACKLOG_ID =
  "KOS-E19-038" as const;

export const BRIEFING_FULFILLMENT_COMMAND_FLOW_TILE_ID = "fulfillment-command-flow" as const;

export const FULFILLMENT_COMMAND_FLOW_ORDER_HUB_ROUTE = "/dashboard/order-hub" as const;

export const FULFILLMENT_COMMAND_FLOW_ORDERS_ROUTE = "/dashboard/orders" as const;
