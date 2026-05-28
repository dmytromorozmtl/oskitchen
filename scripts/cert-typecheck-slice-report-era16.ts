/**
 * Era 16 typecheck slice report cert script.
 * Validates report plan and writes template summary artifact for CI wiring.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  TYPECHECK_SLICE_ERA16_POLICY_ID,
  TYPECHECK_SLICE_ERA16_SLICE_COUNT,
  TYPECHECK_SLICE_ERA16_SUMMARY_ARTIFACT,
} from "../lib/ci/typecheck-slice-era16-policy";
import { TYPECHECK_SLICES } from "../lib/ci/typecheck-slice-policy";
import {
  buildTypecheckSliceReportPlan,
  buildTypecheckSliceReportSummary,
} from "../lib/ci/typecheck-slice-report";

export function validateTypecheckSliceReportPack(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (TYPECHECK_SLICES.length !== TYPECHECK_SLICE_ERA16_SLICE_COUNT) {
    errors.push(`Expected ${TYPECHECK_SLICE_ERA16_SLICE_COUNT} slices in registry`);
  }
  for (const slice of TYPECHECK_SLICES) {
    if (slice.heapMb !== 6144) {
      errors.push(`Slice ${slice.id} must use 6144MB heap for CI parity`);
    }
    if (!slice.tsconfig.startsWith("tsconfig.slice.")) {
      errors.push(`Slice ${slice.id} has invalid tsconfig path`);
    }
  }
  return { ok: errors.length === 0, errors };
}

function main() {
  const validation = validateTypecheckSliceReportPack();
  const summary = buildTypecheckSliceReportSummary(buildTypecheckSliceReportPlan());

  const artifactPath = join(process.cwd(), TYPECHECK_SLICE_ERA16_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`\nTypecheck slice report cert (${TYPECHECK_SLICE_ERA16_POLICY_ID})\n`);
  console.log(`Slices: ${summary.sliceCount}`);
  console.log(`Canonical full gate: npm run ${summary.canonicalFullGate}`);
  console.log(`Summary artifact: ${TYPECHECK_SLICE_ERA16_SUMMARY_ARTIFACT}\n`);

  if (!validation.ok) {
    console.error("Report pack validation failed:");
    for (const error of validation.errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }
}

main();
