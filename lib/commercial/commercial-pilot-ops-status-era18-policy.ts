/**
 * Commercial pilot ops status — Evolution Era 18 Workstream D Cycle 52.
 *
 * Honest GO/NO-GO + P0 staging proof visibility for platform ops.
 * Does NOT fake GO, proof_passed, or paid pilot execution.
 */

import { PILOT_GONOGO_ERA17_POLICY_ID } from "@/lib/commercial/pilot-gono-go-era17-policy";
import { P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";

export const COMMERCIAL_PILOT_OPS_STATUS_ERA18_POLICY_ID =
  "era18-commercial-pilot-ops-status-v1" as const;

export const COMMERCIAL_PILOT_OPS_STATUS_ERA18_EXTENDS_POLICIES = [
  PILOT_GONOGO_ERA17_POLICY_ID,
  P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID,
  "era18-implementation-pilot-readiness-focus-v1",
] as const;

export const COMMERCIAL_PILOT_OPS_STATUS_ERA18_PROOF_STATUS =
  "commercial_pilot_ops_status_panel_wired" as const;

export const COMMERCIAL_PILOT_OPS_STATUS_ERA18_BACKLOG_ID = "KOS-E18-052" as const;

export const COMMERCIAL_PILOT_OPS_STATUS_PLATFORM_ROUTE =
  "/platform/implementations" as const;

export const COMMERCIAL_PILOT_GONOGO_ANCHOR = "#pilot-gono-go" as const;

export const COMMERCIAL_PILOT_P0_STAGING_ANCHOR = "#p0-staging-proof" as const;

export const COMMERCIAL_PILOT_OPS_P0_CHECKLIST_DOC =
  "docs/era18-p0-staging-proof-ops-checklist.md" as const;
