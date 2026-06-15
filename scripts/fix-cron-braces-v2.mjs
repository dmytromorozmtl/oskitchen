import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CRON_ROOT = join(process.cwd(), "app/api/cron");

function walk(dir) {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.name === "route.ts") out.push(p);
  }
  return out;
}

let fixed = 0;
for (const file of walk(CRON_ROOT)) {
  let s = readFileSync(file, "utf8");
  if (!s.includes("runCronRoute")) continue;
  const before = s;
  // Extra `}` before closing runCronRoute callback
  s = s.replace(/\n\}\n(\s*\}, \{ experimental: true \}\);)/g, "\n$1");
  s = s.replace(/\n\}\n(\s*\}\);)/g, "\n$1");
  if (s !== before) {
    writeFileSync(file, s);
    fixed++;
    console.log("fixed", file.replace(process.cwd(), ""));
  }
}
console.log("total", fixed);
