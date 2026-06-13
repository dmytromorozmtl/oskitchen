/**
 * Rewrite CI workflow npm run lines to use router form for archived prefixes.
 *
 *   npm run test:ci:foo:bar  →  npm run test:ci -- foo:bar
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { NPM_SCRIPT_ROUTER_PREFIXES } from "@/lib/devops/npm-script-consolidation-policy";

const ROOT = process.cwd();
const workflowsDir = join(ROOT, ".github", "workflows");

function migrateContent(content: string): { next: string; replacements: number } {
  let replacements = 0;
  let next = content;

  for (const prefix of NPM_SCRIPT_ROUTER_PREFIXES) {
    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`npm run ${escaped}:([^\\s"'\\n]+)`, "g");
    next = next.replace(pattern, (_match, rest: string) => {
      replacements += 1;
      return `npm run ${prefix} -- ${rest}`;
    });
  }

  return { next, replacements };
}

function main(): void {
  const write = process.argv.includes("--write");
  let total = 0;

  for (const file of readdirSync(workflowsDir).filter((f) => f.endsWith(".yml"))) {
    const path = join(workflowsDir, file);
    const content = readFileSync(path, "utf8");
    const { next, replacements } = migrateContent(content);
    if (replacements > 0) {
      console.log(`${file}: ${replacements} router migration(s)`);
      total += replacements;
      if (write) writeFileSync(path, next, "utf8");
    }
  }

  console.log(`[migrate-ci-workflow-script-refs] ${total} replacement(s)${write ? " applied" : " (dry-run)"}`);
}

main();
