import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === "scripts") continue;
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".ts") && !name.endsWith(".test.ts")) out.push(p);
  }
  return out;
}

let n = 0;
for (const file of walk(ROOT)) {
  if (file.endsWith("lib/prisma/json.ts")) continue;
  let src = fs.readFileSync(file, "utf8");
  if (!/\btoJsonValue\b/.test(src)) continue;
  if (/@\/lib\/prisma\/json/.test(src)) {
    if (!src.includes("toJsonValue") || src.match(/import \{[^}]*toJsonValue/)) continue;
    src = src.replace(
      /import \{([^}]+)\} from "@\/lib\/prisma\/json";/,
      (_, inner) => `import { ${inner.trim()}, toJsonValue } from "@/lib/prisma/json";`,
    );
  } else {
    const idx = src.indexOf("import ");
    const lineEnd = idx >= 0 ? src.indexOf("\n", idx) : 0;
    src =
      (idx >= 0 ? src.slice(0, lineEnd + 1) : "") +
      'import { toJsonValue } from "@/lib/prisma/json";\n' +
      (idx >= 0 ? src.slice(lineEnd + 1) : src);
  }
  fs.writeFileSync(file, src);
  n++;
}
console.log("fixed", n);
