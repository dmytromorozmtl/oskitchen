/**
 * POS manager override clarity — Evolution Era 19 Workstream E Cycle 27.
 *
 * Override checklist, review hero, and tablet-friendly manager discount flow.
 * No manager PIN flow, Toast override parity, or offline POS claims.
 */

import { POS_MANAGER_DISCOUNT_UI_ERA18_POLICY_ID } from "@/lib/pos/pos-manager-discount-ui-era18-policy";

export const POS_MANAGER_OVERRIDE_CLARITY_ERA19_POLICY_ID =
  "era19-pos-manager-override-clarity-v1" as const;

export const POS_MANAGER_OVERRIDE_CLARITY_ERA19_EXTENDS_POLICIES = [
  POS_MANAGER_DISCOUNT_UI_ERA18_POLICY_ID,
] as const;

export const POS_MANAGER_OVERRIDE_CLARITY_ERA19_PROOF_STATUS =
  "pos_manager_override_clarity_wired" as const;

export const POS_MANAGER_OVERRIDE_CLARITY_ERA19_BACKLOG_ID = "KOS-E19-027" as const;

export const POS_MANAGER_OVERRIDE_ANCHOR = "pos-manager-override" as const;

export const POS_MANAGER_OVERRIDE_PERMISSION = "pos.discount.apply" as const;
