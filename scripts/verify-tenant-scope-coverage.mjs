/**
 * Reports dashboard pages/actions still using session id for tenant data.
 * Run: node scripts/verify-tenant-scope-coverage.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

function walk(dir, ext) {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p, ext));
    else if (ent.name.endsWith(ext)) out.push(p);
  }
  return out;
}

const issues = [];

for (const file of walk(join(process.cwd(), "app/dashboard"), ".tsx")) {
  const s = readFileSync(file, "utf8");
  if (s.includes("requireSessionUser")) {
    issues.push({ file, kind: "requireSessionUser" });
  }
  if (/userId:\s*(user|session)\.id/.test(s) && s.includes("getTenantActor")) {
    issues.push({ file, kind: "userId: user/session.id with tenant actor" });
  }
  if (/getTenantActor\(\)/.test(s) && !s.includes("dataUserId") && !s.includes("await getTenantActor();")) {
    if (/const \w+ = await getTenantActor/.test(s)) {
      issues.push({ file, kind: "missing destructure dataUserId" });
    }
  }
}

for (const file of walk(join(process.cwd(), "actions"), ".ts")) {
  const s = readFileSync(file, "utf8");
  if (s.includes("requireSessionUser")) {
    issues.push({ file: file.replace(process.cwd(), ""), kind: "requireSessionUser in actions" });
  }
}

console.log(JSON.stringify(issues, null, 2));
console.log("total issues", issues.length);
