import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
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
  const before = s;
  s = s.replace(
    /return NextResponse\.json\(\{ ok: true, \.\.\.result \}\);\n\}\n  \}, \{ experimental: true \}\);/g,
    "return NextResponse.json({ ok: true, ...result });\n  }, { experimental: true });",
  );
  s = s.replace(
    /return NextResponse\.json\(\{ ok: true, \.\.\.result \}\);\n\}\n  \}\);/g,
    "return NextResponse.json({ ok: true, ...result });\n  });",
  );
  s = s.replace(
    /return NextResponse\.json\(\{ ok: true, \.\.\.\w+ \}\);\n\}\n  \}, \{ experimental: true \}\);/g,
    (m) => m.replace(/\n\}\n  \},/, "\n  },"),
  );
  if (s !== before) {
    writeFileSync(file, s);
    fixed++;
  }
}
console.log("fixed", fixed);
