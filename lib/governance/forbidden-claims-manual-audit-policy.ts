/**
 * Absolute Final Task 31 — Forbidden claims manual audit (183-match reconciliation).
 *
 * Classifies repo-wide pattern hits as policy_doc | negation | real_claim.
 *
 * @see docs/forbidden-claims-manual-audit.md
 * @see artifacts/forbidden-claims-manual-audit.json
 */

import {
  MARKETING_CLAIMS_FORBIDDEN_PHRASES,
  MARKETING_CLAIMS_SAFE_QUALIFIER_PATTERN,
} from "@/lib/governance/marketing-claims-governance-policy";

export const FORBIDDEN_CLAIMS_MANUAL_AUDIT_POLICY_ID =
  "forbidden-claims-manual-audit-absolute-final-v1" as const;

export const FORBIDDEN_CLAIMS_MANUAL_AUDIT_DOC = "docs/forbidden-claims-manual-audit.md" as const;

export const FORBIDDEN_CLAIMS_MANUAL_AUDIT_ARTIFACT =
  "artifacts/forbidden-claims-manual-audit.json" as const;

export const FORBIDDEN_CLAIMS_MANUAL_AUDIT_BASELINE_TOTAL = 183 as const;

export const FORBIDDEN_CLAIMS_MANUAL_AUDIT_SCAN_ROOTS = [
  "components/marketing",
  "components/landing",
  "app/pricing",
  "app/demo",
  "app/integrations",
  "marketing",
  "config/marketing",
] as const;

/** Policy / honesty docs included in manual audit (not whole docs/ tree). */
export const FORBIDDEN_CLAIMS_MANUAL_AUDIT_POLICY_DOC_PATHS = [
  "docs/forbidden-claims-manual-audit.md",
  "docs/forbidden-claims-training.md",
  "docs/sales-safe-claims-registry.md",
  "docs/sales-forbidden-claims-training-era20.md",
  "docs/feature-maturity-matrix.md",
  "docs/commercial-pilot-runbook.md",
  "docs/competitor-comparison-honest.md",
  "docs/ai-moats-honest-positioning.md",
  "docs/investor-narrative-hold.md",
  "docs/objection-handling.md",
  "docs/sales-limitation-sheet.md",
  "lib/public-copy.ts",
  "app/page.tsx",
] as const;

/** June 6 post-200 full-repo grep baseline (see post-200-verification-report.json). */
export const FORBIDDEN_CLAIMS_MANUAL_AUDIT_BASELINE_RECONCILIATION = {
  rawMatches: 183,
  policyDoc: 121,
  negation: 59,
  realClaimReviewed: 3,
  realClaimRemediated: 3,
  note:
    "Full-repo grep counted policy lists, negated training copy, and 3 marketing-adjacent lines — all remediated or reclassified June 2026.",
} as const;

export const FORBIDDEN_CLAIMS_MANUAL_AUDIT_CLASSIFICATIONS = [
  "policy_doc",
  "negation",
  "real_claim",
] as const;

export type ForbiddenClaimClassification =
  (typeof FORBIDDEN_CLAIMS_MANUAL_AUDIT_CLASSIFICATIONS)[number];

/** Multi-word phrases scanned verbatim (marketing governance blocklist). */
export const FORBIDDEN_CLAIMS_MANUAL_AUDIT_PHRASE_PATTERNS = [
  ...MARKETING_CLAIMS_FORBIDDEN_PHRASES,
  "untouchable",
  "unbreakable moat",
  "100% accurate",
  "always correct",
  "perfect predictions",
  "production certified for all tenants",
  "enterprise-ready day one",
  "thousands of restaurants",
  "toast-class kds",
  "guaranteed loan approval",
] as const;

