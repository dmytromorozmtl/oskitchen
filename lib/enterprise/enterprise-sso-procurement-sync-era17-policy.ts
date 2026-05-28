/**
 * Enterprise SSO procurement sync — Evolution Era 17 Workstream A Cycle 6.
 *
 * Aligns buyer FAQ and security questionnaire with honest pilot_foundation SSO state.
 * Does NOT claim production SSO, pilot_ready, SOC2 Type II, or SCIM.
 */

import { ENTERPRISE_PROCUREMENT_PACK_DOC } from "@/lib/enterprise/enterprise-procurement-policy";
import { ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_POLICY_ID } from "@/lib/enterprise/enterprise-sso-idp-login-proof-era17-policy";
import { ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_POLICY_ID } from "@/lib/enterprise/enterprise-sso-operator-runbook-era17-policy";
import { ENTERPRISE_SSO_PILOT_READY_ERA17_POLICY_ID } from "@/lib/enterprise/enterprise-sso-pilot-ready-era17-policy";
import { ENTERPRISE_SSO_TENANT_MAPPING_ERA17_POLICY_ID } from "@/lib/enterprise/enterprise-sso-tenant-mapping-era17-policy";

export const ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_POLICY_ID =
  "era17-enterprise-sso-procurement-sync-v1" as const;

export const ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_DECISION_DATE = "2026-05-28" as const;

export const ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_EXTENDS_POLICIES = [
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_POLICY_ID,
  ENTERPRISE_SSO_TENANT_MAPPING_ERA17_POLICY_ID,
  ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_POLICY_ID,
  ENTERPRISE_SSO_PILOT_READY_ERA17_POLICY_ID,
] as const;

/** Buyer-facing SSO delivery — unchanged until Cycle 3 pilot_ready gate with IdP proof. */
export const ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_SSO_DELIVERY_STATUS =
  "pilot_foundation" as const;

export const ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_PROOF_STATUS =
  "procurement_sync_complete" as const;

export const ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_PACK_DOC =
  ENTERPRISE_PROCUREMENT_PACK_DOC;

/** Authoritative procurement answer strings — must appear in enterprise-procurement-pack.md. */
export const ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_REQUIRED_MARKERS = [
  ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_POLICY_ID,
  ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_SSO_DELIVERY_STATUS,
  ENTERPRISE_SSO_PILOT_READY_ERA17_POLICY_ID,
  "qualified pilot only",
  "not production SSO for all tenants",
  "awaiting_operator_proof",
  "awaiting_idp_login_proof",
  "pilot_foundation",
] as const;

export const ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_FAQ_SECTION =
  "Procurement FAQ" as const;

export const ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_QUESTIONNAIRE_SECTION =
  "Security questionnaire guide" as const;

export const ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_REVIEW_SECTION =
  "Era 17 SSO procurement sync (2026-05-28)" as const;

/** Buyer FAQ — SSO contract question (must be reflected in pack). */
export const ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_SSO_CONTRACT_FAQ =
  "Qualified SSO pilot may be offered as a milestone-limited engagement for one workspace with Okta or Entra ID test tenant — delivery status pilot_foundation, not production SSO for all tenants." as const;

/** Security questionnaire row guidance for SSO/SAML. */
export const ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_QUESTIONNAIRE_SSO_ANSWER =
  "Qualified pilot only — pilot_foundation (one workspace, Okta/Entra test tenant); not production SSO for all tenants; staging IdP login proof awaiting_operator_proof; pilot_ready gate awaiting_idp_login_proof until Cycle 2 artifact proof_passed." as const;

export const ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_GATE_REVIEW_SECTION =
  "Era 17 SSO pilot_ready gate (2026-05-28)" as const;

export const ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_FORBIDDEN_CLAIMS = [
  "production sso for all tenants",
  "pilot_ready without idp login artifact",
  "soc2 type ii",
  "scim provisioning is live",
  "sso is available for all customers",
] as const;

export const ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_CI_SCRIPTS = [
  "test:ci:enterprise-sso-procurement-sync-era17",
  "test:ci:enterprise-sso-procurement-sync-era17:cert",
] as const;

export const ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_UNIT_TESTS = [
  "tests/unit/enterprise-sso-procurement-sync-era17-policy.test.ts",
  "tests/unit/enterprise-sso-procurement-sync-era17-cert-live.test.ts",
] as const;

export const ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_CANONICAL_DOC_PATHS = [
  ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_PACK_DOC,
  "docs/enterprise-sso-r2-pilot-design.md",
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/implementation-backlog.md",
  "docs/era17-strategic-execution-map-2026-05-28.md",
] as const;

export const ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_BACKLOG_ID = "KOS-E17-041" as const;

export function enterpriseSsoProcurementPackCoversRequiredMarkers(packText: string): boolean {
  const lower = packText.toLowerCase();
  return ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_REQUIRED_MARKERS.every((marker) =>
    lower.includes(marker.toLowerCase()),
  );
}

export function enterpriseSsoProcurementPackAvoidsForbiddenClaims(packText: string): boolean {
  const negationPattern =
    /\b(not|no|without|forbidden|do not|does not|never|not_implemented|not_certified|not available)\b/i;

  for (const line of packText.split("\n")) {
    const lower = line.toLowerCase();
    if (negationPattern.test(lower)) continue;
    for (const claim of ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_FORBIDDEN_CLAIMS) {
      if (lower.includes(claim)) return false;
    }
  }
  return true;
}
