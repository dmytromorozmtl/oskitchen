/**
 * Packing verify console focus — Evolution Era 18 Workstream G Cycle 34.
 *
 * Surfaces open QC sessions, failed scans, and pending allergen/label checks.
 * Does not claim regulatory compliance or hardware scanner certification.
 */

export const PACKING_VERIFY_FOCUS_ERA18_POLICY_ID = "era18-packing-verify-focus-v1" as const;

export const PACKING_VERIFY_FOCUS_ERA18_PROOF_STATUS = "packing_verify_focus_attention_wired" as const;

export const PACKING_VERIFY_FOCUS_ERA18_BACKLOG_ID = "KOS-E18-034" as const;

export type PackingVerifyAttentionTab = "scan" | "manual" | "active" | "issues";
