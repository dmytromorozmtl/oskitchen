/**
 * Blueprint P3-138 — External comms policy (no claims without proof; PM→Legal→CEO).
 *
 * @see docs/external-comms-policy-pm.md
 */

export const EXTERNAL_COMMS_P3_138_POLICY_ID = "external-comms-p3-138-v1" as const;

export const EXTERNAL_COMMS_P3_138_DOC = "docs/external-comms-policy-pm.md" as const;

export const EXTERNAL_COMMS_P3_138_ARTIFACT =
  "artifacts/external-comms-policy-pm-registry.json" as const;

export const EXTERNAL_COMMS_P3_138_AUDIT_SCRIPT =
  "scripts/audit-external-comms-p3-138.ts" as const;

export const EXTERNAL_COMMS_P3_138_NPM_SCRIPT = "audit:external-comms-p3-138" as const;

export const EXTERNAL_COMMS_P3_138_UNIT_TEST =
  "tests/unit/external-comms-p3-138.test.ts" as const;

export const EXTERNAL_COMMS_P3_138_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const EXTERNAL_COMMS_P3_138_APPROVAL_CHAIN = ["PM", "Legal", "CEO"] as const;

export const EXTERNAL_COMMS_P3_138_APPROVAL_FLOW = "PM → Legal → CEO" as const;

export const EXTERNAL_COMMS_P3_138_PROOF_RULE = "no claims without proof" as const;

export const EXTERNAL_COMMS_P3_138_CHANNEL_IDS = [
  "press_release",
  "blog_post",
  "social_media",
  "partner_announcement",
  "customer_email",
  "investor_update",
] as const;

export type ExternalCommsP3_138ChannelId = (typeof EXTERNAL_COMMS_P3_138_CHANNEL_IDS)[number];

export const EXTERNAL_COMMS_P3_138_IMPLEMENTATION_REFS = {
  forbiddenClaimsAudit: "forbidden-claims-audit-p1-71-v1",
  forbiddenClaimsTraining: "forbidden-claims-training-p1-84-v1",
  verifyClaims: "verify-claims",
} as const;

export const EXTERNAL_COMMS_P3_138_LIVE_AUDIT_NPM =
  "audit:forbidden-claims-marketing-pages" as const;

export const EXTERNAL_COMMS_P3_138_RELATED_DOCS = [
  "docs/forbidden-claims-audit.md",
  "docs/forbidden-claims-training.md",
  "docs/sales-limitation-sheet.md",
  "docs/sales-safe-claims-registry.md",
  "config/marketing/claims-registry.json",
  "lib/marketing/forbidden-claims-audit-policy.ts",
] as const;

export const EXTERNAL_COMMS_P3_138_HONESTY_MARKERS = [
  "no claims without proof",
  "0 signed LOIs",
  "BETA",
  "template_only",
  "baseline",
] as const;

export const EXTERNAL_COMMS_P3_138_WIRING_PATHS = [
  EXTERNAL_COMMS_P3_138_DOC,
  "lib/pm/external-comms-p3-138-policy.ts",
  "lib/pm/external-comms-p3-138-operations.ts",
  "lib/pm/external-comms-p3-138-audit.ts",
  EXTERNAL_COMMS_P3_138_ARTIFACT,
  EXTERNAL_COMMS_P3_138_UNIT_TEST,
] as const;
