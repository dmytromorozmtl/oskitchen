import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  SOC2_MESSAGING_P1_26_BANNED_PHRASES,
  SOC2_MESSAGING_P1_26_POLICY_ID,
  SOC2_MESSAGING_P1_26_SCAN_EXCLUDE_FILES,
  SOC2_MESSAGING_P1_26_SCAN_PATHS,
} from "@/lib/marketing/soc2-messaging-p1-26-policy";

export type Soc2MessagingP126Hit = {
  phrase: string;
  sourceLabel: string;
  line: number;
  context: string;
};

export type Soc2MessagingP126AuditSummary = {
  policyId: typeof SOC2_MESSAGING_P1_26_POLICY_ID;
  sourcesScanned: number;
  hits: Soc2MessagingP126Hit[];
  passed: boolean;
};

function collectMarketingSources(root: string): { label: string; text: string }[] {
  const sources: { label: string; text: string }[] = [];

  for (const rel of SOC2_MESSAGING_P1_26_SCAN_PATHS) {
    const full = join(root, rel);
    if (!existsSync(full)) continue;

    const stat = statSync(full);
    if (stat.isFile()) {
      sources.push({ label: rel, text: readFileSync(full, "utf8") });
      continue;
    }

    const walk = (dir: string, prefix: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const childRel = join(prefix, entry.name);
        const childFull = join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(childFull, childRel);
        } else if (/\.(tsx?|md)$/.test(entry.name)) {
          if ((SOC2_MESSAGING_P1_26_SCAN_EXCLUDE_FILES as readonly string[]).includes(childRel)) {
            continue;
          }
          sources.push({ label: childRel, text: readFileSync(childFull, "utf8") });
        }
      }
    };

    walk(full, rel);
  }

  return sources;
}

export function auditSoc2MessagingP126(root = process.cwd()): Soc2MessagingP126AuditSummary {
  const sources = collectMarketingSources(root);
  const hits: Soc2MessagingP126Hit[] = [];

  for (const { label, text } of sources) {
    const lower = text.toLowerCase();
    for (const phrase of SOC2_MESSAGING_P1_26_BANNED_PHRASES) {
      let from = 0;
      while (true) {
        const idx = lower.indexOf(phrase.toLowerCase(), from);
        if (idx === -1) break;
        const line = text.slice(0, idx).split("\n").length;
        const contextStart = Math.max(0, idx - 60);
        const contextEnd = Math.min(text.length, idx + phrase.length + 60);
        hits.push({
          phrase,
          sourceLabel: label,
          line,
          context: text.slice(contextStart, contextEnd).replace(/\s+/g, " ").trim(),
        });
        from = idx + phrase.length;
      }
    }
  }

  return {
    policyId: SOC2_MESSAGING_P1_26_POLICY_ID,
    sourcesScanned: sources.length,
    hits,
    passed: hits.length === 0,
  };
}

export function formatSoc2MessagingP126AuditLines(summary: Soc2MessagingP126AuditSummary): string[] {
  return [
    `SOC 2 messaging audit (${summary.policyId})`,
    `Sources scanned: ${summary.sourcesScanned}`,
    `Banned phrase hits: ${summary.hits.length}`,
    ...summary.hits.map(
      (hit) => `  ✗ "${hit.phrase}" in ${hit.sourceLabel}:${hit.line} — ${hit.context}`,
    ),
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