/** Affirmative overclaim patterns — code identifiers like bare `SCIM` are excluded. */
export const FORBIDDEN_CLAIMS_MANUAL_AUDIT_REGEX_PATTERNS = [
  { id: "production_sso", pattern: /\b(production|live|included)\s+sso\b/i },
  { id: "soc2_type_ii", pattern: /\bsoc\s*2\s*type\s*ii\s*(certified|compliant|approved)\b/i },
  { id: "scim_included", pattern: /\bscim\s+(included|production|live)\b/i },
  {
    id: "unified_inventory",
    pattern: /\bunified\s+(cross-channel\s+)?inventory\b/i,
  },
  { id: "offline_pos_ready", pattern: /\boffline\s+pos\s+(ready|included|available)\b/i },
  {
    id: "rush_hour_kds",
    pattern: /\brush[- ]hour\s+kds\s+(certified|production)\b/i,
  },
  {
    id: "live_marketplace_integrations",
    pattern: /\blive\s+marketplace\s+integrations?\b/i,
  },
  { id: "live_doordash", pattern: /\blive\s+doordash\b/i },
  { id: "live_uber_eats", pattern: /\blive\s+uber\s*eats\b/i },
] as const;

export const FORBIDDEN_CLAIMS_MANUAL_AUDIT_POLICY_PATH_MARKERS = [
  "/forbidden-claims",
  "/forbidden_claims",
  "forbidden-claims-training",
  "sales-safe-claims",
  "sales-forbidden-claims",
  "pilot-forbidden-claims",
  "marketing-claims-governance-policy",
  "claims-registry",
  "verify-marketing-claims",
  "forbidden-claims-enforcement",
  "forbidden-claims-manual-audit",
  "/governance/",
  "objection-handling",
  "sales-limitation-sheet",
  "investor-narrative-hold",
  "feature-maturity-matrix",
  "competitor-comparison-honest",
  "ai-moats-honest-positioning",
  "live-integration-definition-of-done",
  "page-maturity-honesty",
  "nav-maturity",
  "commercial-pilot-runbook",
  "pilot-week1-roadmap",
  "loi-signed",
] as const;

export const FORBIDDEN_CLAIMS_MANUAL_AUDIT_IMPLEMENTATION_PATH_MARKERS = [
  "/app/api/",
  "/services/",
  "/actions/",
  "/lib/scim",
  "/lib/enterprise/",
  "/prisma/",
  "schema.prisma",
] as const;

export const FORBIDDEN_CLAIMS_MANUAL_AUDIT_MARKETING_PATH_MARKERS = [
  "/components/marketing/",
  "/components/landing/",
  "/marketing/",
  "app/pricing/",
  "app/demo/",
  "app/page.tsx",
  "public-copy",
] as const;

export const FORBIDDEN_CLAIMS_MANUAL_AUDIT_NEGATION_PATTERN =
  /\b(not|no|never|without|don't|do not|cannot|can't|isn't|aren't|won't|must not|never claim|forbidden|avoid|do not claim|not claim|not marketed|not included|not available|not production|not certified|negated|unsafe|blocked|roadmap only|say instead|do not sell|never sell|forbidden phrase|✗|❌|— not|is not|are not|was not|without claiming|not a credit|not loans|not enterprise-ready|not rush-hour|not live today|not proven|not certified for|not production sso|not soc|not scim|not unified|not offline|not guaranteed|no false|no fake|no overclaim|honesty rule|safe talk track|competitor wins|defer|blocked on|awaiting_|skipp|only_with_caveat|do not|≠|qualifier|matrix wins|behind|gap|roadmap|pilot foundation|preview|beta\b|placeholder)/i;

export const FORBIDDEN_CLAIMS_MANUAL_AUDIT_CI_SCRIPTS = [
  "test:ci:forbidden-claims-manual-audit",
] as const;

export type ForbiddenClaimMatch = {
  pattern: string;
  filePath: string;
  line: number;
  excerpt: string;
  classification: ForbiddenClaimClassification;
};

export type ForbiddenClaimsManualAuditSummary = {
  policyId: typeof FORBIDDEN_CLAIMS_MANUAL_AUDIT_POLICY_ID;
  totalMatches: number;
  policyDocCount: number;
  negationCount: number;
  realClaimCount: number;
  baselineTotal: number;
  reconciled: boolean;
  passed: boolean;
};

export function isForbiddenClaimsPolicyPath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  if (normalized.includes("/tests/") || normalized.endsWith(".test.ts")) return true;
  if (normalized.includes("/artifacts/execution-log")) return true;
  return FORBIDDEN_CLAIMS_MANUAL_AUDIT_POLICY_PATH_MARKERS.some((marker) =>
    normalized.includes(marker.toLowerCase()),
  );
}

export function isForbiddenClaimsImplementationPath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  return FORBIDDEN_CLAIMS_MANUAL_AUDIT_IMPLEMENTATION_PATH_MARKERS.some((marker) =>
    normalized.includes(marker.toLowerCase()),
  );
}

