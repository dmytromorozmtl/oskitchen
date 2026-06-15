/**
 * Nav maturity sweep Era 17 summary artifact builder.
 */

import { runNavMaturitySweepEra17Audit } from "@/lib/navigation/nav-maturity-sweep-era17-audit";
import {
  NAV_MATURITY_SWEEP_ERA17_NEW_PREVIEW_PREFIXES,
  NAV_MATURITY_SWEEP_ERA17_POLICY_ID,
  NAV_MATURITY_SWEEP_ERA17_PROOF_STATUS,
} from "@/lib/navigation/nav-maturity-sweep-era17-policy";

export const NAV_MATURITY_SWEEP_ERA17_SUMMARY_VERSION =
  "era17-nav-maturity-sweep-v1" as const;

export type NavMaturitySweepEra17ProofStatus =
  | "proof_passed"
  | "proof_failed"
  | "proof_skipped_cert_failed"
  | "sweep_recertified_awaiting_product_signoff";

export type NavMaturitySweepEra17Summary = {
  version: typeof NAV_MATURITY_SWEEP_ERA17_SUMMARY_VERSION;
  policyId: typeof NAV_MATURITY_SWEEP_ERA17_POLICY_ID;
  runAt: string;
  certPassed: boolean;
  auditPassed: boolean;
  navMaturityProofStatus: NavMaturitySweepEra17ProofStatus;
  era17PreviewRoutesClassified: number;
  focusedNavGapCount: number;
  era17RuleGapCount: number;
  era17HonestyGapCount: number;
  productSignoffEmail: string | null;
  readinessDecision: "READY" | "NOT_READY";
};

export function resolveNavMaturitySweepEra17ProofStatus(input: {
  certPassed: boolean;
  auditPassed: boolean;
  productSignoffEmail?: string | null;
}): NavMaturitySweepEra17ProofStatus {
  if (!input.certPassed || !input.auditPassed) return "proof_skipped_cert_failed";
  if (input.productSignoffEmail?.trim()) return "proof_passed";
  return "sweep_recertified_awaiting_product_signoff";
}

export function buildNavMaturitySweepEra17Summary(input: {
  certPassed: boolean;
  productSignoffEmail?: string | null;
  runAt?: Date;
}): NavMaturitySweepEra17Summary {
  const audit = runNavMaturitySweepEra17Audit();
  const navMaturityProofStatus = resolveNavMaturitySweepEra17ProofStatus({
    certPassed: input.certPassed,
    auditPassed: audit.passed,
    productSignoffEmail: input.productSignoffEmail,
  });

  return {
    version: NAV_MATURITY_SWEEP_ERA17_SUMMARY_VERSION,
    policyId: NAV_MATURITY_SWEEP_ERA17_POLICY_ID,
    runAt: (input.runAt ?? new Date()).toISOString(),
    certPassed: input.certPassed,
    auditPassed: audit.passed,
    navMaturityProofStatus,
    era17PreviewRoutesClassified: NAV_MATURITY_SWEEP_ERA17_NEW_PREVIEW_PREFIXES.length,
    focusedNavGapCount: audit.focusedNavGaps.length,
    era17RuleGapCount: audit.era17RuleGaps.length,
    era17HonestyGapCount: audit.era17HonestyGaps.length,
    productSignoffEmail: input.productSignoffEmail?.trim() || null,
    readinessDecision: input.certPassed && audit.passed ? "READY" : "NOT_READY",
  };
}

export function formatNavMaturitySweepEra17ReportLines(
  summary: NavMaturitySweepEra17Summary,
): string[] {
  const signoffLine = summary.productSignoffEmail
    ? `Product signoff: ${summary.productSignoffEmail}`
    : "[SKIPPED WITH REASON] Product signoff — NAV_MATURITY_SWEEP_PRODUCT_SIGNOFF_EMAIL not set";

  return [
    `Nav maturity sweep (${summary.version}) — proof: ${summary.navMaturityProofStatus}`,
    `Run at: ${summary.runAt}`,
    `Cert passed: ${summary.certPassed}`,
    `Audit passed: ${summary.auditPassed}`,
    `Era 17 preview routes classified: ${summary.era17PreviewRoutesClassified}`,
    `Focused nav gaps: ${summary.focusedNavGapCount}`,
    `Readiness: ${summary.readinessDecision}`,
    signoffLine,
  ];
}

export function parseNavMaturitySweepEra17Env(): Pick<
  Parameters<typeof buildNavMaturitySweepEra17Summary>[0],
  "productSignoffEmail"
> {
  return {
    productSignoffEmail: process.env.NAV_MATURITY_SWEEP_PRODUCT_SIGNOFF_EMAIL ?? null,
  };
}
