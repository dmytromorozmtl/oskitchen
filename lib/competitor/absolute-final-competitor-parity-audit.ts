import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  COMPETITOR_PARITY_21_ENTRIES,
  COMPETITOR_PARITY_21_SLUGS,
  COMPETITOR_PARITY_ABSOLUTE_FINAL_POLICY_ID,
  COMPETITOR_PARITY_DOC_PATH,
  COMPETITOR_PARITY_DOC_SECTIONS,
  COMPETITOR_PARITY_TOTAL,
  COMPETITOR_PARITY_WIRING_PATHS,
} from "@/lib/competitor/absolute-final-competitor-parity-policy";

export type CompetitorParityAudit = {
  ok: boolean;
  failures: string[];
};

export function auditCompetitorParityWiring(root = process.cwd()): CompetitorParityAudit {
  const failures: string[] = [];

  for (const rel of COMPETITOR_PARITY_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  if (COMPETITOR_PARITY_21_ENTRIES.length !== COMPETITOR_PARITY_TOTAL) {
    failures.push(`expected ${COMPETITOR_PARITY_TOTAL} competitor entries`);
  }

  if (COMPETITOR_PARITY_21_SLUGS.length !== COMPETITOR_PARITY_TOTAL) {
    failures.push(`expected ${COMPETITOR_PARITY_TOTAL} competitor slugs`);
  }

  const docSource = readFileSync(join(root, COMPETITOR_PARITY_DOC_PATH), "utf8");
  if (!docSource.includes(COMPETITOR_PARITY_ABSOLUTE_FINAL_POLICY_ID)) {
    failures.push("parity doc missing policy id");
  }
  if (!docSource.includes("21")) {
    failures.push("parity doc missing 21-competitor marker");
  }

  for (const section of COMPETITOR_PARITY_DOC_SECTIONS) {
    if (!docSource.includes(section)) {
      failures.push(`parity doc missing section: ${section}`);
    }
  }

  for (const entry of COMPETITOR_PARITY_21_ENTRIES) {
    if (!docSource.includes(entry.displayName)) {
      failures.push(`parity doc missing competitor: ${entry.displayName}`);
    }
    if (!docSource.includes(`slug: \`${entry.slug}\``) && !docSource.includes(`| ${entry.displayName} |`)) {
      failures.push(`parity doc missing slug row for: ${entry.slug}`);
    }
  }

  const tracker = JSON.parse(
    readFileSync(join(root, "artifacts/competitor-feature-tracker.json"), "utf8"),
  ) as Record<string, unknown>;
  const salesSafe = tracker.salesSafeCompetitorClaims as
    | { filledCount?: number; totalCount?: number }
    | undefined;
  if (!salesSafe || salesSafe.filledCount !== 8 || salesSafe.totalCount !== 8) {
    failures.push("competitor tracker missing 8/8 sales-safe claims");
  }

  const battleCards = readFileSync(join(root, "docs/competitive-battle-cards.md"), "utf8");
  if (!battleCards.includes("Eight battle cards")) {
    failures.push("battle cards doc missing eight-card framework");
  }

  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  if (!pkg.scripts?.["test:ci:competitor-parity-absolute-final:cert"]) {
    failures.push("package.json missing competitor parity cert script");
  }

  return { ok: failures.length === 0, failures };
}