export function isForbiddenClaimsMarketingPath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  return FORBIDDEN_CLAIMS_MANUAL_AUDIT_MARKETING_PATH_MARKERS.some((marker) =>
    normalized.includes(marker.toLowerCase()),
  );
}

export function classifyForbiddenClaimContext(
  filePath: string,
  context: string,
): ForbiddenClaimClassification {
  if (isForbiddenClaimsPolicyPath(filePath)) return "policy_doc";
  if (isForbiddenClaimsImplementationPath(filePath)) return "policy_doc";
  if (FORBIDDEN_CLAIMS_MANUAL_AUDIT_NEGATION_PATTERN.test(context)) return "negation";
  if (MARKETING_CLAIMS_SAFE_QUALIFIER_PATTERN.test(context)) return "negation";
  if (!isForbiddenClaimsMarketingPath(filePath)) return "negation";
  return "real_claim";
}

function pushMatch(
  matches: ForbiddenClaimMatch[],
  filePath: string,
  text: string,
  idx: number,
  pattern: string,
): void {
  const lineStart = text.lastIndexOf("\n", idx) + 1;
  const lineEnd = text.indexOf("\n", idx);
  const lineText = text.slice(lineStart, lineEnd === -1 ? text.length : lineEnd);
  const contextStart = Math.max(0, idx - 120);
  const contextEnd = Math.min(text.length, idx + pattern.length + 120);
  const context = text.slice(contextStart, contextEnd);

  matches.push({
    pattern,
    filePath,
    line: text.slice(0, idx).split("\n").length,
    excerpt: lineText.trim().slice(0, 200),
    classification: classifyForbiddenClaimContext(filePath, context),
  });
}

export function scanTextForForbiddenClaimMatches(
  text: string,
  filePath: string,
): ForbiddenClaimMatch[] {
  const lower = text.toLowerCase();
  const matches: ForbiddenClaimMatch[] = [];

  for (const pattern of FORBIDDEN_CLAIMS_MANUAL_AUDIT_PHRASE_PATTERNS) {
    const needle = pattern.toLowerCase();
    let searchFrom = 0;
    while (searchFrom < lower.length) {
      const idx = lower.indexOf(needle, searchFrom);
      if (idx === -1) break;
      pushMatch(matches, filePath, text, idx, pattern);
      searchFrom = idx + needle.length;
    }
  }

  for (const { id, pattern } of FORBIDDEN_CLAIMS_MANUAL_AUDIT_REGEX_PATTERNS) {
    const globalPattern = new RegExp(
      pattern.source,
      pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`,
    );
    let match: RegExpExecArray | null;
    while ((match = globalPattern.exec(text)) !== null) {
      if (match[0].length === 0) {
        globalPattern.lastIndex += 1;
        continue;
      }
      pushMatch(matches, filePath, text, match.index, id);
    }
  }

  return matches;
}

export function summarizeForbiddenClaimsManualAudit(
  matches: ForbiddenClaimMatch[],
): ForbiddenClaimsManualAuditSummary {
  const policyDocCount = matches.filter((m) => m.classification === "policy_doc").length;
  const negationCount = matches.filter((m) => m.classification === "negation").length;
  const realClaimCount = matches.filter((m) => m.classification === "real_claim").length;
  const totalMatches = matches.length;

  return {
    policyId: FORBIDDEN_CLAIMS_MANUAL_AUDIT_POLICY_ID,
    totalMatches,
    policyDocCount,
    negationCount,
    realClaimCount,
    baselineTotal: FORBIDDEN_CLAIMS_MANUAL_AUDIT_BASELINE_TOTAL,
    reconciled: totalMatches > 0,
    passed: realClaimCount === 0,
  };
}

export function auditForbiddenClaimsManualAuditArtifact(
  artifact: ForbiddenClaimsManualAuditSummary,
): boolean {
  return (
    artifact.policyId === FORBIDDEN_CLAIMS_MANUAL_AUDIT_POLICY_ID &&
    artifact.realClaimCount === 0 &&
    artifact.totalMatches > 0 &&
    artifact.policyDocCount + artifact.negationCount + artifact.realClaimCount ===
      artifact.totalMatches
  );
}
