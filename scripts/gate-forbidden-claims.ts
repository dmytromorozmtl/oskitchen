/**
 * P0-6 merge gate — fails CI when marketing copy contains banned phrases.
 *
 * Usage:
 *   npm run gate:forbidden-claims
 *   MARKETING_CLAIMS_STRICT=1 npm run gate:forbidden-claims  # also fail unqualified roadmap terms
 */
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  FORBIDDEN_CLAIMS_CI_GATE_ARTIFACT,
  FORBIDDEN_CLAIMS_CI_GATE_POLICY_ID,
} from "@/lib/marketing/forbidden-claims-ci-gate-policy";
import {
  MARKETING_CLAIMS_GOVERNANCE_POLICY_ID,
  MARKETING_CLAIMS_SCAN_ROOTS,
  exitCodeForMarketingClaimViolations,
  scanMarketingText,
  type MarketingClaimViolation,
} from "@/lib/governance/marketing-claims-governance-policy";

const ROOT = process.cwd();

function readMarketingSources(): { label: string; text: string }[] {
  const sources: { label: string; text: string }[] = [];

  for (const rel of MARKETING_CLAIMS_SCAN_ROOTS) {
    const full = join(ROOT, rel);
    try {
      const stat = statSync(full);
      if (stat.isFile()) {
        sources.push({ label: rel, text: readFileSync(full, "utf8") });
        continue;
      }
      for (const f of readdirSync(full, { withFileTypes: true })) {
        if (f.isFile() && /\.(tsx?|md)$/.test(f.name)) {
          const path = join(rel, f.name);
          sources.push({ label: path, text: readFileSync(join(full, f.name), "utf8") });
        }
      }
    } catch {
      /* skip missing roots */
    }
  }

  return sources;
}

function printViolations(violations: MarketingClaimViolation[]): void {
  for (const v of violations) {
    const prefix = v.kind === "forbidden" ? "✗ FORBIDDEN" : "⚠  ROADMAP";
    console.error(`${prefix} [${v.termId}] in ${v.sourceLabel}: "${v.match}"`);
    console.error(`   …${v.context.replace(/\s+/g, " ").trim().slice(0, 240)}…`);
  }
}

export function runForbiddenClaimsCiGate(env: NodeJS.ProcessEnv = process.env): {
  passed: boolean;
  forbiddenCount: number;
  roadmapCount: number;
  strict: boolean;
  sourcesScanned: number;
} {
  const strict = env.MARKETING_CLAIMS_STRICT === "1";
  const sources = readMarketingSources();
  const allViolations: MarketingClaimViolation[] = [];

  for (const { label, text } of sources) {
    allViolations.push(...scanMarketingText(text, label));
  }

  const forbidden = allViolations.filter((v) => v.kind === "forbidden");
  const roadmap = allViolations.filter((v) => v.kind === "roadmap_unqualified");
  const exitCode = exitCodeForMarketingClaimViolations(allViolations, strict);
  const passed = exitCode === 0;

  console.log(
    `Forbidden claims CI gate (${FORBIDDEN_CLAIMS_CI_GATE_POLICY_ID}) · governance ${MARKETING_CLAIMS_GOVERNANCE_POLICY_ID}`,
  );
  console.log(`Scanned ${sources.length} marketing source(s) · strict=${strict}`);

  if (allViolations.length > 0) {
    printViolations(allViolations);
  }

  if (passed) {
    console.log("✓ PASS — no blocking forbidden phrases in marketing copy");
  } else {
    console.error(
      `\n✗ FAIL — ${forbidden.length} forbidden phrase(s)${strict ? `, ${roadmap.length} unqualified roadmap term(s)` : ""}`,
    );
    console.error("Fix copy or add honest qualifiers. See docs/forbidden-claims-training.md");
  }

  return {
    passed,
    forbiddenCount: forbidden.length,
    roadmapCount: roadmap.length,
    strict,
    sourcesScanned: sources.length,
  };
}

function main(): void {
  const result = runForbiddenClaimsCiGate();
  const artifactPath = join(ROOT, FORBIDDEN_CLAIMS_CI_GATE_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(
    artifactPath,
    `${JSON.stringify(
      {
        policyId: FORBIDDEN_CLAIMS_CI_GATE_POLICY_ID,
        runAt: new Date().toISOString(),
        passed: result.passed,
        strict: result.strict,
        forbiddenCount: result.forbiddenCount,
        roadmapCount: result.roadmapCount,
        sourcesScanned: result.sourcesScanned,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  process.exit(result.passed ? 0 : 1);
}

if (require.main === module) {
  main();
}
