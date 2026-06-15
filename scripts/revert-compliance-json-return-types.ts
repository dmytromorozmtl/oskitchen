/**
 * Revert internal experiment helpers to Record<string, unknown>;
 * Prisma boundaries use toJsonValue in sync services.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIRS = [path.join(ROOT, "lib/compliance"), path.join(ROOT, "lib/storefront")];

function walk(dir: string, out: string[] = []): string[] {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".ts")) out.push(p);
  }
  return out;
}

let n = 0;
for (const dir of DIRS) {
  for (const file of walk(dir)) {
    let src = fs.readFileSync(file, "utf8");
    const before = src;
    src = src.replace(/\bThemeExperimentJson\b/g, "Record<string, unknown>");
    src = src.replace(/, type Record<string, unknown>/g, "");
    src = src.replace(/import \{ type Record<string, unknown> \} from "@\/lib\/prisma\/json";\n/g, "");
    src = src.replace(/import \{ toJsonValue, type Record<string, unknown> \} from "@\/lib\/prisma\/json";\n/g, "");
    src = src.replace(/import \{ toJsonValue \} from "@\/lib\/prisma\/json";\n\n/g, "");
    src = src.replace(/return toJsonValue\(merge/g, "return merge");
    src = src.replace(/return toJsonValue\(base\);/g, "return base;");
    if (src !== before) {
      fs.writeFileSync(file, src);
      n++;
    }
  }
}
console.log("reverted", n);
