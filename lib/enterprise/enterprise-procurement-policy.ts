/**
 * Enterprise procurement honesty policy — Evolution Era 4 Cycle 8.
 *
 * Canonical buyer-facing pack: docs/enterprise-procurement-pack.md
 * Release ops companion: docs/devops-release-enterprise-readiness.md
 */

export const ENTERPRISE_PROCUREMENT_POLICY_ID = "era4-procurement-honesty-v1" as const;

export const ENTERPRISE_PROCUREMENT_PACK_DOC = "docs/enterprise-procurement-pack.md" as const;

/** Required H2 sections in the procurement pack (grep-friendly anchors). */
export const ENTERPRISE_PROCUREMENT_REQUIRED_SECTIONS = [
  "Current posture (honest summary)",
  "SSO and SAML roadmap",
  "SCIM roadmap",
  "SOC 2 readiness roadmap",
  "Audit logging and export",
  "Tenant isolation",
  "Data retention and privacy",
  "Backup, restore, and availability",
  "Incident response",
  "Security questionnaire guide",
  "Procurement FAQ",
  "What we do not claim today",
] as const;

/**
 * Phrases that must NOT appear as affirmative product claims in the procurement pack.
 * Roadmap sections may say these capabilities are not available today.
 */
export const ENTERPRISE_PROCUREMENT_FORBIDDEN_AFFIRMATIVE_CLAIMS = [
  /SOC\s*2\s+(Type\s*II\s+)?certified/i,
  /SOC\s*2\s+compliant\s+today/i,
  /\bSSO\s+is\s+available\b/i,
  /\bSCIM\s+provisioning\s+is\s+live\b/i,
  /\bHIPAA\s+certified\b/i,
  /ISO\s*27001\s+certified/i,
  /FedRAMP\s+authorized/i,
] as const;

export const ENTERPRISE_PROCUREMENT_CI_SCRIPTS = [
  "test:ci:enterprise-procurement",
  "test:ci:enterprise-procurement:cert",
] as const;

export const ENTERPRISE_PROCUREMENT_EVIDENCE_ANCHORS = [
  "lib/permissions/mutation-access.ts",
  "lib/scope/require-tenant-actor.ts",
  "services/audit/audit-service.ts",
  "app/api/internal/dsr/export/route.ts",
  "tests/unit/public-api-tenant-isolation.test.ts",
  "tests/unit/audit-center-security-cert-live.test.ts",
] as const;
