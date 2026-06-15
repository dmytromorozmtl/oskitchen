/**
 * Era 73 — First design partner LOI signed (P0 critical path #73).
 *
 * @see docs/loi-signed.md
 * @see docs/loi-design-partner-template.md
 */

export const LOI_SIGNED_ERA73_POLICY_ID = "era73-first-loi-signed-v1" as const;

export const LOI_SIGNED_ERA73_DOC = "docs/loi-signed.md" as const;

export const LOI_SIGNED_ERA73_LOI_SKU = "LOI-DP-001" as const;

export const LOI_SIGNED_ERA73_TEMPLATE_DOC = "docs/loi-design-partner-template.md" as const;

export const LOI_SIGNED_ERA73_WALKTHROUGH_DOC = "docs/loi-template-walkthrough.md" as const;

export const LOI_SIGNED_ERA73_PRESS_RELEASE_DOC =
  "docs/press-release-first-design-partner.md" as const;

export const LOI_SIGNED_ERA73_CI_SCRIPTS = [
  "test:ci:loi-signed-era73",
  "test:ci:loi-signed-era73:cert",
] as const;

export const LOI_SIGNED_ERA73_DOC_REQUIRED_HEADINGS = [
  "Signed LOI record",
  "Design partner profile",
  "Countersignature evidence",
  "Exhibit A — modules in scope",
  "Exhibit B — engagement cadence",
  "Exhibit C — qualitative success signals",
  "Post-signature ops",
  "Honest limitations",
  "Related docs",
] as const;

export const LOI_SIGNED_ERA73_FORBIDDEN_CLAIMS = [
  "thousands of restaurants",
  "production certified for all tenants",
  "all integrations are live",
  "soc 2 certified",
  "enterprise sso included",
  "binding production sla",
  "paid pilot converted",
  "series a",
] as const;

export const LOI_SIGNED_ERA73_POST_SIGNATURE_STEPS = [
  "Archive countersigned PDF in legal evidence folder",
  "PILOT_GONOGO_CUSTOMER_NAME",
  "PILOT_GONOGO_LOI_SIGNED_DATE",
  "riverbend-commissary",
  "Week 0 kickoff",
  "Do **not** publish press release",
] as const;
