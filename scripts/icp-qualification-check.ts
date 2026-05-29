#!/usr/bin/env npx tsx
/**
 * ICP qualification check — reads PILOT_GONOGO_ICP_INPUT_JSON, writes honest result artifact.
 * Policy: era17-pilot-icp-contract-v1 + era20-pilot-icp-qualification-bridge-v1
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { ERA20_PILOT_ICP_PROSPECT_DRAFT_TEMPLATE_PATH } from "@/lib/commercial/era20-pilot-icp-qualification-bridge-era20-policy";
import {
  evaluatePilotIcpQualification,
  formatPilotIcpQualificationReport,
} from "@/lib/commercial/pilot-icp-contract-era17";
import { parsePilotIcpInputFromJson } from "@/lib/commercial/pilot-gono-go-summary";

export const ICP_QUALIFICATION_RESULT_ARTIFACT = "artifacts/icp-qualification-result.json" as const;

function main() {
  const raw = process.env.PILOT_GONOGO_ICP_INPUT_JSON;
  const jsonOnly = process.argv.includes("--json");

  if (!raw?.trim()) {
    const payload = {
      version: "icp-qualification-v1",
      generatedAt: new Date().toISOString(),
      envConfigured: false,
      qualified: false,
      report: "ICP env not set — export PILOT_GONOGO_ICP_INPUT_JSON from real prospect review.",
      templatePath: ERA20_PILOT_ICP_PROSPECT_DRAFT_TEMPLATE_PATH,
      setupCommand: `export PILOT_GONOGO_ICP_INPUT_JSON="$(cat ${ERA20_PILOT_ICP_PROSPECT_DRAFT_TEMPLATE_PATH})"`,
    };
    writeArtifact(payload);
    if (jsonOnly) {
      console.log(JSON.stringify(payload, null, 2));
    } else {
      console.log("\nICP qualification: NOT CONFIGURED\n");
      console.log(payload.report);
      console.log(`\nTemplate: ${payload.templatePath}`);
      console.log(payload.setupCommand);
      console.log("");
    }
    process.exit(1);
  }

  const input = parsePilotIcpInputFromJson(raw);
  const result = evaluatePilotIcpQualification(input);
  const report = formatPilotIcpQualificationReport(result);

  const payload = {
    version: "icp-qualification-v1",
    generatedAt: new Date().toISOString(),
    envConfigured: true,
    qualified: result.qualified,
    disqualifiers: result.disqualifiers,
    missingCriteria: result.missingCriteria,
    report,
  };

  writeArtifact(payload);

  if (jsonOnly) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(`\n${report}\n`);
    console.log(`Artifact: ${ICP_QUALIFICATION_RESULT_ARTIFACT}\n`);
  }

  process.exit(result.qualified ? 0 : 1);
}

function writeArtifact(payload: unknown): void {
  const path = join(process.cwd(), ICP_QUALIFICATION_RESULT_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

main();
