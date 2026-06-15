/**
 * Packing QC clarity — Evolution Era 19 Workstream E Cycle 32.
 *
 * 4-step QC checklist on the packing command center.
 * Does not claim hardware scanner certification or regulatory label compliance.
 */

import { PACKING_FOCUS_ERA18_POLICY_ID } from "@/lib/packing/packing-focus-era18-policy";
import { PACKING_VERIFY_FOCUS_ERA18_POLICY_ID } from "@/lib/packing-verification/packing-verify-focus-era18-policy";

export const PACKING_QC_CLARITY_ERA19_POLICY_ID = "era19-packing-qc-clarity-v1" as const;

export const PACKING_QC_CLARITY_ERA19_BACKLOG_ID = "KOS-E19-032" as const;

export const PACKING_QC_CLARITY_ERA19_PROOF_STATUS = "packing_qc_clarity_wired" as const;

export const PACKING_QC_CLARITY_ERA19_EXTENDS_POLICIES = [
  PACKING_FOCUS_ERA18_POLICY_ID,
  PACKING_VERIFY_FOCUS_ERA18_POLICY_ID,
] as const;

export const PACKING_QC_CLARITY_ANCHOR = "packing-qc-clarity" as const;

export const PACKING_QC_CLARITY_ROUTE = "/dashboard/packing" as const;
