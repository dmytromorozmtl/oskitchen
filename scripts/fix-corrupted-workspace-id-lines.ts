/**
 * Repair schema lines where workspaceId was merged into userId by apply-workspace-schema-phases-23-29.ts
 */
import fs from "node:fs";
import path from "node:path";

const schemaPath = path.join(process.cwd(), "prisma/schema.prisma");
let schema = fs.readFileSync(schemaPath, "utf8");

const corrupted =
  /^(\s+)workspaceId String\?[^\n]*@map\("workspace_id"\)[^\n]*@map\("user_id"\)([^\n]*)$/gm;

let fixed = 0;
schema = schema.replace(corrupted, (_full, indent: string, userTail: string) => {
  fixed++;
  const optional = userTail.includes("String?") ? "String?" : "String";
  const extra = userTail
    .replace(/@map\("user_id"\)/, "")
    .replace(/@db\.Uuid/, "")
    .replace(/String\?/, "")
    .replace(/String/, "")
    .trim();
  const userLine = `${indent}userId      ${optional}  @map("user_id") @db.Uuid${extra ? ` ${extra}` : ""}`;
  return `${userLine}\n${indent}workspaceId String? @map("workspace_id") @db.Uuid`;
});

fs.writeFileSync(schemaPath, schema);
console.log(`Fixed ${fixed} corrupted field blocks.`);
