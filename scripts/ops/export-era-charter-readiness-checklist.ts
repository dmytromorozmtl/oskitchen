#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  ERA_CHARTER_CRITERIA,
  ERA_CHARTER_READINESS_CHECKLIST_PATH,
  POST_TERMINUS_STEADY_STATE_GUARDRAILS,
  POST_TERMINUS_STEADY_STATE_STEP14_DOC,
} from "@/lib/commercial/post-terminus-steady-state-phases-era24";

export function buildEraCharterReadinessChecklistMarkdown(): string {
  const lines: string[] = [
    "# Era Charter Readiness Checklist (era24 → era25+)",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Process only** — this checklist does not attestation-pass a new era.",
    "> All criteria require human sign-off before any `era25-*` engineering begins.",
    "",
    "## Prerequisites",
    "",
    "- [ ] Step 14 steady state active (`npm run ops:validate-steady-state-operator-loop -- --json`)",
    "- [ ] Maintenance mode rhythms healthy (`npm run ops:validate-maintenance-mode -- --json`)",
    "- [ ] Leadership explicitly decided **not** to extend era24 maintenance rhythms",
    "",
    "## New era criteria (ALL required)",
    "",
  ];

  for (const criterion of ERA_CHARTER_CRITERIA) {
    lines.push(`- [ ] **${criterion.label}** — e.g. ${criterion.example}`);
  }

  lines.push("");
  lines.push("## Charter deliverables (minimum)");
  lines.push("");
  lines.push("- [ ] Charter doc: `docs/era25-<name>-charter-2026-*.md`");
  lines.push("- [ ] Policy IDs: `era25-<name>-v1` (+ phases/ui if operator-facing)");
  lines.push("- [ ] Backlog ID: `KOS-E25-NNN`");
  lines.push("- [ ] Ops: `ops:validate-*` with honest JSON (never fake PASS)");
  lines.push("- [ ] Cert: `test:ci:*-era25` + `:cert` wired into governance bundles");
  lines.push("- [ ] Briefing priority scheme documented separately from era21 0–8");
  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of POST_TERMINUS_STEADY_STATE_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }
  lines.push("");
  lines.push(`Step 14 doc: [\`${POST_TERMINUS_STEADY_STATE_STEP14_DOC}\`](../${POST_TERMINUS_STEADY_STATE_STEP14_DOC})`);
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const markdown = buildEraCharterReadinessChecklistMarkdown();

  if (write) {
    const outPath = join(process.cwd(), ERA_CHARTER_READINESS_CHECKLIST_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${ERA_CHARTER_READINESS_CHECKLIST_PATH}`);
  } else {
    console.log(markdown);
  }
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
