/**
 * Reports `where: { userId` patterns in services/ that should use owner scope helpers.
 *
 *   npx tsx scripts/audit-service-userid-scope.ts
 *   npx tsx scripts/audit-service-userid-scope.ts --fail
 *
 * Allowed (1:1 owner settings / billing): kitchenSettings, activationState, subscription,
 * loyaltyProgram upsert, staffRole composite keys.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "services");
const FAIL = process.argv.includes("--fail");

const ALLOW_LINE = [
  /kitchenSettings\.findUnique/,
  /kitchenSettings\.findFirst/,
  /kitchenSettings\.update\(/,
  /activationState\.findUnique/,
  /subscription\.findUnique/,
  /subscription\.update/,
  /loyaltyProgram\.(upsert|update)/,
  /userId_key:/,
  /userId: scope\.userId/, // analytics window helpers pass owner id
  /userId: input\.userId/,
  /userId: ownerUserId/,
  /userId: sf\.userId/,
  /userId: opts\.userId/,
  /data:\s*\{[^}]*userId/, // creates
  /ownerUserId/,
  /distinct:\s*\["userId"\]/,
  /select:\s*\{\s*userId/,
  /userId:\s*string/, // types
  /userId,\s*error:/,
  /publishedByUser.*userId/,
  /MenuRotationCronSummary/,
];

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".ts")) out.push(p);
  }
  return out;
}

type Hit = { file: string; line: number; text: string };

function audit(): Hit[] {
  const hits: Hit[] = [];
  const re = /where:\s*\{\s*userId\b/;

  for (const file of walk(ROOT)) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((text, i) => {
      if (!re.test(text)) return;
      const prev = lines[i - 1] ?? "";
      const ctx = `${prev}\n${text}`;
      if (ALLOW_LINE.some((pat) => pat.test(text))) return;
      if (
        /kitchenSettings\.(findUnique|findFirst|upsert|update)|subscription\.(findUnique|upsert|update)|activationState\.findUnique|billingCustomer\.(findUnique|upsert)|copilotSettings\.(findUnique|upsert)|storefrontSettings\.(findUnique|findFirst)/.test(
          ctx,
        )
      ) {
        return;
      }
      hits.push({
        file: relative(join(__dirname, ".."), file),
        line: i + 1,
        text: text.trim(),
      });
    });
  }

  return hits.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

function main() {
  const hits = audit();
  const baselinePath = join(__dirname, "service-userid-scope-baseline.json");
  let baseline = 9999;
  try {
    const raw = JSON.parse(readFileSync(baselinePath, "utf8")) as { maxHits: number };
    baseline = raw.maxHits;
  } catch {
    // no baseline yet
  }

  console.log("KitchenOS — service userId where audit\n");
  console.log(`Suspicious \`where: { userId\` hits: ${hits.length} (baseline max ${baseline})\n`);

  for (const h of hits.slice(0, 40)) {
    console.log(`  ${h.file}:${h.line}`);
    console.log(`    ${h.text}\n`);
  }
  if (hits.length > 40) {
    console.log(`  … and ${hits.length - 40} more\n`);
  }

  if (hits.length > baseline) {
    console.error(
      `FAIL — ${hits.length} hits exceed baseline ${baseline}. Scope services or update scripts/service-userid-scope-baseline.json after review.`,
    );
    process.exit(1);
  }

  if (FAIL && hits.length > 0) {
    console.error("FAIL — --fail with remaining hits");
    process.exit(1);
  }

  console.log(hits.length === 0 ? "OK — no suspicious patterns." : `OK — within baseline (${hits.length} ≤ ${baseline}).`);
}

main();
