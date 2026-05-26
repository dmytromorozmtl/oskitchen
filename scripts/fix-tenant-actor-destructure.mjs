/**
 * Fixes incorrect `const session/user = await getTenantActor()` assignments.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function walk(dir, ext = ".tsx") {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p, ext));
    else if (ent.name.endsWith(ext)) out.push(p);
  }
  return out;
}

function fix(content) {
  let s = content;
  const before = s;

  s = s.replace(
    /const session = await getTenantActor\(\);/g,
    "const { sessionUser: session, dataUserId } = await getTenantActor();",
  );
  s = s.replace(
    /const user = await getTenantActor\(\);/g,
    "const { sessionUser: user, dataUserId } = await getTenantActor();",
  );

  if (s === before) return null;
  return s;
}

const dirs = [
  join(process.cwd(), "app/dashboard"),
  join(process.cwd(), "actions"),
];

let n = 0;
for (const dir of dirs) {
  for (const file of walk(dir, ".tsx").concat(walk(dir, ".ts"))) {
    const before = readFileSync(file, "utf8");
    const after = fix(before);
    if (after) {
      writeFileSync(file, after);
      n++;
      console.log("fixed", file.replace(process.cwd(), ""));
    }
  }
}
console.log("total fixed", n);
