/**
 * Commercial pilot ops ↔ go-live bridge — Evolution Era 18 Workstream D Cycle 57.
 *
 * Cross-links platform implementations evidence to blocked tenant launch projects.
 * Does not fake GO/NO-GO PASS or bypass tenant RBAC.
 */

import { COMMERCIAL_PILOT_OPS_STATUS_ERA18_POLICY_ID } from "@/lib/commercial/commercial-pilot-ops-status-era18-policy";

export const COMMERCIAL_PILOT_OPS_GO_LIVE_BRIDGE_ERA18_POLICY_ID =
  "era18-commercial-pilot-ops-go-live-bridge-v1" as const;

export const COMMERCIAL_PILOT_OPS_GO_LIVE_BRIDGE_ERA18_EXTENDS_POLICIES = [
  COMMERCIAL_PILOT_OPS_STATUS_ERA18_POLICY_ID,
  "era18-platform-workspace-go-live-focus-v1",
] as const;

export const COMMERCIAL_PILOT_OPS_GO_LIVE_BRIDGE_ERA18_PROOF_STATUS =
  "commercial_pilot_ops_go_live_bridge_wired" as const;

export const COMMERCIAL_PILOT_OPS_GO_LIVE_BRIDGE_ERA18_BACKLOG_ID = "KOS-E18-057" as const;

export const COMMERCIAL_PILOT_BLOCKED_LAUNCHES_ANCHOR = "#blocked-pilot-launches" as const;

export function commercialPilotBlockedLaunchesHref(): string {
  return `/platform/implementations${COMMERCIAL_PILOT_BLOCKED_LAUNCHES_ANCHOR}`;
}
