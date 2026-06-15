import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-21 — discovery call script policy (30-min qualification call).
 *
 * @see docs/discovery-call-script.md
 * @see docs/icp-definition-final.md
 */

export const DISCOVERY_CALL_SCRIPT_POLICY_ID = "discovery-call-script-mkt21-v1" as const;

export const DISCOVERY_CALL_SCRIPT_DOC = "docs/discovery-call-script.md" as const;

export const DISCOVERY_CALL_DURATION_MIN = 30 as const;

export const DISCOVERY_CALL_BLOCKS = [
  { id: "frame", label: "Frame + agenda", durationMin: 3 },
  { id: "current-state", label: "Current state", durationMin: 10 },
  { id: "qualification", label: "ICP qualification", durationMin: 10 },
  { id: "scope", label: "Honest scope check", durationMin: 4 },
  { id: "next-step", label: "Next step", durationMin: 3 },
] as const;

export const DISCOVERY_CALL_ICP_ADVANCE_THRESHOLD = 8 as const;

export const DISCOVERY_CALL_LOI_CANDIDATE_THRESHOLD = 12 as const;

export const DISCOVERY_CALL_MAX_ICP_SCORE = 14 as const;

export const DISCOVERY_CALL_ONE_LINE_OPENER =
  "Before I show you anything — I want to understand how orders move from your channels to the kitchen today, and whether our honest beta scope matches what you actually need." as const;

export const DISCOVERY_CALL_QUALIFICATION_QUESTIONS = [
  "Do you own fulfillment in a licensed kitchen?",
  "How many locations are in pilot scope?",
  "Can the owner or ops lead join weekly pilot syncs?",
  "Is order hub plus kitchen path the core need?",
  "Are BETA and SKIPPED integration labels acceptable?",
  "Any SSO, SOC 2, or SCIM requirement in 90 days?",
  "Expectation for live aggregator ops day one?",
] as const;

export const DISCOVERY_CALL_PRIMARY_CTA = {
  label: "Book follow-up demo",
  href: "/book-demo?utm_source=discovery&utm_medium=call&utm_campaign=discovery-script-mkt21",
} as const;

export const DISCOVERY_CALL_FORBIDDEN_CLAIMS = [
  "thousands of customers",
  "all integrations live",
  "guaranteed savings",
  "guaranteed roi",
  "replace toast overnight",
  "uber eats official partner",
  "doordash official partner",
  "soc 2 certified",
  "hipaa certified",
  "untouchable ai moat",
] as const;

export const DISCOVERY_CALL_DOC_REQUIRED_HEADINGS = [
  "One-line opener",
  "Call structure (30 minutes)",
  "Block 3 — ICP qualification",
  "Forbidden claims",
  "Pre-call checklist",
] as const;

export type DiscoveryCallScriptDocAudit = {
  docPath: typeof DISCOVERY_CALL_SCRIPT_DOC;
  missingHeadings: string[];
  blockCount: number;
  totalDurationMin: number;
  passed: boolean;
};

export function totalDiscoveryCallDurationMin(): number {
  return DISCOVERY_CALL_BLOCKS.reduce((sum, block) => sum + block.durationMin, 0);
}

export function scoreDiscoveryCallIcpAction(score: number): "loi" | "demo" | "pass" {
  if (score >= DISCOVERY_CALL_LOI_CANDIDATE_THRESHOLD) return "loi";
  if (score >= DISCOVERY_CALL_ICP_ADVANCE_THRESHOLD) return "demo";
  return "pass";
}

export function auditDiscoveryCallScriptDoc(root = process.cwd()): DiscoveryCallScriptDocAudit {
  const source = readFileSync(join(root, DISCOVERY_CALL_SCRIPT_DOC), "utf8");
  const missingHeadings = DISCOVERY_CALL_DOC_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );

  return {
    docPath: DISCOVERY_CALL_SCRIPT_DOC,
    missingHeadings,
    blockCount: DISCOVERY_CALL_BLOCKS.length,
    totalDurationMin: totalDiscoveryCallDurationMin(),
    passed: missingHeadings.length === 0,
  };
}

export type DiscoveryCallScriptLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintDiscoveryCallScriptCopy(source: string): DiscoveryCallScriptLint {
  const lower = source.toLowerCase();
  const forbiddenHits = DISCOVERY_CALL_FORBIDDEN_CLAIMS.filter((claim) =>
    lower.includes(claim),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}
