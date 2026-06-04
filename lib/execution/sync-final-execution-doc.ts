import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  FINAL_EXECUTION_DOC_MARKERS,
  FINAL_EXECUTION_DOC_PATH,
} from "@/lib/execution/final-execution-doc-policy";
import {
  FINAL_EXECUTION_JSON_POLICY_ID,
  FINAL_EXECUTION_REPORT_ARTIFACT,
} from "@/lib/execution/final-execution-json-policy";
import type { FinalExecutionReport } from "@/lib/execution/sync-final-execution-report";
import { buildFinalExecutionReport } from "@/lib/execution/sync-final-execution-report";

export function loadFinalExecutionReport(root = process.cwd()): FinalExecutionReport {
  const path = join(root, FINAL_EXECUTION_REPORT_ARTIFACT);
  try {
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw) as FinalExecutionReport;
    if (parsed.version === FINAL_EXECUTION_JSON_POLICY_ID) {
      return parsed;
    }
  } catch {
    // fall through
  }
  return buildFinalExecutionReport(root);
}

export function renderFinalExecutionMarkdown(report: FinalExecutionReport): string {
  const pendingGates = report.finalOrchestratorGates.filter((g) => g.trackerStatus !== "done");
  const gateRows = report.gateArtifacts
    .map(
      (g) =>
        `| \`${g.artifact}\` | ${g.present ? "yes" : "no"} | ${g.overall ?? "—"} | ${g.proofStatus ?? "—"} |`,
    )
    .join("\n");

  const orchestratorRows = report.finalOrchestratorGates
    .map((g) => `| ${g.phaseId} | ${g.taskSlot} | ${g.trackerStatus} |`)
    .join("\n");

  return `# Final execution report — OS Kitchen

**Final execution report (FINAL-23)** — markdown synced from \`${FINAL_EXECUTION_REPORT_ARTIFACT}\`.

| Field | Value |
|-------|-------|
| JSON version | \`${report.version}\` |
| Generated (JSON) | ${report.generatedAt} |
| trackerSync | **${report.trackerSync.doneCount}/${report.trackerSync.totalCount}** (${report.trackerSync.percentDone}%) |
| Execution log cycles | ${report.trackerSync.executionLogCycles} |
| Vault | ${report.vault.presentCount}/${report.vault.totalCount} present |
| P0 artifact overall | ${report.p0ProofStatus} |
| GO/NO-GO | **${report.goDecision}** |
| **ready** | **${report.ready}** |
| allPhasesPassed | ${report.allPhasesPassed} |

> ${report.honestyNote}

---

## Executive summary

Engineering gates through **FINAL-21** are largely **done** in the tracker; **commercial pilot GO** remains **NO-GO** until P0 staging proofs pass and customer/LOI gates clear. Do **not** set \`ready: true\` in JSON or claim production-ready for sales until \`goDecision === "GO"\`.

---

## FINAL orchestrator gates

| Phase | Task slot | Tracker |
|-------|-----------|---------|
${orchestratorRows}

${pendingGates.length ? `\n**Pending phases:** ${pendingGates.map((g) => g.phaseId).join(", ")}\n` : ""}

---

## Gate artifacts (FINAL-13..FINAL-21)

| Artifact | Present | Overall | proofStatus |
|----------|---------|---------|-------------|
${gateRows}

---

## Operator next actions

1. Configure ops vault secrets and re-run \`npm run smoke:p0-staging-proof-unblock\` until P0 artifact is honest **PASS**.
2. Re-run \`npm run smoke:pilot-gono-go\` after Tier 0/1 + forbidden-claims enforcement — expect **NO-GO** until evidence gates pass.
3. Complete **FINAL-23..FINAL-26** tracker slots, then re-sync JSON (\`run-final-execution-json-sync.ts\`) and this doc (\`run-final-execution-doc-sync.ts\`).

---

## References

- Canonical JSON: \`${FINAL_EXECUTION_REPORT_ARTIFACT}\`
- Commercial runbook: \`docs/commercial-pilot-runbook.md\`
- Sales hub: \`docs/SALES_PLAYBOOK.md\`
- Trust labels: \`/trust\`
`;
}

export function auditFinalExecutionDocContent(
  markdown: string,
  report: FinalExecutionReport,
): boolean {
  const markersOk = FINAL_EXECUTION_DOC_MARKERS.every((m) => markdown.includes(m));
  const valuesOk =
    markdown.includes(String(report.trackerSync.doneCount)) &&
    markdown.includes(report.goDecision) &&
    markdown.includes(String(report.ready)) &&
    markdown.includes(report.version);
  return markersOk && valuesOk;
}

export function syncFinalExecutionDoc(root = process.cwd()): {
  markdown: string;
  report: FinalExecutionReport;
  docPath: typeof FINAL_EXECUTION_DOC_PATH;
} {
  const report = loadFinalExecutionReport(root);
  const markdown = renderFinalExecutionMarkdown(report);
  return { markdown, report, docPath: FINAL_EXECUTION_DOC_PATH };
}
