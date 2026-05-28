/**
 * Marketing claims governance — Evolution Era 7 Cycle 4.
 *
 * Aligns public marketing copy with `docs/feature-maturity-matrix.md` and
 * era policy locks (inventory, rewards, enterprise identity, integrations, KDS).
 */

export const MARKETING_CLAIMS_GOVERNANCE_POLICY_ID =
  "era7-marketing-claims-governance-v1" as const;

export const MARKETING_CLAIMS_MATRIX_DOC = "docs/feature-maturity-matrix.md" as const;

export const MARKETING_CLAIMS_REGISTRY_PATH = "config/marketing/claims-registry.json" as const;

/** Era policy IDs marketing must stay consistent with (documented cross-refs). */
export const MARKETING_CLAIMS_LINKED_POLICY_IDS = [
  "era8-pilot-preflight-claims-strict-v1",
  "era8-claims-registry-v1",
  "era4-pos-only-v1",
  "era5-pos-only-gtm-lock-v1",
  "era6-dual-ledger-gtm-lock-v1",
  "era6-enterprise-identity-roadmap-v1",
  "era4-procurement-honesty-v1",
  "era4-integration-honesty-v1",
  "era4-kds-staging-smoke-v1",
] as const;

/** Roots scanned by `npm run verify-claims`. */
export const MARKETING_CLAIMS_SCAN_ROOTS = [
  "components/marketing",
  "components/landing",
  "app/integrations",
  "lib/public-copy.ts",
] as const;

/**
 * Integration / hardware terms that may appear only with honest qualifiers
 * (beta, roadmap, not available, not integrated, etc.).
 */
export const MARKETING_CLAIMS_ROADMAP_TERMS = [
  { id: "uber_eats", patterns: [/uber\s*eats/i, /live\s+uber/i] },
  { id: "uber_direct", patterns: [/uber\s*direct/i, /live\s+courier/i] },
  { id: "doordash", patterns: [/doordash/i] },
  { id: "stripe_terminal", patterns: [/stripe\s*terminal/i] },
  { id: "sms", patterns: [/\bsms\b/i, /text\s+message/i] },
] as const;

export const MARKETING_CLAIMS_SAFE_QUALIFIER_PATTERN =
  /beta|roadmap|coming soon|partner|partner-gated|partner access|not available|not sold|not integrated|not claimed|not included|requires|placeholder|evaluation|only scope|not live today|do not market|non-production|future |evaluating|limitations:|approved uber|when you have|s:\s*false|p:\s*false/i;

/** Characters of surrounding copy checked for honest qualifiers. */
export const MARKETING_CLAIMS_CONTEXT_WINDOW = 200 as const;

/**
 * Phrases that must not appear in marketing surfaces even as negated headlines
 * (use matrix-qualified wording instead).
 */
export const MARKETING_CLAIMS_FORBIDDEN_PHRASES = [
  "production-certified hardware pos",
  "soc 2 type ii certified",
  "enterprise sso included",
  "unified cross-channel inventory depletion",
  "storefront orders deplete stock",
  "unified gift card balance across channels",
  "rush-hour kds certified",
  "live doordash integration",
  "live uber eats sync",
  "toast-class kds at rush hour",
] as const;

export const MARKETING_CLAIMS_CI_SCRIPTS = [
  "verify-claims",
  "test:ci:marketing-claims-governance",
  "test:ci:marketing-claims-governance:cert",
] as const;

export const MARKETING_CLAIMS_UNIT_TESTS = [
  "tests/unit/marketing-claims-governance-policy.test.ts",
  "tests/unit/marketing-claims-governance-ci-live.test.ts",
] as const;

export const MARKETING_CLAIMS_CANONICAL_DOC_PATHS = [
  "docs/commercial-pilot-runbook.md",
  "docs/ci-e2e-tier-matrix.md",
] as const;

export type MarketingClaimViolation = {
  kind: "forbidden" | "roadmap_unqualified";
  termId: string;
  match: string;
  sourceLabel: string;
  context: string;
};

export function contextHasSafeQualifier(context: string): boolean {
  return MARKETING_CLAIMS_SAFE_QUALIFIER_PATTERN.test(context);
}

export function findForbiddenPhraseViolations(
  combinedText: string,
  sourceLabel = "marketing",
): MarketingClaimViolation[] {
  const lower = combinedText.toLowerCase();
  const violations: MarketingClaimViolation[] = [];

  for (const phrase of MARKETING_CLAIMS_FORBIDDEN_PHRASES) {
    let searchFrom = 0;
    while (searchFrom < lower.length) {
      const idx = lower.indexOf(phrase, searchFrom);
      if (idx === -1) break;
      const match = combinedText.slice(idx, idx + phrase.length);
      violations.push({
        kind: "forbidden",
        termId: phrase,
        match,
        sourceLabel,
        context: combinedText.slice(
          Math.max(0, idx - MARKETING_CLAIMS_CONTEXT_WINDOW),
          idx + phrase.length + MARKETING_CLAIMS_CONTEXT_WINDOW,
        ),
      });
      searchFrom = idx + phrase.length;
    }
  }

  return violations;
}

export function findRoadmapTermViolations(
  combinedText: string,
  sourceLabel = "marketing",
): MarketingClaimViolation[] {
  const violations: MarketingClaimViolation[] = [];

  for (const term of MARKETING_CLAIMS_ROADMAP_TERMS) {
    for (const pattern of term.patterns) {
      const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
      const re = new RegExp(pattern.source, flags);
      let match: RegExpExecArray | null;
      while ((match = re.exec(combinedText)) !== null) {
        const idx = match.index;
        const context = combinedText.slice(
          Math.max(0, idx - MARKETING_CLAIMS_CONTEXT_WINDOW),
          idx + match[0].length + MARKETING_CLAIMS_CONTEXT_WINDOW,
        );
        if (!contextHasSafeQualifier(context)) {
          violations.push({
            kind: "roadmap_unqualified",
            termId: term.id,
            match: match[0],
            sourceLabel,
            context,
          });
        }
      }
    }
  }

  return violations;
}

export function scanMarketingText(
  combinedText: string,
  sourceLabel = "marketing",
): MarketingClaimViolation[] {
  return [
    ...findForbiddenPhraseViolations(combinedText, sourceLabel),
    ...findRoadmapTermViolations(combinedText, sourceLabel),
  ];
}

export function exitCodeForMarketingClaimViolations(
  violations: readonly MarketingClaimViolation[],
  strictRoadmapTerms: boolean,
): number {
  if (violations.some((v) => v.kind === "forbidden")) return 1;
  if (strictRoadmapTerms && violations.some((v) => v.kind === "roadmap_unqualified")) return 1;
  return 0;
}
