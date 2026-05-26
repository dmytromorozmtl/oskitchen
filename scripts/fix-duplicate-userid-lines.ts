import fs from "node:fs";
import path from "node:path";

const schemaPath = path.join(process.cwd(), "prisma/schema.prisma");
const lines = fs.readFileSync(schemaPath, "utf8").split("\n");
const out: string[] = [];
let removed = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]!;
  const next = lines[i + 1] ?? "";
  if (
    /^\s+userId\s+String\s*$/.test(line) &&
    /^\s+userId\s+String/.test(next) &&
    next.includes('@map("user_id")')
  ) {
    removed++;
    continue;
  }
  out.push(line);
}

fs.writeFileSync(schemaPath, out.join("\n"));
console.log(`Removed ${removed} duplicate bare userId lines.`);
