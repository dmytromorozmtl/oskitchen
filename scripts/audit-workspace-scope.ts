import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

import { buildWorkspaceAuditReport } from "./lib/prisma-workspace-audit";

const ROOT = process.cwd();
const OUTPUT_PATH = join(ROOT, "docs", "audits", "workspace-scope-audit.md");
const SCAN_ROOTS = ["actions", "app", "components", "lib", "services", "scripts"];

type Hit = { file: string; line: number; text: string };

function walk(dir: string, out: string[] = []): string[] {
  const abs = join(ROOT, dir);
  if (!statSync(abs, { throwIfNoEntry: false })) return out;
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === ".next") continue;
    const nextAbs = join(abs, entry.name);
    if (entry.isDirectory()) {
      walk(relative(ROOT, nextAbs), out);
      continue;
    }
    if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      out.push(relative(ROOT, nextAbs));
    }
  }
  return out;
}

function collectHits(pattern: RegExp, limit = 40): Hit[] {
  const hits: Hit[] = [];
  const files = SCAN_ROOTS.flatMap((dir) => walk(dir));

  for (const rel of files) {
    const lines = readFileSync(join(ROOT, rel), "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const text = lines[i] ?? "";
      if (!pattern.test(text)) continue;
      hits.push({ file: rel, line: i + 1, text: text.trim() });
      if (hits.length >= limit) return hits;
    }
  }

  return hits;
}

function mdList(hits: Hit[]): string {
  if (hits.length === 0) return "- none found";
  return hits.map((hit) => `- \`${hit.file}:${hit.line}\` — \`${hit.text}\``).join("\n");
}

function main(): void {
  const modelReport = buildWorkspaceAuditReport();
  const dataUserHits = collectHits(/\bdataUserId\b/);
  const legacyScopeHits = collectHits(/\bWORKSPACE_SCOPE_LEGACY_OR\b|\blegacy\b/i);
  const rawUserWhereHits = collectHits(/where:\s*\{\s*userId\b/);
  const workspaceHits = collectHits(/\bworkspaceId\b/);
  const sessionIdentityHits = collectHits(/\bsessionUser\.id\b|\bsessionUserId\b|\brequireSessionUser\b/);

  mkdirSync(join(ROOT, "docs", "audits"), { recursive: true });

  const lines = [
    "# Workspace Scope Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Prisma models total: **${modelReport.totalModels}**`,
    `- Models with workspaceId: **${modelReport.scoped}**`,
    `- Models still needing migration: **${modelReport.needsMigration}**`,
    `- ` + "`dataUserId`" + ` occurrences sampled: **${dataUserHits.length}**`,
    `- Raw ` + "`where: { userId`" + ` occurrences sampled: **${rawUserWhereHits.length}**`,
    "",
    "## Classification Guide",
    "",
    "- `valid session identity` — session actor handling, auth helpers, or session-only control flow",
    "- `valid legacy alias` — explicit `dataUserId` compatibility while owner-scoped migration is still in progress",
    "- `risky tenant data scope` — direct `where: { userId ... }` patterns on likely tenant data reads/writes",
    "- `migration candidate` — compatibility flags, legacy fallback patterns, or owner-vs-session normalization code",
    "",
    "## Valid Session Identity Samples",
    "",
    mdList(sessionIdentityHits),
    "",
    "## Valid Legacy Alias Samples",
    "",
    mdList(dataUserHits),
    "",
    "## Risky Tenant Data Scope Samples",
    "",
    mdList(rawUserWhereHits),
    "",
    "## Migration Candidate Samples",
    "",
    mdList(legacyScopeHits),
    "",
    "## Workspace-First Scope Samples",
    "",
    mdList(workspaceHits),
    "",
    "## Models Still Needing Migration",
    "",
    modelReport.needsMigrationModels.length > 0
      ? modelReport.needsMigrationModels.map((model) => `- ${model}`).join("\n")
      : "- none",
    "",
    "## Recommended Plan",
    "",
    "1. Keep `workspaceId` as the preferred tenant data boundary for all new work.",
    "2. Treat `dataUserId` as a temporary compatibility alias, not a destination architecture.",
    "3. Burn down raw `where: { userId` patterns with scope helpers before removing legacy fallback support.",
    "4. Add an ESLint or static-audit warning for new `dataUserId` usage outside explicit tenant helpers.",
    "5. Target a 30-day deprecation review for remaining `WORKSPACE_SCOPE_LEGACY_OR` / alias-heavy paths.",
    "",
    "## Output Consumers",
    "",
    "- engineering architecture review",
    "- tenant isolation QA",
    "- pilot readiness / production hardening",
    "- future `dataUserId` deprecation plan",
    "",
  ];

  writeFileSync(OUTPUT_PATH, lines.join("\n"), "utf8");
  console.log(`Wrote ${relative(ROOT, OUTPUT_PATH)}`);
}

main();
