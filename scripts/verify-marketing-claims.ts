/**
 * Marketing vs capability-matrix consistency check.
 * Run: npm run verify-claims
 * Strict (fails on roadmap warnings): MARKETING_CLAIMS_STRICT=1 npm run verify-claims
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

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
    console.warn(`${prefix} [${v.termId}] in ${v.sourceLabel}: "${v.match}"`);
    console.warn(`   …${v.context.replace(/\s+/g, " ").trim().slice(0, 240)}…`);
  }
}

function main(): void {
  const strict = process.env.MARKETING_CLAIMS_STRICT === "1";
  const sources = readMarketingSources();
  const allViolations: MarketingClaimViolation[] = [];

  console.log(`Marketing claim check (policy: ${MARKETING_CLAIMS_GOVERNANCE_POLICY_ID})`);
  if (strict) console.log("Strict mode: unqualified roadmap terms fail the run.\n");

  for (const { label, text } of sources) {
    allViolations.push(...scanMarketingText(text, label));
  }

  const forbidden = allViolations.filter((v) => v.kind === "forbidden");
  const roadmap = allViolations.filter((v) => v.kind === "roadmap_unqualified");

  if (allViolations.length === 0) {
    console.log("✓ No forbidden phrases or unqualified roadmap-term hits in scanned marketing files");
    console.log("  Cross-check docs/feature-maturity-matrix.md and config/marketing/claims-registry.json");
    process.exit(0);
  }

  printViolations(allViolations);
  console.log(
    `\n${forbidden.length} forbidden, ${roadmap.length} roadmap warning(s). See docs/feature-maturity-matrix.md`,
  );

  process.exit(exitCodeForMarketingClaimViolations(allViolations, strict));
}

main();
