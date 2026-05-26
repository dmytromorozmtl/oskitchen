/**
 * Second pass: bare requireSessionUser() and session = patterns.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "app/dashboard");

function walk(dir) {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

function ensureImport(s) {
  if (s.includes("getTenantActor")) return s;
  if (s.includes('from "@/lib/scope/cached-tenant"')) return s;
  return s.replace(
    /^(import .+\n)+/,
    (block) =>
      `${block}import { getTenantActor } from "@/lib/scope/cached-tenant";\n`,
  );
}

function migrate(content) {
  if (!content.includes("requireSessionUser")) return null;
  let s = content;

  s = s.replace(/await requireSessionUser\(\);/g, "await getTenantActor();");
  s = s.replace(
    /const session = await requireSessionUser\(\);/g,
    "const { sessionUser: session, dataUserId } = await getTenantActor();",
  );

  s = s.replace(/loadSettingsHealth\(session\.id\)/g, "loadSettingsHealth(dataUserId)");
  s = s.replace(/userId: session\.id/g, "userId: dataUserId");

  if (s === content) return null;
  if (!content.includes("getTenantActor")) s = ensureImport(s);
  return s;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const before = readFileSync(file, "utf8");
  const after = migrate(before);
  if (after) {
    writeFileSync(file, after);
    changed++;
    console.log("pass2", file.replace(process.cwd(), ""));
  }
}
console.log("total pass2", changed);
