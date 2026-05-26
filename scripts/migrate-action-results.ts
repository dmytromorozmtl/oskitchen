/**
 * Codemod helper — migrate legacy `{ success: true|false }` returns to ActionResult.
 *
 *   npx tsx scripts/migrate-action-results.ts --dry-run actions/foo.ts
 *   npx tsx scripts/migrate-action-results.ts actions/foo.ts
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function walkTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walkTsFiles(p));
    else if (name.endsWith(".ts")) out.push(p);
  }
  return out;
}

const dryRun = process.argv.includes("--dry-run");
const target = process.argv.find((a) => a.endsWith(".ts") && !a.includes("migrate-action"));

function transform(source: string): string {
  let out = source;
  if (!out.includes('from "@/lib/action-result"')) {
    if (out.includes('"use server"')) {
      out = out.replace(
        /("use server"\s*;\s*\n)/,
        '$1\nimport { fail, ok } from "@/lib/action-result";\n',
      );
    }
  }
  out = out.replace(
    /return\s*\{\s*success:\s*true(?:\s+as\s+const)?\s*,\s*([^}]+)\s*\}/g,
    (_, rest) => `return ok({ ${rest.trim()} })`,
  );
  out = out.replace(
    /return\s*\{\s*success:\s*true(?:\s+as\s+const)?\s*\}/g,
    "return ok(undefined)",
  );
  out = out.replace(
    /\{\s*success:\s*true\s*,\s*([^}]+)\s*\}/g,
    (_, rest) => `{ ${rest.trim()} }`,
  );
  out = out.replace(/\{\s*success:\s*true\s*\}/g, "{}");
  out = out.replace(
    /return\s*\{\s*success:\s*false(?:\s+as\s+const)?,\s*error:\s*([^,}]+)(?:,\s*code:\s*([^}]+))?\s*\}/g,
    (_, err, code) =>
      code ? `return fail(${err.trim()}, ${code.trim()})` : `return fail(${err.trim()})`,
  );
  return out;
}

const files = target ? [target] : walkTsFiles(join(process.cwd(), "actions"));

let changed = 0;
for (const file of files) {
  const before = readFileSync(file, "utf8");
  const after = transform(before);
  if (after !== before) {
    changed++;
    console.log(dryRun ? `[dry-run] would update ${file}` : `updated ${file}`);
    if (!dryRun) writeFileSync(file, after, "utf8");
  }
}
console.log(`Done. ${changed} file(s) ${dryRun ? "would change" : "changed"}.`);
