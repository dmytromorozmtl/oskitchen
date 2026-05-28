/**
 * Era 16 commercial pilot evidence pack cert script.
 * Writes artifacts/commercial-pilot-evidence-pack-summary.json for GO/NO-GO review.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_SUMMARY_ARTIFACT,
} from "../lib/commercial/commercial-pilot-evidence-pack-era16-policy";
import {
  buildCommercialPilotEvidencePackSummary,
  validateCommercialPilotEvidencePackStructure,
} from "../lib/commercial/commercial-pilot-evidence-pack";

function main() {
  const validation = validateCommercialPilotEvidencePackStructure();
  const summary = buildCommercialPilotEvidencePackSummary(
    COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID,
  );

  const artifactPath = join(process.cwd(), COMMERCIAL_PILOT_EVIDENCE_ERA16_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`\nCommercial pilot evidence pack (${COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID})\n`);
  console.log(`Roles: ${summary.roleChecklistCount} (${summary.roles.join(", ")})`);
  console.log(`GO-blocker checklist items: ${summary.goBlockerItemCount}`);
  console.log(`Allowed features: ${summary.allowedFeatureCount}`);
  console.log(`Forbidden claims: ${summary.forbiddenClaimCount}`);
  console.log(`Rollback steps: ${summary.rollbackStepCount}`);
  console.log(`Escalation tiers: ${summary.escalationTierCount}`);
  console.log(`\nSummary artifact: ${COMMERCIAL_PILOT_EVIDENCE_ERA16_SUMMARY_ARTIFACT}\n`);

  if (!validation.ok) {
    console.error("Evidence pack validation failed:");
    for (const error of validation.errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }
}

main();
